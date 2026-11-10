import type { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadStaticSnippet } from '../test/static-snippet.js';

const loadLudo = (storage?: {
	session?: Record<string, string>;
	local?: Record<string, string>;
}) => {
	const dom = loadStaticSnippet('ludo', storage);
	Object.defineProperty(dom.window, 'setTimeout', {
		configurable: true,
		value: (handler: TimerHandler) => {
			if (typeof handler === 'function') Reflect.apply(handler, dom.window, []);
			return 0;
		}
	});
	return dom;
};

const setDie = (dom: JSDOM, value: number) => {
	Object.defineProperty(dom.window.crypto, 'getRandomValues', {
		configurable: true,
		value: (array: Uint32Array) => {
			array[0] = value - 1;
			return array;
		}
	});
};

let dom: JSDOM | undefined;

const getDom = (): JSDOM => {
	if (!dom) throw new Error('Ludo was not loaded');
	return dom;
};

const run = <T>(expression: string): T => getDom().window.eval(expression) as T;

const runAsync = async (expression: string): Promise<void> => {
	await Promise.resolve(getDom().window.eval(expression));
};

beforeEach(() => {
	dom = loadLudo();
});

afterEach(() => {
	dom?.window.close();
});

describe('Ludo game', () => {
	it('starts on the setup screen with a player-count selector', () => {
		expect(run<string>('state.phase')).toBe('setup');
		expect(dom?.window.document.querySelectorAll('.count-button')).toHaveLength(3);
		expect(run<boolean>('setupScreen.hidden')).toBe(false);
		expect(run<boolean>('gameScreen.hidden')).toBe(true);
		expect(
			dom?.window.document.querySelector<HTMLElement>('.count-button[data-count="4"]')
		).toHaveAttribute('aria-pressed', 'true');
		expect(
			dom?.window.document.querySelector<HTMLElement>('.count-button[data-count="2"]')
		).toHaveAttribute('aria-pressed', 'false');
	});

	it('builds the standard start positions for every player count', () => {
		expect(run<number[]>('Array.from({length: 2}, (_, i) => startIndexFor(i, 2))')).toEqual([
			0, 26
		]);
		expect(run<number[]>('Array.from({length: 3}, (_, i) => startIndexFor(i, 3))')).toEqual([
			0, 13, 26
		]);
		expect(run<number[]>('Array.from({length: 4}, (_, i) => startIndexFor(i, 4))')).toEqual([
			0, 13, 26, 39
		]);
	});

	it('marks all eight classic safe squares', () => {
		for (const count of [2, 3, 4]) {
			run(`startGame(${String(count)})`);
			expect(run<number[]>('[...state.safe].sort((a, b) => a - b)')).toEqual([
				0, 8, 13, 21, 26, 34, 39, 47
			]);
		}
	});

	it('maps the four seats to classic corner starts and home lanes', () => {
		expect(run<number[][]>('START_INDICES.map((index) => PATH[index])')).toEqual([
			[1, 6],
			[8, 1],
			[13, 8],
			[6, 13]
		]);
		const adjacent = run<boolean[]>(`START_INDICES.map((start, seat) => {
			const last = PATH[(start + LAST_RING_POS) % RING_SIZE];
			const entry = HOME_LANES[seat][0];
			return Math.abs(last[0] - entry[0]) + Math.abs(last[1] - entry[1]) === 1;
		})`);
		expect(adjacent).toEqual([true, true, true, true]);
		expect(run<number[]>('HOME_LANES.map((lane) => lane.length)')).toEqual([5, 5, 5, 5]);
		const loop = run<{ unique: number; contiguous: boolean; bounds: boolean }>(`(() => {
			const unique = new Set(PATH.map(([column, row]) => column + ',' + row)).size;
			const contiguous = PATH.every(([column, row], index) => {
				const [nextColumn, nextRow] = PATH[(index + 1) % PATH.length];
				return Math.max(Math.abs(nextColumn - column), Math.abs(nextRow - row)) === 1;
			});
			const bounds = PATH.every(([column, row]) => column >= 0 && column < 15 && row >= 0 && row < 15);
			return { unique, contiguous, bounds };
		})()`);
		expect(loop).toEqual({ unique: 52, contiguous: true, bounds: true });
	});

	it('uses opposite corners for two players', () => {
		run('startGame(2)');
		expect(
			run<string[]>('playerEls.map((el) => el.querySelector(".player-name").textContent)')
		).toEqual(['Red', 'Yellow']);
		expect(
			run<boolean[]>(
				'playerEls.map((el) => el.classList.contains("p0") || el.classList.contains("p2"))'
			)
		).toEqual([true, true]);
		expect(run<boolean>('playerEls.at(1).classList.contains("p2")')).toBe(true);
		run('startGame(3)');
		expect(
			run<string[]>('playerEls.map((el) => el.querySelector(".player-name").textContent)')
		).toEqual(['Red', 'Green', 'Yellow']);
	});

	it('computes legal moves and enforces blockades, captures and exact home', () => {
		run('startGame(4)');
		expect(run<number>('computeLegalMoves(0, 5).length')).toBe(0);
		expect(run<number>('computeLegalMoves(0, 6).length')).toBe(4);

		const rules = run<{
			openPath: number;
			blockedPath: number;
			blockedEntry: number;
			overshoot: number;
			exact: number;
			safeCapture: number;
			safePos: number;
			openCapture: number;
			capturedPos: number;
		}>(`(() => {
			const token0 = state.tokens.at(0);
			token0.pos = 5;
			state.tokens.forEach((token) => { if (token.id !== token0.id) token.pos = 57; });
			const openPath = computeLegalMoves(0, 6).length;
			const blocker1 = state.tokens.at(4);
			const blocker2 = state.tokens.at(5);
			blocker1.pos = 49;
			blocker2.pos = 49;
			const blockedPath = computeLegalMoves(0, 6).length;
			token0.pos = 57;
			state.tokens.at(1).pos = -1;
			blocker1.pos = 39;
			blocker2.pos = 39;
			const blockedEntry = computeLegalMoves(0, 6).length;
			token0.pos = 55;
			const overshoot = computeLegalMoves(0, 3).length;
			const exact = computeLegalMoves(0, 2).length;
			const victim = state.tokens.at(4);
			victim.pos = 47;
			const safeCapture = captureAt(8, 0).length;
			const safePos = victim.pos;
			victim.pos = 48;
			const openCapture = captureAt(9, 0).length;
			const capturedPos = victim.pos;
			return { openPath, blockedPath, blockedEntry, overshoot, exact, safeCapture, safePos, openCapture, capturedPos };
		})()`);
		expect(rules.openPath).toBe(1);
		expect(rules.blockedPath).toBe(0);
		expect(rules.blockedEntry).toBe(0);
		expect(rules.overshoot).toBe(0);
		expect(rules.exact).toBe(1);
		expect(rules.safeCapture).toBe(0);
		expect(rules.safePos).toBe(47);
		expect(rules.openCapture).toBe(1);
		expect(rules.capturedPos).toBe(-1);

		const ownBlockade = run<boolean>(`(() => {
			startGame(4);
			const token = state.tokens.at(0);
			token.pos = 5;
			state.tokens.at(1).pos = 10;
			state.tokens.at(2).pos = 10;
			state.tokens.at(3).pos = 57;
			return computeLegalMoves(0, 6).some((move) => move.tokenId === 0 && move.target === 11);
		})()`);
		expect(ownBlockade).toBe(true);
	});

	it('enforces passing, landing and safe-square blockades', () => {
		run('startGame(4)');
		const passing = run<{ blocked: number; clear: number }>(`(() => {
			const token = state.tokens.at(0);
			const victim = state.tokens.at(4);
			state.tokens.forEach((candidate) => { if (candidate.id !== token.id && candidate.id !== victim.id) candidate.pos = 57; });
			token.pos = 0;
			victim.pos = (1 - startIndex(victim.player) + RING_SIZE) % RING_SIZE;
			const clear = computeLegalMoves(0, 2).filter((move) => move.tokenId === token.id && move.target === 2).length;
			state.tokens.at(5).pos = victim.pos;
			const blocked = computeLegalMoves(0, 2).filter((move) => move.tokenId === token.id && move.target === 2).length;
			return { blocked, clear };
		})()`);
		expect(passing.clear).toBe(1);
		expect(passing.blocked).toBe(0);

		const safeBlockade = run<number>(`(() => {
			const token = state.tokens.at(0);
			state.tokens.forEach((candidate) => { if (candidate.player === 0) candidate.pos = 57; else candidate.pos = -1; });
			token.pos = 5;
			for (const id of [4, 5]) {
				const blocker = state.tokens.at(id);
				blocker.pos = (8 - startIndex(blocker.player) + RING_SIZE) % RING_SIZE;
			}
			return computeLegalMoves(0, 3).filter((move) => move.tokenId === token.id).length;
		})()`);
		expect(safeBlockade).toBe(0);
	});

	it('does not capture a token that is only passed over', async () => {
		run('startGame(2)');
		run(
			'state.current = 0; state.die = 2; state.phase = "choose"; state.tokens.forEach((token) => { token.pos = token.id === 0 ? 0 : token.id === 4 ? (1 - startIndex(token.player) + RING_SIZE) % RING_SIZE : 57; }); state.legal = computeLegalMoves(0, 2)'
		);
		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(0).pos')).toBe(2);
		expect(run<number>('state.tokens.at(4).pos')).toBe(27);
	});

	it('lets multiple players share a safe square without capture', async () => {
		run('startGame(2)');
		run(
			'state.current = 0; state.die = 3; state.phase = "choose"; state.tokens.forEach((token) => { token.pos = token.id === 0 ? 5 : token.id === 4 ? (8 - startIndex(token.player) + RING_SIZE) % RING_SIZE : 57; }); state.legal = computeLegalMoves(0, 3)'
		);
		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(0).pos')).toBe(8);
		expect(run<number>('state.tokens.at(4).pos')).toBe(34);
	});

	it('places pips in the standard die patterns and mounts the dice on the board', () => {
		run('startGame(2)');
		expect(run<boolean>('document.querySelector(".board > #dice") !== null')).toBe(true);
		const layouts: Record<number, number[]> = {
			1: [4],
			2: [0, 8],
			3: [0, 4, 8],
			4: [0, 2, 6, 8],
			5: [0, 2, 4, 6, 8],
			6: [0, 2, 3, 5, 6, 8]
		};
		for (const [value, active] of Object.entries(layouts)) {
			run(`state.die = ${value}; render()`);
			const pips = [...(dom?.window.document.querySelectorAll('.pip') ?? [])];
			const on = pips.flatMap((pip, index) => (pip.classList.contains('on') ? [index] : []));
			expect(on).toEqual(active);
		}
		run('state.die = 0; render()');
		expect(dom?.window.document.querySelectorAll('.pip.on')).toHaveLength(0);
	});

	it.each([2, 3, 4])('starts a %i player game with the right board', (count) => {
		run(`startGame(${String(count)})`);
		expect(run<number>('state.tokens.length')).toBe(count * 4);
		expect(run<number>('state.rolloff.participants.length')).toBe(count);
		expect(dom?.window.document.querySelectorAll('.ring-cell')).toHaveLength(52);
		expect(dom?.window.document.querySelectorAll('.home-cell')).toHaveLength(20);
		expect(dom?.window.document.querySelectorAll('.base-shape')).toHaveLength(4);
		expect(dom?.window.document.querySelectorAll('.base-slot')).toHaveLength(16);
		expect(dom?.window.document.querySelectorAll('.center-wedge')).toHaveLength(4);
		expect(dom?.window.document.querySelectorAll('.player')).toHaveLength(count);
	});

	it('enables and disables controls for each phase', () => {
		run('startGame(2)');
		const dice = dom?.window.document.getElementById('dice') as HTMLButtonElement | null;
		const restart = dom?.window.document.getElementById('restart') as HTMLButtonElement | null;
		expect(dice?.disabled).toBe(false);
		expect(restart?.disabled).toBe(false);

		run('state.phase = "choose"; render()');
		expect(dice?.disabled).toBe(true);
		expect(restart?.disabled).toBe(false);

		run('state.phase = "rolling"; render()');
		expect(dice?.disabled).toBe(true);
		expect(restart?.disabled).toBe(true);

		run('state.phase = "animating"; render()');
		expect(dice?.disabled).toBe(true);
		expect(restart?.disabled).toBe(true);
	});

	it('ignores rolls outside the await-roll phase', async () => {
		run('startGame(2)');
		run('state.phase = "setup"');
		await runAsync('rollDice()');
		expect(run<string>('state.phase')).toBe('setup');

		run('state.phase = "choose"');
		await runAsync('rollDice()');
		expect(run<string>('state.phase')).toBe('choose');
	});

	it('runs a three-player roll-off tie among the highest rollers', async () => {
		run('startGame(3)');
		setDie(getDom(), 5);
		await runAsync('rolloffTurn()');
		setDie(getDom(), 5);
		await runAsync('rolloffTurn()');
		setDie(getDom(), 1);
		await runAsync('rolloffTurn()');
		expect(run<number[]>('state.rolloff.participants')).toEqual([0, 1]);
		expect(run<number>('state.rolloff.pointer')).toBe(0);
		expect(run<number>('state.rolloff.rolls.size')).toBe(0);
	});

	it('shares a start square without capturing', async () => {
		run('startGame(2)');
		run(
			'state.current = 0; state.die = 6; state.phase = "choose"; state.tokens.forEach((token) => { token.pos = token.id === 4 ? (0 - startIndex(token.player) + RING_SIZE) % RING_SIZE : 57; }); state.tokens.at(0).pos = -1; state.legal = computeLegalMoves(0, 6)'
		);
		expect(
			run<boolean>('state.legal.some((move) => move.tokenId === 0 && move.target === 0)')
		).toBe(true);
		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(0).pos')).toBe(0);
		expect(run<number>('state.tokens.at(4).pos')).toBe(26);
	});

	it('blocks passing over a safe-square blockade', () => {
		run('startGame(4)');
		const blocked = run<number>(`(() => {
			const token = state.tokens.at(0);
			state.tokens.forEach((candidate) => { candidate.pos = 57; });
			token.pos = 5;
			for (const id of [4, 5]) {
				const blocker = state.tokens.at(id);
				blocker.pos = (8 - startIndex(blocker.player) + RING_SIZE) % RING_SIZE;
			}
			return computeLegalMoves(0, 4).filter((move) => move.tokenId === token.id && move.target === 9).length;
		})()`);
		expect(blocked).toBe(0);
	});

	it('enforces the home-lane boundaries', () => {
		run('startGame(4)');
		const boundaries = run<Record<string, number | null>>(`(() => {
			const token = state.tokens.at(0);
			const target = (pos, roll) => {
				state.tokens.forEach((candidate) => { candidate.pos = 57; });
				token.pos = pos;
				return computeLegalMoves(0, roll).find((move) => move.tokenId === 0)?.target ?? null;
			};
			return {
				from50with1: target(50, 1),
				from50with6: target(50, 6),
				from51with6: target(51, 6),
				from55with2: target(55, 2),
				from56with1: target(56, 1),
				from56with2: target(56, 2)
			};
		})()`);
		expect(boundaries['from50with1']).toBe(51);
		expect(boundaries['from50with6']).toBe(56);
		expect(boundaries['from51with6']).toBe(57);
		expect(boundaries['from55with2']).toBe(57);
		expect(boundaries['from56with1']).toBe(57);
		expect(boundaries['from56with2']).toBeNull();
	});

	it('rolls a six, offers moves and keeps the turn for the bonus roll', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.sixes = 0');
		setDie(getDom(), 6);
		await runAsync('rollDice()');
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.legal.length')).toBe(4);
		expect(run<string>('state.message')).toBe(
			'Red rolled a 6. Tap a token in the yard to move it out.'
		);

		await runAsync('chooseToken(0)');
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.current')).toBe(0);
		expect(run<number>('state.sixes')).toBe(1);
		expect(run<number>('state.tokens.at(0).pos')).toBe(0);
	});

	it('moves on a normal roll and passes the turn', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.die = 3; state.sixes = 2');
		run(
			'state.tokens.at(0).pos = 5; state.tokens.at(1).pos = 57; state.tokens.at(2).pos = 57; state.tokens.at(3).pos = 57'
		);
		setDie(getDom(), 3);
		await runAsync('rollDice()');
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.sixes')).toBe(0);
		expect(run<number>('state.legal.length')).toBe(1);

		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(0).pos')).toBe(8);
		expect(run<number>('state.current')).toBe(1);
		expect(run<string>('state.phase')).toBe('await-roll');
	});

	it('passes the turn when a non-six roll has no legal move', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.die = 3; state.sixes = 0');
		setDie(getDom(), 3);
		await runAsync('rollDice()');
		expect(run<number>('state.current')).toBe(1);
		expect(run<string>('state.phase')).toBe('await-roll');
	});

	it('grants another roll when a six has no legal move', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.die = 6; state.sixes = 0');
		run('state.tokens.at(4).pos = 26; state.tokens.at(5).pos = 26');
		setDie(getDom(), 6);
		await runAsync('rollDice()');
		expect(run<number>('state.current')).toBe(0);
		expect(run<number>('state.sixes')).toBe(1);
		expect(run<string>('state.phase')).toBe('await-roll');
	});

	it('forfeits the turn on the third consecutive six', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.sixes = 2');
		setDie(getDom(), 6);
		await runAsync('rollDice()');
		expect(run<number>('state.current')).toBe(1);
		expect(run<number>('state.sixes')).toBe(0);
		expect(run<string>('state.phase')).toBe('await-roll');
	});

	it('keeps the turn on two consecutive sixes', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.sixes = 1');
		setDie(getDom(), 6);
		await runAsync('rollDice()');
		expect(run<number>('state.current')).toBe(0);
		expect(run<number>('state.sixes')).toBe(2);
		expect(run<string>('state.phase')).toBe('choose');
	});

	it('hides capture information until a token is chosen', async () => {
		run('startGame(2)');
		run('state.current = 0; state.sixes = 0; state.phase = "await-roll"');
		run(
			'state.tokens.at(0).pos = 7; state.tokens.at(1).pos = 57; state.tokens.at(2).pos = 57; state.tokens.at(3).pos = 57'
		);
		run('state.tokens.at(4).pos = 35');
		setDie(getDom(), 2);
		await runAsync('rollDice()');
		expect(run<number>('state.tokens.at(4).pos')).toBe(35);
		expect(run<string>('state.message')).not.toMatch(/captur/i);
		expect(
			run<boolean>('state.legal.some((move) => move.tokenId === 0 && move.target === 9)')
		).toBe(true);
		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(4).pos')).toBe(-1);
		expect(run<number>('state.tokens.at(0).pos')).toBe(9);
		expect(run<number>('state.current')).toBe(0);
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<string>('state.message')).toBe('Red captured a token. Tap the dice again.');
	});

	it('sends a non-winning token home and advances the turn', async () => {
		run('startGame(2)');
		run('state.current = 0; state.die = 1; state.phase = "choose"');
		run(
			'state.tokens.at(0).pos = 56; state.tokens.at(1).pos = 57; state.tokens.at(2).pos = 0; state.tokens.at(3).pos = 0'
		);
		run('state.legal = computeLegalMoves(0, 1)');
		await runAsync('chooseToken(0)');
		expect(run<number>('state.tokens.at(0).pos')).toBe(57);
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.current')).toBe(1);
	});

	it('cycles turns through all four players', () => {
		run('startGame(4)');
		const order = run<number[]>(
			'(() => { const seen = [state.current]; for (let i = 0; i < 4; i++) { advanceTurn(); seen.push(state.current); } return seen; })()'
		);
		expect(order).toEqual([0, 1, 2, 3, 0]);
	});

	it('lets a non-red player win', async () => {
		run('startGame(2)');
		run('state.current = 1; state.die = 1; state.phase = "choose"');
		run(
			'state.tokens.at(4).pos = 56; state.tokens.at(5).pos = 57; state.tokens.at(6).pos = 57; state.tokens.at(7).pos = 57'
		);
		run('state.legal = computeLegalMoves(1, 1)');
		await runAsync('chooseToken(4)');
		expect(run<string>('state.phase')).toBe('gameover');
		expect(run<number>('state.winner')).toBe(1);
		expect(dom?.window.document.getElementById('winner-label')?.textContent).toBe('Yellow wins!');
	});

	it('declares a winner when all four tokens are home', async () => {
		run('startGame(2)');
		run('state.current = 0; state.die = 1; state.phase = "choose"');
		run(
			'state.tokens.at(0).pos = 56; state.tokens.at(1).pos = 57; state.tokens.at(2).pos = 57; state.tokens.at(3).pos = 57'
		);
		run('state.legal = computeLegalMoves(0, 1)');
		await runAsync('chooseToken(0)');
		expect(run<string>('state.phase')).toBe('gameover');
		expect(run<number>('state.winner')).toBe(0);
		expect(run<boolean>('gameoverScreen.hidden')).toBe(false);
		expect(dom?.window.document.getElementById('winner-label')?.textContent).toBe('Red wins!');
		expect(dom?.window.document.getElementById('winner-sub')?.textContent).toBe(
			'All 4 tokens made it home.'
		);
		expect(dom?.window.document.getElementById('winner-dot')?.className).toContain('p0');
		expect(run<boolean>('gameScreen.inert')).toBe(true);
		expect(
			dom?.window.document.getElementById('again')?.closest('.gameover-overlay')
		).toHaveAttribute('role', 'dialog');
		expect(dom?.window.document.activeElement?.id).toBe('again');
	});

	it('runs a roll-off until one player wins it', async () => {
		run('startGame(2)');
		expect(run<string>('turnEl.textContent')).toBe('Red · roll-off');
		setDie(getDom(), 6);
		await runAsync('rolloffTurn()');
		expect(run<number>('state.rolloff.pointer')).toBe(1);
		setDie(getDom(), 1);
		await runAsync('rolloffTurn()');
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.current')).toBe(0);
		expect(run<number>('state.die')).toBe(0);
	});

	it('lets a later roll-off participant win', async () => {
		run('startGame(2)');
		setDie(getDom(), 2);
		await runAsync('rolloffTurn()');
		setDie(getDom(), 5);
		await runAsync('rolloffTurn()');
		expect(run<number>('state.current')).toBe(1);
		expect(run<string>('state.phase')).toBe('await-roll');
	});

	it('re-rolls only tied roll-off participants', async () => {
		run('startGame(2)');
		setDie(getDom(), 6);
		await runAsync('rolloffTurn()');
		setDie(getDom(), 6);
		await runAsync('rolloffTurn()');
		expect(run<string>('state.phase')).toBe('rolloff');
		expect(run<number>('state.rolloff.participants.length')).toBe(2);
		expect(run<number>('state.rolloff.pointer')).toBe(0);
		expect(run<number>('state.rolloff.rolls.size')).toBe(0);

		setDie(getDom(), 2);
		await runAsync('rolloffTurn()');
		setDie(getDom(), 5);
		await runAsync('rolloffTurn()');
		expect(run<number>('state.current')).toBe(1);
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.die')).toBe(0);
	});

	it('delegates rollDice to the roll-off flow', async () => {
		run('startGame(2)');
		setDie(getDom(), 6);
		await runAsync('rollDice()');
		expect(run<number>('state.rolloff.pointer')).toBe(1);
	});

	it('supports the setup buttons and restart flow', () => {
		const two = dom?.window.document.querySelector<HTMLButtonElement>('[data-count="2"]');
		two?.click();
		expect(two?.classList.contains('selected')).toBe(true);

		dom?.window.document.getElementById('start')?.click();
		expect(run<number>('state.count')).toBe(2);
		expect(run<string>('state.phase')).toBe('rolloff');
		expect(dom?.window.document.activeElement?.id).toBe('dice');
		expect(run<boolean>('setupScreen.hidden')).toBe(true);
		expect(run<boolean>('gameScreen.hidden')).toBe(false);
		expect(run<boolean>('gameoverScreen.hidden')).toBe(true);

		dom?.window.document.getElementById('restart')?.click();
		expect(run<string>('state.phase')).toBe('setup');
		expect(dom?.window.document.activeElement?.id).toBe('start');
		expect(run<boolean>('gameScreen.inert')).toBe(false);
		expect(run<boolean>('setupScreen.hidden')).toBe(false);
		expect(run<boolean>('gameScreen.hidden')).toBe(true);
	});

	it('renders stacked tokens with a count badge and disabled state', () => {
		run('startGame(2)');
		run(
			'state.tokens.at(0).pos = 8; state.tokens.at(1).pos = 8; state.phase = "await-roll"; render()'
		);
		const stacked = dom?.window.document.querySelectorAll('.token.stacked');
		expect(stacked).toHaveLength(2);
		expect(dom?.window.document.querySelector('.stack-badge')?.textContent).toBe('×2');
		const token = stacked?.[0];
		expect(token?.getAttribute('aria-disabled')).toBe('true');
		expect(token?.getAttribute('tabindex')).toBe('-1');
	});

	it('spaces finished and approach tokens without overlap', () => {
		run('startGame(4)');
		const positions = run<[number, number][]>(
			'state.tokens.map((token) => { token.pos = FINISH_POS; return finishedPosition(token); })'
		);
		for (let first = 0; first < positions.length; first++) {
			for (let second = first + 1; second < positions.length; second++) {
				const a = positions.at(first);
				const b = positions.at(second);
				if (!a || !b) continue;
				const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
				expect(distance).toBeGreaterThanOrEqual(22);
			}
		}
		const approaches = run<[number, number][]>('[0, 1, 2, 3].map((seat) => centerApproach(seat))');
		for (const approach of approaches) {
			for (const position of positions) {
				expect(
					Math.hypot(approach[0] - position[0], approach[1] - position[1])
				).toBeGreaterThanOrEqual(22);
			}
		}
		const laneEnds = run<[number, number][]>('HOME_LANES.map((lane) => cellCenter(lane.at(-1)))');
		for (let seat = 0; seat < 4; seat++) {
			const approach = approaches.at(seat);
			const laneEnd = laneEnds.at(seat);
			if (!approach || !laneEnd) continue;
			expect(Math.hypot(approach[0] - laneEnd[0], approach[1] - laneEnd[1])).toBeGreaterThanOrEqual(
				38.5
			);
		}
	});

	it('lays out the classic board pieces', () => {
		run('startGame(4)');
		expect(dom?.window.document.querySelectorAll('.ring-cell.safe')).toHaveLength(8);
		expect(dom?.window.document.querySelectorAll('.ring-cell.start')).toHaveLength(4);
		expect(dom?.window.document.querySelectorAll('.star')).toHaveLength(4);
		expect(dom?.window.document.querySelectorAll('.center-star')).toHaveLength(0);
		expect(dom?.window.document.querySelectorAll('.center-circle')).toHaveLength(1);
		const stars = run<{ cell: number; x: number; y: number }[]>(`(() => {
			return [...document.querySelectorAll('.star')].map((element) => {
				const points = element.getAttribute('points').split(' ').map((point) => point.split(',').map(Number));
				const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
				const y = points.reduce((sum, point) => sum + point[1], 0) / points.length;
				return { cell: Number(element.dataset.cell), x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
			});
		})()`);
		expect(stars.map((star) => star.cell)).toEqual([8, 21, 34, 47]);
		for (const star of stars) {
			const [x, y] = run<[number, number]>(`cellCenter(PATH[${String(star.cell)}])`);
			expect({ x: star.x, y: star.y }).toEqual({
				x: Number(x.toFixed(2)),
				y: Number(y.toFixed(2))
			});
		}
		for (let seat = 0; seat < 4; seat++) {
			expect(
				dom?.window.document.querySelectorAll(`.ring-cell.start.p${String(seat)}`)
			).toHaveLength(1);
			expect(dom?.window.document.querySelectorAll(`.home-cell.p${String(seat)}`)).toHaveLength(5);
			expect(dom?.window.document.querySelectorAll(`.base-slot.p${String(seat)}`)).toHaveLength(4);
			expect(dom?.window.document.querySelectorAll(`.base-shape.p${String(seat)}`)).toHaveLength(1);
			expect(dom?.window.document.querySelectorAll(`.center-wedge.p${String(seat)}`)).toHaveLength(
				1
			);
			expect(dom?.window.document.querySelectorAll(`.token.p${String(seat)}`)).toHaveLength(4);
		}
		const base = dom?.window.document.querySelector<HTMLElement>('.token.p0');
		expect(base?.style.left).toBe('13.33%');
		expect(base?.style.top).toBe('13.33%');
		run('state.tokens.at(0).pos = 0; render()');
		expect(base?.style.left).toBe('10%');
		expect(base?.style.top).toBe('43.33%');
	});

	it('aligns every board element to the 15x15 grid', () => {
		run('startGame(4)');
		const aligned = run<boolean>(`(() => {
			const near = (a, b) => Math.abs(a - b) < 0.01;
			const center = (element) => [
				Number(element.getAttribute('x')) + Number(element.getAttribute('width')) / 2,
				Number(element.getAttribute('y')) + Number(element.getAttribute('height')) / 2
			];
			const rings = [...document.querySelectorAll('.ring-cell')];
			for (let index = 0; index < RING_SIZE; index++) {
				const [x, y] = center(rings[index]);
				const [expectedX, expectedY] = cellCenter(PATH[index]);
				if (!near(x, expectedX) || !near(y, expectedY)) return false;
			}
			const homes = [...document.querySelectorAll('.home-cell')];
			let homeIndex = 0;
			for (let seat = 0; seat < 4; seat++) {
				for (const cell of HOME_LANES[seat]) {
					const [x, y] = center(homes[homeIndex++]);
					const [expectedX, expectedY] = cellCenter(cell);
					if (!near(x, expectedX) || !near(y, expectedY)) return false;
				}
			}
			const slots = [...document.querySelectorAll('.base-slot')];
			let slotIndex = 0;
			for (let seat = 0; seat < 4; seat++) {
				for (const [column, row] of YARD_SLOTS[seat]) {
					const slot = slots[slotIndex++];
					if (!near(Number(slot.getAttribute('cx')), column * CELL)) return false;
					if (!near(Number(slot.getAttribute('cy')), row * CELL)) return false;
				}
			}
			const centerBg = document.querySelector('.center-bg');
			return (
				near(Number(centerBg.getAttribute('x')), 6 * CELL) &&
				near(Number(centerBg.getAttribute('y')), 6 * CELL) &&
				near(Number(centerBg.getAttribute('width')), 3 * CELL)
			);
		})()`);
		expect(aligned).toBe(true);
	});

	it('renders a three-token stack on a shared safe square', () => {
		run('startGame(3)');
		run(
			'state.tokens.at(0).pos = 8; state.tokens.at(4).pos = 47; state.tokens.at(8).pos = 34; state.phase = "await-roll"; render()'
		);
		expect(dom?.window.document.querySelectorAll('.token.stacked')).toHaveLength(3);
		expect(dom?.window.document.querySelector('.stack-badge')?.textContent).toBe('×3');
	});

	it('renders a large stack with the fan fallback', () => {
		run('startGame(4)');
		run(
			'state.tokens.forEach((token) => { token.pos = (8 - startIndex(token.player) + RING_SIZE) % RING_SIZE; }); state.phase = "await-roll"; render()'
		);
		expect(dom?.window.document.querySelectorAll('.token.stacked')).toHaveLength(16);
		expect(dom?.window.document.querySelector('.stack-badge')?.textContent).toBe('×16');
	});

	it('ignores invalid token choices', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"');
		await runAsync('chooseToken(0)');
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.tokens.at(0).pos')).toBe(-1);

		run('state.phase = "choose"; state.legal = [{ tokenId: 0, target: 0 }]');
		await runAsync('chooseToken(99)');
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.tokens.at(0).pos')).toBe(-1);
	});

	it('ignores out-of-range player counts and guards setup during animation', () => {
		run('startGame(2)');
		for (const count of [1, 5, 7]) {
			run(
				`const fake = document.createElement("button"); fake.className = "count-button"; fake.dataset.count = "${String(count)}"; countRow.appendChild(fake); fake.click();`
			);
			expect(run<number>('selectedCount')).toBe(4);
		}

		run('state.phase = "rolling"; showSetup()');
		expect(run<string>('state.phase')).toBe('rolling');
		run('state.phase = "animating"; showSetup()');
		expect(run<string>('state.phase')).toBe('animating');
	});

	it('wires the dice and token controls', async () => {
		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.sixes = 0');
		setDie(getDom(), 6);
		dom?.window.document.getElementById('dice')?.click();
		await vi.waitFor(() => {
			expect(run<string>('state.phase')).toBe('choose');
		});
		const movable = dom?.window.document.querySelector<HTMLElement>('.token.movable');
		expect(movable).toBeInTheDocument();
		movable?.click();
		await vi.waitFor(() => {
			expect(run<number[]>('state.tokens.slice(0, 4).map((token) => token.pos)')).toEqual([
				0, -1, -1, -1
			]);
		});

		run('startGame(2)');
		run('state.phase = "await-roll"; state.current = 0; state.sixes = 0');
		setDie(getDom(), 6);
		dom?.window.document.getElementById('dice')?.click();
		await vi.waitFor(() => {
			expect(run<string>('state.phase')).toBe('choose');
		});
		dom?.window.document.querySelector<HTMLElement>('.token')?.click();
		await vi.waitFor(() => {
			expect(run<number[]>('state.tokens.slice(0, 4).map((token) => token.pos)')).toEqual([
				0, -1, -1, -1
			]);
		});
		expect(run<number>('state.current')).toBe(0);

		run('startGame(2)');
		run(
			'state.phase = "choose"; state.legal = [0, 1, 2, 3].map((tokenId) => ({ tokenId, target: 0 })); render()'
		);
		dom?.window.document.querySelector<HTMLElement>('.token')?.click();
		await vi.waitFor(() => {
			expect(run<number>('state.tokens.at(0).pos')).toBe(0);
		});
	});

	it('chooses the movable token nearest to a tap', async () => {
		run('startGame(2)');
		run(
			'state.phase = "choose"; state.legal = [{ tokenId: 0, target: 0 }, { tokenId: 1, target: 0 }]; render(); const first = tokenEls.get(0); const second = tokenEls.get(1); first.getBoundingClientRect = () => ({ left: 90, top: 0, width: 20, height: 20, right: 110, bottom: 20, x: 90, y: 0 }); second.getBoundingClientRect = () => ({ left: -10, top: 0, width: 20, height: 20, right: 10, bottom: 20, x: -10, y: 0 });'
		);
		const first = dom?.window.document.querySelector<HTMLElement>('.token[data-token-id="0"]');
		first?.dispatchEvent(
			new (getDom().window.MouseEvent)('click', { bubbles: true, clientX: 5, clientY: 10 })
		);
		await vi.waitFor(() => {
			expect(run<number>('state.tokens.at(1).pos')).toBe(0);
		});
		expect(run<number>('state.tokens.at(0).pos')).toBe(-1);
	});

	it('ignores clicks on tokens that are not movable', () => {
		run('startGame(2)');
		run('state.phase = "choose"; state.legal = [{ tokenId: 2, target: 0 }]; render()');
		dom?.window.document.querySelector<HTMLElement>('.token[data-token-id="0"]')?.click();
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.tokens.at(0).pos')).toBe(-1);
	});

	it('restarts safely while choosing a token', () => {
		run('startGame(2)');
		run(
			'state.phase = "choose"; state.legal = [0, 1, 2, 3].map((tokenId) => ({ tokenId, target: 0 })); render()'
		);
		dom?.window.document.getElementById('restart')?.click();
		expect(run<string>('state.phase')).toBe('setup');
		expect(run<number>('state.legal.length')).toBe(0);
		expect(dom?.window.document.activeElement?.id).toBe('start');
	});

	it('restarts from the winner overlay', async () => {
		run('startGame(2)');
		run('state.current = 0; state.die = 1; state.phase = "choose"');
		run(
			'state.tokens.at(0).pos = 56; state.tokens.at(1).pos = 57; state.tokens.at(2).pos = 57; state.tokens.at(3).pos = 57'
		);
		run('state.legal = computeLegalMoves(0, 1)');
		await runAsync('chooseToken(0)');
		expect(run<string>('state.phase')).toBe('gameover');
		dom?.window.document.getElementById('again')?.click();
		expect(run<string>('state.phase')).toBe('setup');
		expect(dom?.window.document.activeElement?.id).toBe('start');
		expect(run<boolean>('gameScreen.inert')).toBe(false);
	});

	it('shows home counts and accessible player labels', () => {
		run('startGame(2)');
		run('state.tokens.at(0).pos = 57; state.tokens.at(1).pos = 57; render()');
		const player = dom?.window.document.querySelector<HTMLElement>('.player');
		expect(player?.getAttribute('aria-label')).toBe('Red player, 2 of 4 tokens home');
		expect(player?.querySelector('.home-count')?.textContent).toBe('2/4');
	});
	it('restores a saved game and clears it on setup', () => {
		run('startGame(4)');
		run(
			'state.phase = "choose"; state.current = 1; state.die = 4; state.sixes = 1; state.tokens.at(0).pos = 12; state.tokens.at(4).pos = 3; state.legal = [{ tokenId: 4, target: 7 }]; state.message = "Choose a token."; render()'
		);
		expect(run<string | null>('sessionStorage.getItem(STORAGE_KEY)')).not.toBeNull();
		run(
			'state.current = 0; state.tokens.forEach((token) => { token.pos = -1; }); state.phase = "setup"; restoreState()'
		);
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.current')).toBe(1);
		expect(run<number>('state.tokens.at(0).pos')).toBe(12);
		expect(dom?.window.document.querySelectorAll('.ring-cell')).toHaveLength(52);

		run('showSetup()');
		expect(run<string | null>('sessionStorage.getItem(STORAGE_KEY)')).toBeNull();
		expect(run<string | null>('localStorage.getItem(STORAGE_KEY)')).toBeNull();
	});
	it('restores a saved game on reload', () => {
		run('startGame(4)');
		run(
			'state.phase = "choose"; state.current = 1; state.die = 4; state.sixes = 1; state.tokens.at(0).pos = 12; state.tokens.at(4).pos = 3; state.legal = [{ tokenId: 4, target: 7 }]; state.message = "Choose a token."; render()'
		);
		const saved = dom?.window.sessionStorage.getItem('ludo-game-state');
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': saved ?? '' } });
		expect(run<string>('state.phase')).toBe('choose');
		expect(run<number>('state.current')).toBe(1);
		expect(run<number>('state.tokens.at(0).pos')).toBe(12);
		expect(run<number>('state.tokens.at(4).pos')).toBe(3);
		expect(run<number>('state.legal.length')).toBe(1);
		expect(dom?.window.document.querySelectorAll('.player')).toHaveLength(4);
	});
	it('starts fresh when saved state is corrupt', () => {
		dom = loadLudo({ local: { 'ludo-game-state': '{not json' } });
		expect(run<string>('state.phase')).toBe('setup');
		expect(run<boolean>('setupScreen.hidden')).toBe(false);
		expect(dom?.window.localStorage.getItem('ludo-game-state')).toBeNull();
	});

	it('restores a roll-off in progress', () => {
		run('startGame(3)');
		run('state.rolloff.pointer = 1; render()');
		const saved = dom?.window.sessionStorage.getItem('ludo-game-state');
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': saved ?? '' } });
		expect(run<string>('state.phase')).toBe('rolloff');
		expect(run<number>('state.rolloff.pointer')).toBe(1);
		expect(run<number[]>('state.rolloff.participants')).toEqual([0, 1, 2]);
		expect(dom?.window.document.getElementById('dice')).not.toBeDisabled();
	});

	it('discards an invalid roll-off payload', () => {
		run('startGame(2)');
		const saved = JSON.parse(dom?.window.sessionStorage.getItem('ludo-game-state') ?? '{}') as {
			rolloff: { participants: unknown };
		};
		saved.rolloff.participants = 5;
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': JSON.stringify(saved) } });
		expect(run<string>('state.phase')).toBe('setup');
		expect(dom?.window.localStorage.getItem('ludo-game-state')).toBeNull();
	});

	it('restores a finished game and focuses play again', () => {
		run('startGame(2)');
		run(
			'state.phase = "gameover"; state.winner = 0; state.current = 0; state.tokens.forEach((token) => { if (token.player === 0) token.pos = 57; }); render()'
		);
		const saved = dom?.window.sessionStorage.getItem('ludo-game-state');
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': saved ?? '' } });
		expect(run<string>('state.phase')).toBe('gameover');
		expect(run<number>('state.winner')).toBe(0);
		expect(run<boolean>('gameoverScreen.hidden')).toBe(false);
		expect(dom?.window.document.activeElement?.id).toBe('again');
	});

	it('keeps yard tokens unstacked when opponents share a ring cell', () => {
		run('startGame(2)');
		run(
			'state.tokens.at(0).pos = (startIndex(1) - 1 - startIndex(0) + RING_SIZE) % RING_SIZE; state.tokens.at(1).pos = state.tokens.at(0).pos; render()'
		);
		const yardTokens = dom?.window.document.querySelectorAll('.token.in-base') ?? [];
		expect(yardTokens).toHaveLength(6);
		expect(dom?.window.document.querySelectorAll('.token.in-base.stacked')).toHaveLength(0);
		expect(dom?.window.document.querySelectorAll('.token.in-base .stack-badge')).toHaveLength(0);
	});

	it('turns an impossible choose state back into a roll', () => {
		run('startGame(2)');
		run(
			'state.phase = "choose"; state.current = 0; state.die = 2; state.tokens.forEach((token) => { token.pos = token.id === 0 ? 56 : 57; }); state.legal = []; render()'
		);
		const saved = dom?.window.sessionStorage.getItem('ludo-game-state');
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': saved ?? '' } });
		expect(run<string>('state.phase')).toBe('await-roll');
		expect(run<number>('state.legal.length')).toBe(0);
		expect(dom?.window.document.getElementById('dice')).not.toBeDisabled();
	});

	it('rejects a gameover winner that has not finished', () => {
		run('startGame(2)');
		run('state.phase = "gameover"; state.winner = 0; state.current = 0; render()');
		const saved = dom?.window.sessionStorage.getItem('ludo-game-state');
		dom?.window.close();
		dom = loadLudo({ local: { 'ludo-game-state': saved ?? '' } });
		expect(run<string>('state.phase')).toBe('setup');
		expect(dom?.window.localStorage.getItem('ludo-game-state')).toBeNull();
	});
});
