import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { asset, resolve } from '$app/paths';
import { self } from '$app/service-worker';

const CACHE = `cache-${version}`;

// `immutable`/`assets`/`prerendered` paths from `$app/manifest` are relative to
// the base path, so resolve them to absolute pathnames that can be matched
// against `url.pathname` in the `fetch` handler.
const scope = self.registration.scope;

/**
 * @param {string} path
 */
const toPathname = (path) => new URL(path.replace(/^\//, ''), scope).pathname;

const ASSETS = [
	...immutable.map((entry) => toPathname(entry.path)),
	...assets.map((entry) => asset(entry.path)),
	...prerendered.map((entry) => toPathname(entry.path))
];

/**
 * @param {Request} request
 * @param {Response} response
 */
const isCacheable = (request, response) =>
	request.cache !== 'no-store' &&
	response.status === 200 &&
	!request.headers.get('cache-control')?.includes('no-store') &&
	!response.headers.get('cache-control')?.includes('no-store');

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ASSETS);
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await self.clients.claim();
		})()
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const respond = async () => {
		const url = new URL(event.request.url);
		const sameOrigin = url.origin === self.location.origin;
		const cache = await caches.open(CACHE);

		if (sameOrigin && ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);
			if (response) return response;
		}

		try {
			const response = await fetch(event.request);

			if (sameOrigin && isCacheable(event.request, response)) {
				try {
					await cache.put(event.request, response.clone());
				} catch {
					// Cache failures must not affect the network response.
				}
			}

			return response;
		} catch {
			const response = await cache.match(event.request);
			if (response) return response;

			if (event.request.mode === 'navigate') {
				const fallback = await cache.match(resolve('/'));
				if (fallback) return fallback;
			}

			throw new Error('offline');
		}
	};

	event.respondWith(respond());
});
