import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Layout from './+layout.svelte';

const state = vi.hoisted(() => ({
	page: {
		url: new URL('http://localhost/games/ludo'),
		route: { id: '/games/ludo' as string | null },
		error: null as Error | null,
		status: 200
	}
}));

vi.mock('$app/state', () => ({ page: state.page }));

const children = createRawSnippet(() => ({
	render: () => '<div>Layout child</div>'
}));

const metaContent = (selector: string) =>
	document.head.querySelector<HTMLMetaElement>(selector)?.content;

afterEach(() => {
	state.page.url = new URL('http://localhost/games/ludo');
	state.page.route.id = '/games/ludo';
	state.page.error = null;
	state.page.status = 200;
});

describe('Layout', () => {
	it('renders navigation, content and footer', async () => {
		render(Layout, { props: { children } });
		expect(await screen.findByText('Layout child')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Clear cache' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
	});

	it('uses the home page title', () => {
		state.page.route.id = '/';
		state.page.url = new URL('http://localhost/');
		render(Layout, { props: { children } });
		expect(metaContent('meta[property="og:title"]')).toBe(
			'231tr0n — Linux Enthusiast, Programmer and Gopher'
		);
		expect(document.head.querySelector('title')?.textContent).toBe(
			'231tr0n — Linux Enthusiast, Programmer and Gopher'
		);
	});

	it('maps known routes to readable titles and urls', () => {
		state.page.route.id = '/games/ludo';
		render(Layout, { props: { children } });
		expect(metaContent('meta[property="og:title"]')).toBe('Ludo — 231tr0n');
		expect(metaContent('meta[property="og:url"]')).toMatch(/\/games\/ludo$/);
		expect(document.head.querySelector('title')?.textContent).toBe('Ludo — 231tr0n');
		expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
			/\/games\/ludo$/
		);
	});

	it('derives a title from the last path segment', () => {
		state.page.route.id = '/somewhere/contact';
		state.page.url = new URL('http://localhost/somewhere/contact');
		render(Layout, { props: { children } });
		expect(metaContent('meta[property="og:title"]')).toBe('Contact — 231tr0n');
	});

	it('omits title metadata on errors but keeps image metadata', () => {
		state.page.error = new Error('missing');
		state.page.status = 500;
		render(Layout, { props: { children } });
		expect(metaContent('meta[property="og:title"]')).toBeUndefined();
		expect(metaContent('meta[name="twitter:title"]')).toBeUndefined();
		expect(document.head.querySelector('title')?.textContent).toBe('500 — 231tr0n');
		expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
		expect(metaContent('meta[property="og:image"]')).toMatch(/\/images\/banner\.avif$/);
	});
});
