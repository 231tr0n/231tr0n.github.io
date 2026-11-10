export const flushMutations = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

export const createStorage = (): Storage => {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
		removeItem: (key: string) => {
			values.delete(key);
		},
		clear: () => {
			values.clear();
		},
		key: (index: number) => [...values.keys()].at(index) ?? null,
		get length() {
			return values.size;
		}
	};
};
