import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStorage } from '../../test/helpers.js';
import { loadSnippetFiles, snippetBasePath } from './snippet-files';

beforeEach(() => {
	vi.stubGlobal('localStorage', createStorage());
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('loadSnippetFiles', () => {
	it('loads javascript, css and html files', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn((input: RequestInfo | URL) => {
				const url =
					typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
				if (url.endsWith('/storage.js')) return Promise.resolve(new Response('storage'));
				if (url.endsWith('.js')) return Promise.resolve(new Response('js'));
				if (url.endsWith('.css')) return Promise.resolve(new Response('css'));
				return Promise.resolve(new Response('html'));
			})
		);

		await expect(loadSnippetFiles('/snippets/ludo')).resolves.toEqual({
			js: { code: 'js', error: null },
			storage: { code: 'storage', error: null },
			css: { code: 'css', error: null },
			html: { code: 'html', error: null }
		});
	});

	it('captures per-file load failures', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn((input: RequestInfo | URL) => {
				const url =
					typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
				if (url.endsWith('.css')) return Promise.resolve(new Response('', { status: 500 }));
				return Promise.resolve(new Response('ok'));
			})
		);

		const result = await loadSnippetFiles('/snippets/ludo');
		expect(result.js).toEqual({ code: 'ok', error: null });
		expect(result.storage).toEqual({ code: 'ok', error: null });
		expect(result.css).toEqual({ code: null, error: 'Fetch failed: 500' });
		expect(result.html).toEqual({ code: 'ok', error: null });
	});

	it('falls back to a generic error for non-Error rejections', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn((input: RequestInfo | URL) => {
				const url =
					typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
				if (url.endsWith('.js'))
					// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- verifies the non-Error fallback
					return Promise.reject('offline');
				return Promise.resolve(new Response('ok'));
			})
		);

		const result = await loadSnippetFiles('/snippets/ludo');
		expect(result.js).toEqual({ code: null, error: 'Failed to load file' });
		expect(result.storage).toEqual({ code: null, error: 'Failed to load file' });
	});
	it('derives the snippet base path and tolerates a bare filename', () => {
		expect(snippetBasePath('/resources/snippets/ludo/index.html')).toBe('/resources/snippets/ludo');
		expect(snippetBasePath('index.html')).toBe('');
	});
});
