import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cacheKeyPrefix, cacheTtl } from '#lib/constants/app.constants.js';
import { createStorage } from '../../test/helpers.js';
import { cachedFetch, HttpError } from './fetch-cache';

const createResponse = (body: string, status = 200): Response => new Response(body, { status });

describe('cachedFetch', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', createStorage());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('fetches and caches a response', async () => {
		const fetchMock = vi.fn(() => Promise.resolve(createResponse('fresh')));
		vi.stubGlobal('fetch', fetchMock);

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(localStorage.getItem(`${cacheKeyPrefix}/data`)).toContain('fresh');
	});

	it('returns a cached response without fetching', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(1_000);
		const fetchMock = vi.fn(() => Promise.resolve(createResponse('network')));
		vi.stubGlobal('fetch', fetchMock);
		localStorage.setItem(
			`${cacheKeyPrefix}/data`,
			JSON.stringify({ data: 'cached', timestamp: 1_000 })
		);

		await expect(cachedFetch('/data')).resolves.toBe('cached');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('refetches when the cache entry is expired', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(cacheTtl + 10);
		const fetchMock = vi.fn(() => Promise.resolve(createResponse('fresh')));
		vi.stubGlobal('fetch', fetchMock);
		localStorage.setItem(`${cacheKeyPrefix}/data`, JSON.stringify({ data: 'stale', timestamp: 0 }));

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(localStorage.getItem(`${cacheKeyPrefix}/data`)).toContain('fresh');
	});

	it('ignores malformed cache entries', async () => {
		const error = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('fresh')))
		);
		localStorage.setItem(`${cacheKeyPrefix}/data`, '{bad json');

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
		expect(error).toHaveBeenCalled();
	});

	it('ignores cache entries with the wrong shape', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('fresh')))
		);
		localStorage.setItem(`${cacheKeyPrefix}/data`, JSON.stringify({ data: 1, timestamp: 'x' }));

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
	});

	it('throws an HttpError when the response is not ok', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('', 500)))
		);

		const request = cachedFetch('/data');
		await expect(request).rejects.toMatchObject({
			name: 'HttpError',
			status: 500,
			message: 'Fetch failed: 500'
		});
		await expect(request).rejects.toBeInstanceOf(HttpError);
	});

	it('ignores non-object JSON cache entries', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('fresh')))
		);
		localStorage.setItem(`${cacheKeyPrefix}/data`, JSON.stringify('value'));

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
	});

	it('continues when reading storage throws', async () => {
		const error = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('read failed');
			},
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('fresh')))
		);

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
		expect(error).toHaveBeenCalled();
	});

	it('continues when writing storage throws', async () => {
		const error = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.stubGlobal('localStorage', {
			getItem: () => null,
			setItem: () => {
				throw new Error('write failed');
			},
			removeItem: vi.fn()
		});
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('fresh')))
		);

		await expect(cachedFetch('/data')).resolves.toBe('fresh');
		expect(error).toHaveBeenCalled();
	});
	it('falls back to the stale entry when the refresh fails', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(cacheTtl + 10);
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('offline')))
		);
		localStorage.setItem(`${cacheKeyPrefix}/data`, JSON.stringify({ data: 'stale', timestamp: 0 }));

		await expect(cachedFetch('/data')).resolves.toBe('stale');
		expect(localStorage.getItem(`${cacheKeyPrefix}/data`)).toContain('stale');
	});
	it('rethrows HTTP errors instead of serving stale data', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(cacheTtl + 10);
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(createResponse('rate limited', 500)))
		);
		localStorage.setItem(`${cacheKeyPrefix}/data`, JSON.stringify({ data: 'stale', timestamp: 0 }));

		await expect(cachedFetch('/data')).rejects.toBeInstanceOf(HttpError);
	});
});
