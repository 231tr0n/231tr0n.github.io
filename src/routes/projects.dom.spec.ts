import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Projects from './projects/+page.svelte';

const repositories = [
	{
		name: 'alpha',
		fork: false,
		languages_url: 'https://api.test/languages/alpha',
		html_url: 'https://github.com/example/alpha',
		description: 'Alpha repository'
	},
	{
		name: 'forked',
		fork: true,
		languages_url: 'https://api.test/languages/forked',
		html_url: 'https://github.com/example/forked',
		description: 'Ignored fork'
	},
	{
		name: 'beta',
		fork: false,
		languages_url: 'https://api.test/languages/beta',
		html_url: 'https://github.com/example/beta',
		description: 'Beta repository'
	}
];

const languages = new Map<string, Record<string, number>>([
	['https://api.test/languages/alpha', { TypeScript: 60, JavaScript: 40 }],
	['https://api.test/languages/beta', { TypeScript: 30, CSS: 10 }]
]);

const defaultFetch = (input: RequestInfo | URL) => {
	const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	if (url.includes('/repos')) {
		return Promise.resolve(new Response(JSON.stringify(repositories)));
	}
	const data = languages.get(url);
	if (!data) return Promise.resolve(new Response('', { status: 404 }));
	return Promise.resolve(new Response(JSON.stringify(data)));
};

const fetchMock = vi.fn(defaultFetch);

beforeEach(() => {
	localStorage.clear();
	fetchMock.mockReset();
	fetchMock.mockImplementation(defaultFetch);
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Projects page', () => {
	it('fetches repositories, aggregates languages and renders posts', async () => {
		render(Projects);
		expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
		expect(screen.getByRole('progressbar')).toBeInTheDocument();

		await screen.findByRole('heading', { name: 'alpha' });
		expect(screen.getByRole('heading', { name: 'beta' })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'forked' })).not.toBeInTheDocument();
		expect(screen.getByText(/TypeScript - 64.29%/)).toBeInTheDocument();
		expect(screen.getByText(/JavaScript - 28.57%/)).toBeInTheDocument();
		expect(screen.getByText(/CSS - 7.14%/)).toBeInTheDocument();
	});

	it('shows rate-limit errors', async () => {
		fetchMock.mockResolvedValue(new Response('', { status: 403 }));
		render(Projects);
		expect(await screen.findByText('GitHub API rate limit exceeded')).toBeInTheDocument();
	});

	it('shows invalid response errors', async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ not: 'an array' })));
		render(Projects);
		expect(await screen.findByText('Invalid API response')).toBeInTheDocument();
	});

	it('shows non-rate-limit HTTP errors', async () => {
		fetchMock.mockResolvedValue(new Response('', { status: 500 }));
		render(Projects);
		expect(await screen.findByText('Fetch failed: 500')).toBeInTheDocument();
	});

	it('shows invalid language responses', async () => {
		fetchMock.mockImplementation((input: RequestInfo | URL) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
			if (url.includes('/repos')) {
				return Promise.resolve(new Response(JSON.stringify(repositories)));
			}
			return Promise.resolve(new Response(JSON.stringify('not an object')));
		});
		render(Projects);
		expect(await screen.findByText('Invalid API response')).toBeInTheDocument();
	});

	it('shows unknown errors for non-Error rejections', async () => {
		fetchMock.mockRejectedValue('offline');
		render(Projects);
		expect(await screen.findByText('Unknown error')).toBeInTheDocument();
	});
});
