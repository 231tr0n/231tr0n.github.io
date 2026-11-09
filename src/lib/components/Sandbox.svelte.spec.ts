import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sandbox from './Sandbox.svelte';
import { darkMode } from '#lib/utils/dark.svelte.js';
import { sandboxPolicy } from '#lib/constants/app.constants.js';

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

	it('renders a compact frame for embedded games', () => {
		const { container } = render(Sandbox, {
			props: { src: '/game.html', title: 'Game', description: 'A game', compact: true }
		});
		expect(container.querySelector('.frame-wrapper')).toHaveClass('compact');
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
			const srcdoc = iframe.getAttribute('srcdoc') ?? '';
			expect(srcdoc).toContain('<p>Hello</p>');
			expect(srcdoc).toContain('<body>');
			expect(srcdoc).toContain('<style>html { background: #fdf6e3; }</style>');
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
			const srcdoc = iframe.getAttribute('srcdoc') ?? '';
			expect(srcdoc).toContain('<head><style>html { background: #fdf6e3; }</style></head>');
			expect(srcdoc).toContain('<body><p>Hello</p></body>');
		});
	});

	it('wraps a body-only srcdoc', async () => {
		render(Sandbox, {
			props: { srcDoc: '<body><p>Hello</p></body>', title: 'Doc', description: 'Doc' }
		});
		const iframe = screen.getByTitle('Doc');
		await vi.waitFor(() => {
			const srcdoc = iframe.getAttribute('srcdoc') ?? '';
			expect(srcdoc).toContain('<head><style>html { background: #fdf6e3; }</style></head>');
			expect(srcdoc).toContain('<body><p>Hello</p></body>');
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
