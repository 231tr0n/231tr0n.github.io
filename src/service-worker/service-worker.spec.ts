import { beforeEach, describe, expect, it, vi } from 'vitest';

interface WorkerEvent {
	request?: Request;
	data?: unknown;
	respondWith?: (promise: Promise<Response>) => void;
	waitUntil?: (promise: Promise<unknown>) => void;
}

type WorkerListener = (event: WorkerEvent) => void;

const worker = vi.hoisted(() => {
	const listeners = new Map<string, WorkerListener>();
	return {
		listeners,
		selfMock: {
			registration: { scope: 'http://localhost/' },
			location: { origin: 'http://localhost' },
			clients: { claim: vi.fn(() => Promise.resolve()) },
			skipWaiting: vi.fn(() => Promise.resolve()),
			addEventListener: vi.fn((type: string, listener: WorkerListener) => {
				listeners.set(type, listener);
			})
		}
	};
});

vi.mock('$app/env', () => ({ version: 'test-version' }));
vi.mock('$app/manifest', () => ({
	assets: [{ path: 'assets/app.js' }],
	immutable: [{ path: 'immutable/chunk.js' }],
	prerendered: [{ path: 'index.html' }]
}));
vi.mock('$app/paths', () => ({
	asset: (path: string) => `/${path}`,
	resolve: (path: string) => path
}));
vi.mock('$app/service-worker', () => ({ self: worker.selfMock }));

const cache = {
	addAll: vi.fn((paths: string[]) => Promise.resolve(paths)),
	match: vi.fn((_request?: unknown) => Promise.resolve<Response | undefined>(undefined)),
	put: vi.fn((_request: unknown, _response: unknown) => Promise.resolve())
};
const cachesMock = {
	open: vi.fn(() => Promise.resolve(cache)),
	keys: vi.fn(() => Promise.resolve<string[]>(['old-cache', 'cache-test-version'])),
	delete: vi.fn(() => Promise.resolve(true))
};
const fetchMock = vi.fn((_request: Request) => Promise.resolve(new Response('network')));
vi.stubGlobal('caches', cachesMock);
vi.stubGlobal('fetch', fetchMock);

await import('./index.js');

const listenerFor = (type: string): WorkerListener => {
	const listener = worker.listeners.get(type);
	if (!listener) throw new Error(`Missing ${type} listener`);
	return listener;
};

const installEvent = () => {
	let promise: Promise<unknown> | undefined;
	const event: WorkerEvent = {
		waitUntil: (value) => {
			promise = value;
		}
	};
	return { event, promise: () => promise };
};

const respondEvent = (request: Request) => {
	let promise: Promise<Response> | undefined;
	const event: WorkerEvent = {
		request,
		respondWith: (value) => {
			promise = value;
		}
	};
	return { event, promise: () => promise };
};

beforeEach(() => {
	vi.clearAllMocks();
	cache.addAll.mockResolvedValue([]);
	cache.match.mockResolvedValue(undefined);
	cache.put.mockResolvedValue();
	cachesMock.open.mockResolvedValue(cache);
	cachesMock.keys.mockResolvedValue(['old-cache', 'cache-test-version']);
	cachesMock.delete.mockResolvedValue(true);
	fetchMock.mockResolvedValue(new Response('network'));
});

describe('service worker', () => {
	it('precaches immutable, asset and prerendered paths', async () => {
		const { event, promise } = installEvent();
		listenerFor('install')(event);
		await promise();
		expect(cache.addAll).toHaveBeenCalledWith([
			'/immutable/chunk.js',
			'/assets/app.js',
			'/index.html'
		]);
	});

	it('cleans old caches and claims clients on activate', async () => {
		const { event, promise } = installEvent();
		listenerFor('activate')(event);
		await promise();
		expect(cachesMock.delete).toHaveBeenCalledWith('old-cache');
		expect(cachesMock.delete).not.toHaveBeenCalledWith('cache-test-version');
		expect(worker.selfMock.clients.claim).toHaveBeenCalled();
	});

	it('skips waiting on request', async () => {
		const { event, promise } = installEvent();
		listenerFor('message')({ ...event, data: { type: 'SKIP_WAITING' } });
		await promise();
		expect(worker.selfMock.skipWaiting).toHaveBeenCalled();

		worker.selfMock.skipWaiting.mockClear();
		listenerFor('message')({ ...event, data: { type: 'OTHER' } });
		expect(worker.selfMock.skipWaiting).not.toHaveBeenCalled();
	});

	it('fetches a known asset when it is missing from the precache', async () => {
		const network = new Response('network');
		fetchMock.mockResolvedValue(network);
		cache.match.mockResolvedValue(undefined);
		const request = new Request('http://localhost/assets/app.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(network);
		expect(fetchMock).toHaveBeenCalledWith(request);
	});

	it('returns a precached asset without hitting the network', async () => {
		const cached = new Response('cached');
		cache.match.mockResolvedValue(cached);
		const request = new Request('http://localhost/assets/app.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(cached);
		expect(cache.match).toHaveBeenCalledWith('/assets/app.js');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('fetches and caches same-origin responses', async () => {
		const network = new Response('network');
		fetchMock.mockResolvedValue(network);
		const request = new Request('http://localhost/other.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(network);
		expect(cache.put).toHaveBeenCalledWith(request, expect.any(Response));
	});

	it('does not cache no-store requests or responses', async () => {
		const noStoreRequest = new Request('http://localhost/other.js', { cache: 'no-store' });
		const first = respondEvent(noStoreRequest);
		listenerFor('fetch')(first.event);
		await first.promise();
		expect(cache.put).not.toHaveBeenCalled();

		const noStoreResponse = new Response('no store', {
			headers: { 'cache-control': 'no-store' }
		});
		fetchMock.mockResolvedValue(noStoreResponse);
		const second = respondEvent(new Request('http://localhost/other.js'));
		listenerFor('fetch')(second.event);
		await second.promise();
		expect(cache.put).not.toHaveBeenCalled();
	});

	it('falls back to the cache when the network fails', async () => {
		const offline = new Response('offline');
		fetchMock.mockRejectedValue(new Error('offline'));
		cache.match.mockResolvedValue(offline);
		const request = new Request('http://localhost/other.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(offline);
	});

	it('falls back to the root page for failed navigations', async () => {
		const fallback = new Response('index');
		fetchMock.mockRejectedValue(new Error('offline'));
		cache.match.mockImplementation((request?: unknown) =>
			Promise.resolve(request === '/' ? fallback : undefined)
		);
		const request = new Request('http://localhost/missing');
		Object.defineProperty(request, 'mode', { configurable: true, value: 'navigate' });
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(fallback);
	});

	it('does not cache non-200 responses', async () => {
		const failure = new Response('failed', { status: 500 });
		fetchMock.mockResolvedValue(failure);
		const request = new Request('http://localhost/other.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(failure);
		expect(cache.put).not.toHaveBeenCalled();
	});

	it('does not cache request headers marked no-store', async () => {
		const request = new Request('http://localhost/other.js', {
			headers: { 'cache-control': 'no-store' }
		});
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await promise();
		expect(cache.put).not.toHaveBeenCalled();
	});

	it('throws when offline with no cache fallback', async () => {
		fetchMock.mockRejectedValue(new Error('offline'));
		cache.match.mockResolvedValue(undefined);
		const request = new Request('http://localhost/other.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).rejects.toThrow('offline');
	});

	it('throws for a failed navigation without a root fallback', async () => {
		fetchMock.mockRejectedValue(new Error('offline'));
		cache.match.mockResolvedValue(undefined);
		const request = new Request('http://localhost/missing');
		Object.defineProperty(request, 'mode', { configurable: true, value: 'navigate' });
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).rejects.toThrow('offline');
	});

	it('ignores non-GET requests', () => {
		const request = new Request('http://localhost/other.js', { method: 'POST' });
		const respondWith = vi.fn();
		listenerFor('fetch')({ request, respondWith });
		expect(respondWith).not.toHaveBeenCalled();
	});

	it('returns the network response when caching fails', async () => {
		const network = new Response('network');
		fetchMock.mockResolvedValue(network);
		cache.put.mockRejectedValue(new Error('cache write failed'));
		const request = new Request('http://localhost/other.js');
		const { event, promise } = respondEvent(request);
		listenerFor('fetch')(event);
		await expect(promise()).resolves.toBe(network);
	});
});
