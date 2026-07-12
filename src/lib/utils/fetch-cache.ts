import { cacheTtl, cacheKeyPrefix } from '$lib/constants/app.constants';

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
		console.error('Failed to parse cache entry', error);
		return null;
	}
};

export const cachedFetch = async (url: string): Promise<string> => {
	const cacheKey = `${cacheKeyPrefix}${url}`;
	try {
		const raw = localStorage.getItem(cacheKey);
		if (raw !== null) {
			const entry = parseCacheEntry(raw);
			if (entry !== null && Date.now() - entry.timestamp < cacheTtl) return entry.data;
		}
	} catch (error) {
		console.error('Failed to read cache', error);
	}

	const response = await fetch(url);
	if (!response.ok) throw new Error(`Fetch failed: ${String(response.status)}`);
	const text = await response.text();
	try {
		localStorage.setItem(cacheKey, JSON.stringify({ data: text, timestamp: Date.now() }));
	} catch (error) {
		console.error('Failed to write cache', error);
	}
	return text;
};
