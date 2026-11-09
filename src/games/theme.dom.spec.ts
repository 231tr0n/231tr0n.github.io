import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const themePath = resolve(process.cwd(), 'static/resources/snippets/theme.js');

const loadTheme = (systemDark: boolean) => {
	const dom = new JSDOM('<!doctype html><html><body></body></html>', {
		runScripts: 'dangerously',
		url: 'http://localhost/'
	});
	Object.defineProperty(dom.window, 'matchMedia', {
		configurable: true,
		value: (query: string) => ({
			matches: systemDark,
			media: query,
			onchange: null,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			addListener: () => undefined,
			removeListener: () => undefined,
			dispatchEvent: () => true
		})
	});
	const script = dom.window.document.createElement('script');
	script.textContent = `${readFileSync(themePath, 'utf8')}\n//# sourceURL=${pathToFileURL(themePath).href}`;
	dom.window.document.body.appendChild(script);
	return dom;
};

let dom: JSDOM | undefined;

afterEach(() => {
	dom?.window.close();
});

describe('theme bridge script', () => {
	it('starts in light mode when the system is light', () => {
		dom = loadTheme(false);
		expect(dom.window.document.documentElement.classList.contains('dark')).toBe(false);
		expect(dom.window.document.documentElement.style.colorScheme).toBe('light');
	});

	it('starts in dark mode when the system is dark', () => {
		dom = loadTheme(true);
		expect(dom.window.document.documentElement.classList.contains('dark')).toBe(true);
		expect(dom.window.document.documentElement.style.colorScheme).toBe('dark');
	});

	it('switches themes from parent messages', async () => {
		dom = loadTheme(false);
		const themeDom = dom;

		themeDom.window.postMessage({ type: 'theme', dark: true }, '*');
		await vi.waitFor(() => {
			expect(themeDom.window.document.documentElement.classList.contains('dark')).toBe(true);
		});
		expect(themeDom.window.document.documentElement.style.colorScheme).toBe('dark');

		themeDom.window.postMessage({ type: 'theme', dark: false }, '*');
		await vi.waitFor(() => {
			expect(themeDom.window.document.documentElement.classList.contains('dark')).toBe(false);
		});
		expect(themeDom.window.document.documentElement.style.colorScheme).toBe('light');
	});

	it('ignores malformed messages but accepts a later valid message', () => {
		dom = loadTheme(false);
		const themeDom = dom;
		const dispatch = (data: unknown) => {
			themeDom.window.dispatchEvent(new themeDom.window.MessageEvent('message', { data }));
		};

		dispatch({ type: 'not-theme', dark: true });
		dispatch({ type: 'theme', dark: 'yes' });
		dispatch(null);
		expect(themeDom.window.document.documentElement.classList.contains('dark')).toBe(false);

		dispatch({ type: 'theme', dark: true });
		expect(themeDom.window.document.documentElement.classList.contains('dark')).toBe(true);
	});
});
