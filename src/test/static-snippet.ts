import { JSDOM } from 'jsdom';
import ludoHtml from '../../static/resources/snippets/ludo/index.html?raw';
import ludoScript from '../../static/resources/snippets/ludo/index.js?raw';
import tictactoeHtml from '../../static/resources/snippets/tictactoe/index.html?raw';
import tictactoeScript from '../../static/resources/snippets/tictactoe/index.js?raw';

export const loadStaticSnippet = (name: 'ludo' | 'tictactoe'): JSDOM => {
	const { html, script: source } =
		name === 'ludo'
			? { html: ludoHtml, script: ludoScript }
			: { html: tictactoeHtml, script: tictactoeScript };
	const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
	const script = dom.window.document.createElement('script');
	script.textContent = source;
	dom.window.document.body.appendChild(script);
	return dom;
};
