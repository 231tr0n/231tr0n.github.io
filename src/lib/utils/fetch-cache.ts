const CACHE_TTL = 86400000;

interface CacheEntry {
	data: string;
	timestamp: number;
}

export const cachedFetch = async (url: string): Promise<string> => {
	const cacheKey = `fetch:${url}`;
	try {
		const cached = localStorage.getItem(cacheKey);
		if (cached != null) {
			const parsed: unknown = JSON.parse(cached);
			if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid cache');
			const rawData = 'data' in parsed ? parsed.data : null;
			const rawTimestamp = 'timestamp' in parsed ? parsed.timestamp : null;
			if (typeof rawData !== 'string' || typeof rawTimestamp !== 'number')
				throw new Error('Invalid cache');
			const entry: CacheEntry = { data: rawData, timestamp: rawTimestamp };
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
