import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const readFixture = (path: string): string => {
	// eslint-disable-next-line security/detect-non-literal-fs-filename -- checked-in test fixture paths
	return readFileSync(path, 'utf8');
};

export const loadStaticSnippet = (htmlRelativePath: string, jsRelativePath: string): JSDOM => {
	const root = process.cwd();
	const htmlPath = resolve(root, htmlRelativePath);
	const jsPath = resolve(root, jsRelativePath);
	const html = readFixture(htmlPath).replace(/<script[^>]*><\/script>/g, '');
	const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
	const script = dom.window.document.createElement('script');
	script.textContent = `${readFixture(jsPath)}\n//# sourceURL=${pathToFileURL(jsPath).href}`;
	dom.window.document.body.appendChild(script);
	return dom;
};
