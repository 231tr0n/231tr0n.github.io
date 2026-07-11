const CACHE_TTL = 86400000;

interface CacheEntry {
	data: string;
	timestamp: number;
}

export const cachedFetch = async (url: string): Promise<string> => {
	const cacheKey = `fetch:${url}`;
	try {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			const entry = JSON.parse(cached) as CacheEntry;
			if (Date.now() - entry.timestamp < CACHE_TTL) {
				return entry.data;
			}
		}
	} catch {
		// ignore
	}

	const response = await fetch(url);
	if (!response.ok) throw new Error(`Fetch failed: ${String(response.status)}`);
	const data = await response.text();
	try {
		localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
	} catch {
		// ignore
	}
	return data;
};
