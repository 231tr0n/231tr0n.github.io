import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sandbox from './Sandbox.svelte';
import { darkMode } from '#lib/utils/dark.svelte.js';
import { sandboxPolicy, trustedSandboxPolicy } from '#lib/constants/app.constants.js';

const themeStyle = (dark = false) =>
	`<style>html { background: Canvas; color-scheme: ${dark ? 'dark' : 'light'}; }</style>`;

beforeEach(() => {
	darkMode().dark = false;
	document.body.classList.remove('dark');
});

afterEach(() => {
	darkMode().dark = true;
	document.body.classList.remove('dark');
	vi.restoreAllMocks();
});

describe('Sandbox', () => {
	it('renders a sandboxed iframe with frame metadata', () => {
		render(Sandbox, {
			props: { src: '/game.html', title: 'Game', description: 'A game' }
		});
		const iframe = screen.getByTitle('Game');
		expect(iframe).toHaveAttribute('src', '/game.html');
		expect(iframe).toHaveAttribute('sandbox', sandboxPolicy);
		expect(screen.getByText('Sandbox')).toBeInTheDocument();
		expect(screen.getByText('A game')).toBeInTheDocument();
	});

	it('grants same-origin storage when explicitly trusted', () => {
		render(Sandbox, {
			props: {
				src: '/game.html',
				title: 'Game',
				description: 'A game',
				allowSameOrigin: true
			}
		});
		expect(screen.getByTitle('Game')).toHaveAttribute('sandbox', trustedSandboxPolicy);
	});

	it('keeps user HTML on the strict policy even when trusted is requested', () => {
		render(Sandbox, {
			props: {
				srcDoc: '<p>user</p>',
				title: 'Output',
				description: '',
				allowSameOrigin: true
			}
		});
		expect(screen.getByTitle('Output')).toHaveAttribute('sandbox', sandboxPolicy);
	});

	it('wires the fullscreen button to the frame', async () => {
		const requestFullscreen = vi
			.spyOn(HTMLElement.prototype, 'requestFullscreen')
			.mockImplementation(async () => undefined);
		render(Sandbox, {
			props: { src: '/game.html', title: 'Game', description: 'A game', compact: true }
		});
		screen.getByRole('button', { name: 'Toggle fullscreen' }).click();
		await vi.waitFor(() => {
			expect(requestFullscreen).toHaveBeenCalled();
		});
	});

	it('renders a compact frame for embedded games', () => {
		const { container } = render(Sandbox, {
			props: { src: '/game.html', title: 'Game', description: 'A game', compact: true }
		});
		expect(container.querySelector('.frame-wrapper')).toHaveClass('compact');
		expect(screen.getByRole('button', { name: 'Toggle fullscreen' })).toBeInTheDocument();
	});

	it('posts theme changes and load events into the iframe', async () => {
		render(Sandbox, {
			props: { src: '/game.html', title: 'Game', description: 'A game' }
		});
		const iframe = screen.getByTitle('Game');
		const postMessage = vi.fn();
		Object.defineProperty(iframe, 'contentWindow', {
			configurable: true,
			value: { postMessage }
		});

		darkMode().dark = true;
		await tick();
		expect(postMessage).toHaveBeenCalledWith({ type: 'theme', dark: true }, '*');

		postMessage.mockClear();
		document.body.classList.add('dark');
		iframe.dispatchEvent(new Event('load'));
		expect(postMessage).toHaveBeenCalledWith({ type: 'theme', dark: true }, '*');

		postMessage.mockClear();
		document.body.classList.remove('dark');
		iframe.dispatchEvent(new Event('load'));
		expect(postMessage).toHaveBeenCalledWith({ type: 'theme', dark: false }, '*');
	});

	it('injects a themed background into background-less srcdoc', async () => {
		render(Sandbox, {
			props: { srcDoc: '<p>Hello</p>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBe(
				`<html><head>${themeStyle()}</head><body><p>Hello</p></body></html>`
			);
		});
	});

	it('handles srcdoc that already has an html element', async () => {
		render(Sandbox, {
			props: {
				srcDoc: '<html><body><p>Hello</p></body></html>',
				title: 'Doc',
				description: 'Doc'
			}
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBe(
				`<html><head>${themeStyle()}</head><body><p>Hello</p></body></html>`
			);
		});
	});

	it('inserts the theme into an existing head element', async () => {
		render(Sandbox, {
			props: {
				srcDoc: '<html><head><meta charset="utf-8" /></head><body><p>Hello</p></body></html>',
				title: 'Doc',
				description: 'Doc'
			}
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBe(
				`<html><head>${themeStyle()}<meta charset="utf-8" /></head><body><p>Hello</p></body></html>`
			);
		});
	});

	it('wraps a body-only srcdoc', async () => {
		render(Sandbox, {
			props: { srcDoc: '<body><p>Hello</p></body>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBe(
				`<html><head>${themeStyle()}</head><body><p>Hello</p></body></html>`
			);
		});
	});

	it('uses a dark color scheme when the site is dark', async () => {
		darkMode().dark = true;
		document.body.classList.add('dark');
		render(Sandbox, {
			props: { srcDoc: '<p>Hello</p>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toContain(themeStyle(true));
		});
	});

	it('does not treat a header element as the document head', async () => {
		render(Sandbox, {
			props: { srcDoc: '<header>Title</header><p>Hello</p>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			const srcdoc = iframe.getAttribute('srcdoc') ?? '';
			expect(srcdoc).toContain('<header>Title</header><p>Hello</p>');
			expect(srcdoc.indexOf('<style>')).toBeLessThan(srcdoc.indexOf('<header>'));
		});
	});

	it('clears the iframe when srcdoc is removed', async () => {
		const { rerender } = render(Sandbox, {
			props: { srcDoc: '<p>Hello</p>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toContain('<p>Hello</p>');
		});
		await rerender({ title: 'Doc', description: 'Doc', srcDoc: '' });
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBeNull();
		});
	});

	it('leaves srcdoc with an inline body background untouched', async () => {
		const srcDoc = '<body style="background: red"><p>Hello</p></body>';
		render(Sandbox, {
			props: { srcDoc, title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			expect(iframe.getAttribute('srcdoc')).toBe(srcDoc);
		});
	});

	it('leaves srcdoc with a CSS background untouched', async () => {
		const srcDoc = '<style>body { background: red; }</style><p>Hello</p>';
		render(Sandbox, { props: { srcDoc, title: 'CSS', description: 'Doc' } });
		await vi.waitFor(() => {
			expect(screen.getByTitle('CSS').getAttribute('srcdoc')).toBe(srcDoc);
		});
	});

	it('leaves srcdoc with an html background untouched', async () => {
		const srcDoc = '<html style="background: red"><p>Hello</p></html>';
		render(Sandbox, { props: { srcDoc, title: 'HTML', description: 'Doc' } });
		await vi.waitFor(() => {
			expect(screen.getByTitle('HTML').getAttribute('srcdoc')).toBe(srcDoc);
		});
	});
});
