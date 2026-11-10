import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ludoCss = readFileSync('static/resources/snippets/ludo/style.css', 'utf8');
const gameCss = [
	ludoCss,
	readFileSync('static/resources/snippets/tictactoe/style.css', 'utf8')
].join('\n');
const tokenCss = readFileSync('static/resources/snippets/everforest.css', 'utf8');
const page = readFileSync('src/lib/components/Page.svelte', 'utf8');
const frame = readFileSync('src/lib/components/Frame.svelte', 'utf8');
const sandbox = readFileSync('src/lib/components/Sandbox.svelte', 'utf8');
const componentSources = Object.values({
	...import.meta.glob('/src/lib/components/**/*.svelte', {
		query: '?raw',
		import: 'default',
		eager: true
	}),
	...import.meta.glob('/src/routes/**/*.svelte', {
		query: '?raw',
		import: 'default',
		eager: true
	})
}) as string[];
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
		for (const source of [gameCss, ...componentSources]) {
			expect(source).not.toMatch(/--ef-/);
			expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
		}
	});

	it('never hides Ludo UI responsively', () => {
		expect(gameCss).not.toMatch(
			/(?:\.brand|\.player-name|\.player-strip|\.turn|\.home-count|\.move-button-label|\.subtitle|\.hint)[^{]*\{[^}]*display:\s*none/s
		);
	});

	it('centers the dice and gives it an enabled pulse', () => {
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*position:\s*absolute/s);
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*inset:\s*0/s);
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*margin:\s*auto/s);
		expect(ludoCss).toMatch(/\.dice:not\(:disabled\)[^{]*\{[^}]*animation:\s*dice-ready/s);
		expect(ludoCss).toMatch(
			/prefers-reduced-motion[\s\S]*\.token\.movable[\s\S]*animation:\s*none/
		);
		expect(ludoCss).toMatch(
			/prefers-reduced-motion[\s\S]*\.token\.movable\.in-base[\s\S]*animation:\s*none/
		);
		expect(ludoCss).toMatch(/prefers-reduced-motion[\s\S]*\.dice\.rolling[\s\S]*animation:\s*none/);
		expect(ludoCss).toMatch(
			/prefers-reduced-motion[\s\S]*\.dice:not\(:disabled\)[\s\S]*animation:\s*none/
		);
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

	it('keeps the compact frame chrome and fullscreen visible', () => {
		expect(frame).not.toMatch(/compact[^}]*display:\s*none/s);
		expect(frame).toMatch(/\.filename\s*\{/);
		expect(frame).toMatch(/\.context\s*\{/);
		expect(sandbox).toContain('min-height: 360px');
		expect(sandbox).toMatch(/:fullscreen[^}]*display:\s*flex/s);
	});
});
