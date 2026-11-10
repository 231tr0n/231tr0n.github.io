import type { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { loadStaticSnippet } from '../test/static-snippet.js';

const loadGame = () => loadStaticSnippet('tictactoe');

const cell = (dom: JSDOM, id: string) => {
	const element = dom.window.document.getElementById(id);
	if (!element) throw new Error(`Missing cell ${id}`);
	return element;
};

const message = (dom: JSDOM) => dom.window.document.getElementById('message')?.textContent;

const play = (dom: JSDOM, moves: readonly (readonly [number, number])[]) => {
	const calls = moves.map(([row, column]) => `play(${String(row)}, ${String(column)})`);
	dom.window.eval(calls.join(';'));
};

const allCells = Array.from({ length: 3 }, (_, row) =>
	Array.from({ length: 3 }, (_columnIndex, column) => [row, column] as const)
).flat();

const X_WIN_LINES = [
	[
		'top row',
		[
			[0, 0],
			[0, 1],
			[0, 2]
		]
	],
	[
		'middle row',
		[
			[1, 0],
			[1, 1],
			[1, 2]
		]
	],
	[
		'bottom row',
		[
			[2, 0],
			[2, 1],
			[2, 2]
		]
	],
	[
		'left column',
		[
			[0, 0],
			[1, 0],
			[2, 0]
		]
	],
	[
		'middle column',
		[
			[0, 1],
			[1, 1],
			[2, 1]
		]
	],
	[
		'right column',
		[
			[0, 2],
			[1, 2],
			[2, 2]
		]
	],
	[
		'main diagonal',
		[
			[0, 0],
			[1, 1],
			[2, 2]
		]
	],
	[
		'anti diagonal',
		[
			[2, 0],
			[1, 1],
			[0, 2]
		]
	]
] as const;

let dom: JSDOM | undefined;

afterEach(() => {
	dom?.window.close();
});

describe('TicTacToe game', () => {
	it('renders an empty board and live status message', () => {
		dom = loadGame();
		expect(message(dom)).toBe("X's turn");
		expect(dom.window.document.getElementById('message')).toHaveAttribute('role', 'status');
		expect(dom.window.document.getElementById('message')).toHaveAttribute('aria-live', 'polite');
		for (const [row, column] of allCells) {
			const element = cell(dom, `${String(row)}${String(column)}`);
			expect(element.textContent).toBe('');
			expect(element).toHaveAttribute('role', 'button');
			expect(element).toHaveAttribute(
				'aria-label',
				`Row ${String(row + 1)}, column ${String(column + 1)}`
			);
			expect(element.tabIndex).toBe(0);
		}
	});

	it('alternates X and O marks', () => {
		dom = loadGame();
		dom.window.eval('play(0, 0)');
		expect(cell(dom, '00').textContent).toBe('X');
		expect(cell(dom, '00').classList.contains('x')).toBe(true);

		dom.window.eval('play(1, 1)');
		expect(cell(dom, '11').textContent).toBe('O');
		expect(cell(dom, '11').classList.contains('o')).toBe(true);
		expect(message(dom)).toBe("X's turn");
	});

	it('ignores occupied cells and moves after a win', () => {
		dom = loadGame();
		dom.window.eval('play(0, 0)');
		dom.window.eval('play(0, 0)');
		expect(cell(dom, '00').textContent).toBe('X');

		dom.window.eval('play(1, 0); play(0, 1); play(1, 1); play(0, 2)');
		expect(message(dom)).toBe("'X' won");
		expect(dom.window.document.getElementById('game-board')).toHaveClass('game-over');
		for (const [row, column] of allCells) {
			expect(cell(dom, `${String(row)}${String(column)}`)).toHaveAttribute('aria-disabled', 'true');
		}

		dom.window.eval('play(2, 2)');
		expect(cell(dom, '22').textContent).toBe('');
	});

	it('prefers a ninth-move win over a tie', () => {
		dom = loadGame();
		play(dom, [
			[0, 0],
			[0, 2],
			[0, 1],
			[1, 0],
			[1, 1],
			[1, 2],
			[2, 0],
			[2, 1],
			[2, 2]
		]);
		expect(message(dom)).toBe("'X' won");
		expect(dom.window.document.getElementById('game-board')).toHaveClass('game-over');
	});

	it.each(X_WIN_LINES)('detects an X win on the %s', (_caseName, line) => {
		dom = loadGame();
		const fillers = allCells.filter(
			([row, column]) =>
				!line.some(([lineRow, lineColumn]) => lineRow === row && lineColumn === column)
		);
		play(dom, [line[0], fillers[0] ?? [0, 0], line[1], fillers[1] ?? [0, 1], line[2]]);
		expect(message(dom)).toBe("'X' won");
	});

	it('detects an O win', () => {
		dom = loadGame();
		play(dom, [
			[1, 0],
			[0, 0],
			[1, 1],
			[0, 1],
			[2, 0],
			[0, 2]
		]);
		expect(message(dom)).toBe("'O' won");
	});

	it('detects a tie', () => {
		dom = loadGame();
		play(dom, [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 1],
			[1, 0],
			[1, 2],
			[2, 1],
			[2, 0],
			[2, 2]
		]);
		expect(message(dom)).toBe("It's a tie");
		for (const [row, column] of allCells) {
			expect(cell(dom, `${String(row)}${String(column)}`)).toHaveAttribute('aria-disabled', 'true');
		}
	});

	it('resets the board and game-over state through the restart button', () => {
		dom = loadGame();
		dom.window.eval('play(0,0); play(1,0); play(0,1); play(1,1); play(0,2)');
		expect(dom.window.document.getElementById('game-board')).toHaveClass('game-over');

		dom.window.document.getElementById('restart')?.click();
		for (const [row, column] of allCells) {
			const element = cell(dom, `${String(row)}${String(column)}`);
			expect(element.textContent).toBe('');
			expect(element.classList.contains('x')).toBe(false);
			expect(element.classList.contains('o')).toBe(false);
			expect(element).toHaveAttribute(
				'aria-label',
				`Row ${String(row + 1)}, column ${String(column + 1)}`
			);
			expect(element).toHaveAttribute('aria-disabled', 'false');
		}
		expect(dom.window.document.getElementById('game-board')).not.toHaveClass('game-over');
		expect(message(dom)).toBe("X's turn");
		cell(dom, '00').click();
		expect(cell(dom, '00').textContent).toBe('X');
		expect(cell(dom, '00')).toHaveAttribute('aria-disabled', 'true');
		expect(cell(dom, '00').tabIndex).toBe(-1);
	});

	it('plays through cell clicks', () => {
		dom = loadGame();
		expect(message(dom)).toBe("X's turn");
		cell(dom, '00').click();
		expect(cell(dom, '00').textContent).toBe('X');
		expect(cell(dom, '00')).toHaveAttribute('aria-disabled', 'true');
		expect(cell(dom, '00').tabIndex).toBe(-1);
		cell(dom, '11').click();
		expect(cell(dom, '11').textContent).toBe('O');
	});

	it('supports keyboard activation', () => {
		dom = loadGame();
		const element = cell(dom, '00');
		element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(element.textContent).toBe('X');

		cell(dom, '01').dispatchEvent(
			new dom.window.KeyboardEvent('keydown', { key: ' ', bubbles: true })
		);
		expect(cell(dom, '01').textContent).toBe('O');
	});

	it('ignores non-activation keys', () => {
		dom = loadGame();
		const element = cell(dom, '00');
		element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'a', bubbles: true }));
		expect(element.textContent).toBe('');
	});
	it('restores a saved game and clears it on restart', () => {
		dom = loadGame();
		dom.window.eval('play(0, 0); play(1, 1)');
		expect(dom.window.sessionStorage.getItem('tictactoe-game-state')).not.toBeNull();

		dom.window.eval('reset(false)');
		expect(cell(dom, '00').textContent).toBe('');
		dom.window.eval('restoreState()');
		expect(cell(dom, '00').textContent).toBe('X');
		expect(cell(dom, '11').textContent).toBe('O');
		expect(message(dom)).toBe("X's turn");

		dom.window.document.getElementById('restart')?.click();
		expect(dom.window.sessionStorage.getItem('tictactoe-game-state')).toBeNull();
		expect(dom.window.localStorage.getItem('tictactoe-game-state')).toBeNull();
	});
});
