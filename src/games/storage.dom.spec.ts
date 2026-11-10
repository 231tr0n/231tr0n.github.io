import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import storageSource from '../../static/resources/snippets/storage.js?raw';
import ludoHtml from '../../static/resources/snippets/ludo/index.html?raw';
import tictactoeHtml from '../../static/resources/snippets/tictactoe/index.html?raw';

interface SnippetStorageHandle {
	read: () => string | null;
	write: (value: string) => void;
	clear: () => void;
}

type SnippetWindow = Window & {
	createSnippetStorage: (key: string) => SnippetStorageHandle;
};

const snippetWindow = (dom: JSDOM) => dom.window as unknown as SnippetWindow;

const load = () => {
	const dom = new JSDOM('', { runScripts: 'dangerously', url: 'http://localhost/' });
	const script = dom.window.document.createElement('script');
	script.textContent = storageSource;
	dom.window.document.body.appendChild(script);
	return dom;
};

describe('snippet storage module', () => {
	it('is loaded by both game documents before their script', () => {
		expect(ludoHtml).toContain('<script src="../storage.js"></script>');
		expect(tictactoeHtml).toContain('<script src="../storage.js"></script>');
		expect(ludoHtml.indexOf('../storage.js')).toBeLessThan(ludoHtml.indexOf('src="index.js"'));
		expect(tictactoeHtml.indexOf('../storage.js')).toBeLessThan(
			tictactoeHtml.indexOf('src="index.js"')
		);
	});

	it('writes to both stores and prefers the session value', () => {
		const dom = load();
		const storage = snippetWindow(dom).createSnippetStorage('game');
		storage.write('first');
		expect(dom.window.sessionStorage.getItem('game')).toBe('first');
		expect(dom.window.localStorage.getItem('game')).toBe('first');
		dom.window.sessionStorage.setItem('game', 'session');
		dom.window.localStorage.setItem('game', 'persistent');
		expect(storage.read()).toBe('session');
		dom.window.sessionStorage.clear();
		expect(storage.read()).toBe('persistent');
		storage.clear();
		expect(dom.window.sessionStorage.getItem('game')).toBeNull();
		expect(dom.window.localStorage.getItem('game')).toBeNull();
	});

	it('still persists and clears when session storage throws', () => {
		const dom = load();
		Object.defineProperty(dom.window, 'sessionStorage', {
			configurable: true,
			get() {
				throw new Error('blocked');
			}
		});
		const storage = snippetWindow(dom).createSnippetStorage('game');
		expect(storage.read()).toBeNull();
		storage.write('persistent');
		expect(dom.window.localStorage.getItem('game')).toBe('persistent');
		expect(storage.read()).toBe('persistent');
		storage.clear();
		expect(dom.window.localStorage.getItem('game')).toBeNull();
	});

	it('still uses session storage when local storage throws', () => {
		const dom = load();
		Object.defineProperty(dom.window, 'localStorage', {
			configurable: true,
			get() {
				throw new Error('blocked');
			}
		});
		const storage = snippetWindow(dom).createSnippetStorage('game');
		storage.write('session');
		expect(dom.window.sessionStorage.getItem('game')).toBe('session');
		expect(storage.read()).toBe('session');
		storage.clear();
		expect(dom.window.sessionStorage.getItem('game')).toBeNull();
	});
});
