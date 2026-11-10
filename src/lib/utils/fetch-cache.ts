import { cacheTtl, cacheKeyPrefix } from '#lib/constants/app.constants.js';

const parseCacheEntry = (raw: string): { data: string; timestamp: number } | null => {
	try {
		const obj = JSON.parse(raw) as unknown;
		if (typeof obj !== 'object' || obj === null) return null;
		const entry = obj as { data?: unknown; timestamp?: unknown };
		if (typeof entry.data === 'string' && typeof entry.timestamp === 'number') {
			return { data: entry.data, timestamp: entry.timestamp };
		}
		return null;
	} catch (error) {
		console.warn('Failed to parse cache entry', error);
		return null;
	}
};

export class HttpError extends Error {
	public readonly status: number;

	public constructor(status: number) {
		super(`Fetch failed: ${String(status)}`);
		this.name = 'HttpError';
		this.status = status;
	}
}

export const cachedFetch = async (url: string): Promise<string> => {
	const cacheKey = `${cacheKeyPrefix}${url}`;
	let stale: string | null = null;
	try {
		const raw = localStorage.getItem(cacheKey);
		if (raw !== null) {
			const entry = parseCacheEntry(raw);
			if (entry === null) {
				try {
					localStorage.removeItem(cacheKey);
				} catch {
					// Ignore unavailable storage.
				}
			} else if (Date.now() - entry.timestamp < cacheTtl) return entry.data;
			else stale = entry.data;
		}
	} catch (error) {
		console.warn('Failed to read cache', error);
	}

	try {
		const response = await fetch(url);
		if (!response.ok) throw new HttpError(response.status);
		const text = await response.text();
		try {
			localStorage.setItem(cacheKey, JSON.stringify({ data: text, timestamp: Date.now() }));
		} catch (error) {
			console.warn('Failed to write cache', error);
		}
		return text;
	} catch (error) {
		if (stale !== null && !(error instanceof HttpError)) return stale;
		throw error;
	}
};
