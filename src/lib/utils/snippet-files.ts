import type { FileState } from '#lib/types/index.js';
import { cachedFetch } from './fetch-cache';

interface SnippetFileStates {
	js: FileState;
	css: FileState;
	html: FileState;
}

const toFileState = (result: PromiseSettledResult<string>): FileState => {
	if (result.status === 'fulfilled') return { code: result.value, error: null };
	return {
		code: null,
		error: result.reason instanceof Error ? result.reason.message : 'Failed to load file'
	};
};

export const loadSnippetFiles = async (basePath: string): Promise<SnippetFileStates> => {
	const results = await Promise.allSettled([
		cachedFetch(`${basePath}/index.js`),
		cachedFetch(`${basePath}/style.css`),
		cachedFetch(`${basePath}/index.html`)
	]);
	return {
		js: toFileState(results[0]),
		css: toFileState(results[1]),
		html: toFileState(results[2])
	};
};
