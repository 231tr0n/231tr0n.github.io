import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ludoCss = readFileSync('static/resources/snippets/ludo/style.css', 'utf8');
const ludoJs = readFileSync('static/resources/snippets/ludo/index.js', 'utf8');
const gameCss = [
	ludoCss,
	readFileSync('static/resources/snippets/tictactoe/style.css', 'utf8')
].join('\n');
const tokenCss = readFileSync('static/resources/snippets/everforest.css', 'utf8');
const page = readFileSync('src/lib/components/Page.svelte', 'utf8');
const select = readFileSync('src/lib/components/Select.svelte', 'utf8');
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

	it('never hides game UI with display none', () => {
		const hiddenRules = gameCss.match(/[^{}]+\{[^}]*display:\s*none[^}]*\}/g) ?? [];
		expect(hiddenRules.length).toBeGreaterThan(0);
		for (const rule of hiddenRules) expect(rule).toMatch(/\[hidden\][^{]*\{/);
	});

	it('centers the dice and gives it an enabled pulse', () => {
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*position:\s*absolute/s);
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*inset:\s*0/s);
		expect(ludoCss).toMatch(/\.dice\s*\{[^}]*margin:\s*auto/s);
		expect(ludoCss).toMatch(/\.dice:not\(:disabled\)[^{]*\{[^}]*animation:\s*dice-ready/s);
		expect(ludoCss).toMatch(/\.dice:disabled[^{]*\{[^}]*pointer-events:\s*none/s);
		expect(ludoCss).toMatch(
			/@media \(max-width: 380px\), \(max-height: 430px\)[\s\S]*?\.dice\s*\{[^}]*clamp\(15px/s
		);
		const reducedMotionMatch = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(
			ludoCss
		);
		const reducedMotion = reducedMotionMatch?.[1] ?? '';
		expect(reducedMotion).toMatch(/\.token\.movable,/);
		expect(reducedMotion).toMatch(/\.token\.movable\.in-base,/);
		expect(reducedMotion).toMatch(/\.dice:not\(:disabled\),/);
		expect(reducedMotion).toMatch(/\.dice\.rolling \{/);
		expect(reducedMotion).toMatch(/animation:\s*none/);
		expect(reducedMotion).toMatch(/transition:\s*none/);
		expect(reducedMotion).toMatch(/\.primary:hover[\s\S]*transform:\s*none/);
		expect(ludoCss).toMatch(/\.token::before\s*\{[^}]*inset:\s*-20%/s);
		expect(ludoCss).toMatch(
			/\.token\.approach::before,[\s\S]*?\.token\.finished::before\s*\{[^}]*inset:\s*min\(-20%,\s*-8px\)/s
		);
	});

	it('stops the loading spinner for reduced motion', () => {
		const loading = componentSources.find((source) => source.includes('@keyframes spin'));
		expect(loading).toBeDefined();
		expect(loading).toMatch(
			/@media \(prefers-reduced-motion: reduce\) \{\s*\.bar\s*\{[^}]*animation:\s*none/s
		);
	});

	it('keeps the smallest dice clear of the approach square', () => {
		const smallDice =
			/@media \(max-width: 380px\), \(max-height: 430px\)[\s\S]*?\.dice\s*\{[^}]*clamp\((\d+)px/s.exec(
				ludoCss
			);
		const minDice = Number(smallDice?.[1]);
		const approachBlock = /const CENTER_APPROACHES = \[([\s\S]*?)\];/.exec(ludoJs)?.[1] ?? '';
		const approaches = [...approachBlock.matchAll(/\[([\d.]+), ([\d.]+)\]/g)].map((match) => ({
			column: Number(match[1]),
			row: Number(match[2])
		}));
		const tokenWidth =
			/\.token\.approach,\s*\.token\.finished\s*\{[^}]*clamp\([^,]+,\s*([\d.]+)%/s.exec(ludoCss);
		const tokenPercent = Number(tokenWidth?.[1]);
		const diceReady = /@keyframes dice-ready \{([\s\S]*?)\n\}/.exec(ludoCss)?.[1] ?? '';
		const pulseScale = Math.max(
			...[...diceReady.matchAll(/scale\(([\d.]+)\)/g)].map((match) => Number(match[1]))
		);
		expect(minDice).toBeGreaterThan(0);
		expect(approaches).toHaveLength(4);
		expect(tokenPercent).toBeGreaterThan(0);
		expect(pulseScale).toBeGreaterThan(1);
		// Worst case: a 320x240 game gives a board of 50vh = 120px.
		const board = 120;
		const diceHalf = (minDice * pulseScale) / 2;
		const tokenHalf = (board * (tokenPercent / 100)) / 2;
		for (const { column, row } of approaches) {
			const approachDistance = (Math.hypot(column - 7.5, row - 7.5) / 15) * board;
			expect(diceHalf + tokenHalf).toBeLessThan(approachDistance);
		}
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

	it('keeps Select menu options on one line at least as wide as the control', () => {
		expect(select).toMatch(/\.select-menu\s*\{[^}]*min-width:\s*100%/s);
		expect(select).toMatch(/div\.select-menu button\s*\{[^}]*white-space:\s*nowrap/s);
		expect(select).toMatch(/div\.select-menu button\s*\{[^}]*min-height:\s*24px/s);
		expect(select).toMatch(/\.content\s*\{[^}]*flex:\s*1/s);
	});

	it('keeps the compact frame chrome and fullscreen visible', () => {
		expect(frame).not.toMatch(/compact[^}]*display:\s*none/s);
		expect(frame).toMatch(/\.filename\s*\{/);
		expect(frame).toMatch(/\.context\s*\{/);
		expect(sandbox).toContain('min-height: 360px');
		expect(sandbox).toMatch(/:fullscreen[^}]*display:\s*flex/s);
	});
});
