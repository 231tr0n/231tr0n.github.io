import type { FileState } from '#lib/types/index.js';
import { cachedFetch } from './fetch-cache';

interface SnippetFileStates {
	js: FileState;
	storage: FileState;
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

export const snippetBasePath = (indexHtml: string): string => {
	const slash = indexHtml.lastIndexOf('/');
	return slash === -1 ? '' : indexHtml.slice(0, slash);
};

const parentPath = (path: string): string => {
	const slash = path.lastIndexOf('/');
	return slash === -1 ? '' : path.slice(0, slash);
};

export const loadSnippetFiles = async (basePath: string): Promise<SnippetFileStates> => {
	const results = await Promise.allSettled([
		cachedFetch(`${basePath}/index.js`),
		cachedFetch(`${parentPath(basePath)}/storage.js`),
		cachedFetch(`${basePath}/style.css`),
		cachedFetch(`${basePath}/index.html`)
	]);
	return {
		js: toFileState(results[0]),
		storage: toFileState(results[1]),
		css: toFileState(results[2]),
		html: toFileState(results[3])
	};
};
