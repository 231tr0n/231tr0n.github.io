import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const gameCss = [
	readFileSync('static/resources/snippets/ludo/style.css', 'utf8'),
	readFileSync('static/resources/snippets/tictactoe/style.css', 'utf8')
].join('\n');
const tokenCss = readFileSync('static/resources/snippets/everforest.css', 'utf8');
const page = readFileSync('src/lib/components/Page.svelte', 'utf8');
const frame = readFileSync('src/lib/components/Frame.svelte', 'utf8');
const main = readFileSync('src/lib/css/main.css', 'utf8');

const definitions = new Set(
	[...`${tokenCss}\n${gameCss}`.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1])
);
const usages = new Set([...gameCss.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]));

describe('semantic color tokens', () => {
	it('defines every variable used by the game styles', () => {
		for (const usage of usages) expect(definitions.has(usage), usage).toBe(true);
	});

	it('keeps components free of Everforest and raw colors', () => {
		expect(gameCss).not.toMatch(/--ef-/);
		expect(gameCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
	});

	it('maps the site anchor through the palette', () => {
		expect(main).toContain('--color-anchor: var(--color-everforest-light-orange);');
		expect(main).toContain('--color-anchor: var(--color-everforest-dark-orange);');
	});
});

describe('layout contracts', () => {
	it('keeps the scrollspy sticky', () => {
		expect(page).toMatch(/h4\s*\{[^}]*position:\s*sticky/s);
		expect(page).toMatch(/h4\s*\{[^}]*top:\s*0/s);
	});

	it('keeps the compact frame chrome visible', () => {
		expect(frame).not.toMatch(/compact[^}]*display:\s*none/s);
		expect(frame).toMatch(/\.filename\s*\{/);
		expect(frame).toMatch(/\.context\s*\{/);
	});
});
