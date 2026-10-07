import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { resolve } from '$app/paths';
import { self } from '$app/service-worker';

const CACHE = `cache-${version}`;

// `immutable`/`assets`/`prerendered` paths from `$app/manifest` are relative to
// the base path, so resolve them to absolute pathnames that can be matched
// against `url.pathname` in the `fetch` handler
const ASSETS = [
	...immutable.map((entry) => resolve(entry.path)),
	...assets.map((entry) => resolve(entry.path)),
	...prerendered.map((entry) => resolve(entry.path))
];

self.addEventListener('install', (event) => {
	const addFilesToCache = async () => {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	};

	event.waitUntil(addFilesToCache());
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	const deleteOldCaches = async () => {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	};

	event.waitUntil(deleteOldCaches());
	self.clients.claim();
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const respond = async () => {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);
			if (response) return response;
		}

		try {
			const response = await fetch(event.request);

			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			const response = await cache.match(event.request);
			if (response) return response;

			if (url.pathname.startsWith('/') && url.pathname.endsWith('/')) {
				const fallback = await cache.match(resolve('/'));
				if (fallback) return fallback;
			}

			throw new Error('offline');
		}
	};

	event.respondWith(respond());
});
