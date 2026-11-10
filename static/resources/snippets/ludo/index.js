const setupScreen = document.getElementById('setup');
const gameScreen = document.getElementById('game');
const gameoverScreen = document.querySelector('.gameover-overlay');
const countRow = document.getElementById('count-row');
const startButton = document.getElementById('start');
const restartButton = document.getElementById('restart');
const againButton = document.getElementById('again');
const boardSvg = document.getElementById('board-svg');
const tokenLayer = document.getElementById('token-layer');
const playerStrip = document.getElementById('player-strip');
const turnEl = document.getElementById('turn');
const messageEl = document.getElementById('message');
const diceButton = document.getElementById('dice');
const winnerLabel = document.getElementById('winner-label');
const winnerSub = document.getElementById('winner-sub');
const winnerDot = document.getElementById('winner-dot');
const pipEls = Array.from(diceButton.querySelectorAll('.pip'));

const PLAYERS = ['Red', 'Green', 'Yellow', 'Blue'];
const START_INDICES = [0, 13, 26, 39];
const STAR_OFFSET = 8;
const PIP_LAYOUT = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

// Classic 15x15 Ludo board. Each entry is [column, row] from the top-left.
const PATH = [
	[1, 6],
	[2, 6],
	[3, 6],
	[4, 6],
	[5, 6],
	[6, 5],
	[6, 4],
	[6, 3],
	[6, 2],
	[6, 1],
	[6, 0],
	[7, 0],
	[8, 0],
	[8, 1],
	[8, 2],
	[8, 3],
	[8, 4],
	[8, 5],
	[9, 6],
	[10, 6],
	[11, 6],
	[12, 6],
	[13, 6],
	[14, 6],
	[14, 7],
	[14, 8],
	[13, 8],
	[12, 8],
	[11, 8],
	[10, 8],
	[9, 8],
	[8, 9],
	[8, 10],
	[8, 11],
	[8, 12],
	[8, 13],
	[8, 14],
	[7, 14],
	[6, 14],
	[6, 13],
	[6, 12],
	[6, 11],
	[6, 10],
	[6, 9],
	[5, 8],
	[4, 8],
	[3, 8],
	[2, 8],
	[1, 8],
	[0, 8],
	[0, 7],
	[0, 6]
];
const HOME_LANES = [
	[
		[1, 7],
		[2, 7],
		[3, 7],
		[4, 7],
		[5, 7]
	],
	[
		[7, 1],
		[7, 2],
		[7, 3],
		[7, 4],
		[7, 5]
	],
	[
		[13, 7],
		[12, 7],
		[11, 7],
		[10, 7],
		[9, 7]
	],
	[
		[7, 13],
		[7, 12],
		[7, 11],
		[7, 10],
		[7, 9]
	]
];
const YARD_SLOTS = [
	[
		[2, 2],
		[4, 2],
		[2, 4],
		[4, 4]
	],
	[
		[11, 2],
		[13, 2],
		[11, 4],
		[13, 4]
	],
	[
		[11, 11],
		[13, 11],
		[11, 13],
		[13, 13]
	],
	[
		[2, 11],
		[4, 11],
		[2, 13],
		[4, 13]
	]
];
const CENTER_APPROACHES = [
	[6.15, 7.5],
	[7.5, 6.15],
	[8.85, 7.5],
	[7.5, 8.85]
];
const FINISH_LINES = [
	[
		[6.28, 6.6],
		[6.28, 7.1],
		[6.28, 7.9],
		[6.28, 8.4]
	],
	[
		[6.6, 6.28],
		[7.1, 6.28],
		[7.9, 6.28],
		[8.4, 6.28]
	],
	[
		[8.72, 6.6],
		[8.72, 7.1],
		[8.72, 7.9],
		[8.72, 8.4]
	],
	[
		[6.6, 8.72],
		[7.1, 8.72],
		[7.9, 8.72],
		[8.4, 8.72]
	]
];

// Path model: -1 = yard, 0 = spawn square, 1..50 = remaining ring, 51..55 = home lane,
// 56 = center approach, 57 = finish.
const RING_SIZE = PATH.length;
const LAST_RING_POS = RING_SIZE - 2;
const HOME_LANE_STEPS = HOME_LANES[0].length;
const STEPS_TO_FINISH = HOME_LANE_STEPS + 1;
const HOME_START = LAST_RING_POS + 1;
const FINISH_POS = HOME_START + STEPS_TO_FINISH;
const TOKENS_PER_PLAYER = 4;
const DIE_FACES = 6;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = PLAYERS.length;
const DIE_ANIMATION_STEPS = 6;
const TIMING = {
	BASE_ENTRY: 130,
	STEP: 90,
	CAPTURE: 520,
	HOME: 420,
	DIE_STEP: 55,
	FORFEIT: 1300,
	NO_MOVE: 900
};

const CENTER = 500;
const GRID = 15;
const CELL = (CENTER * 2) / GRID;

let selectedCount = 4;
let state = {
	phase: 'setup',
	count: 4,
	tokens: [],
	current: 0,
	die: 0,
	sixes: 0,
	message: 'Best of luck.',
	legal: [],
	safe: new Set(),
	rolloff: { participants: [], pointer: 0, rolls: new Map() },
	winner: -1
};
let playerEls = [];
let tokenEls = new Map();

const STORAGE_KEY = 'ludo-game-state';

const readStoredState = () => {
	try {
		return sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

const writeStoredState = (value) => {
	try {
		sessionStorage.setItem(STORAGE_KEY, value);
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// Persistence is best-effort; the game still works without storage.
	}
};

const clearStoredState = () => {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore unavailable storage.
	}
};

const resetState = () => {
	state = {
		phase: 'setup',
		count: 4,
		tokens: [],
		current: 0,
		die: 0,
		sixes: 0,
		message: 'Best of luck.',
		legal: [],
		safe: new Set(),
		rolloff: { participants: [], pointer: 0, rolls: new Map() },
		winner: -1
	};
};

const seatFor = (player, count = state.count) => {
	const seats = count === 2 ? [0, 2] : count === 3 ? [0, 1, 2] : [0, 1, 2, 3];
	return seats.at(player) ?? player;
};

const startIndexFor = (player, count) => START_INDICES[seatFor(player, count)];

const startIndex = (player) => startIndexFor(player, state.count);

const ringIndexOf = (token) => (startIndex(token.player) + token.pos) % RING_SIZE;

const nameOf = (player) => PLAYERS.at(seatFor(player)) ?? '';

const buildSafeCells = () => {
	const safe = new Set();
	for (const start of START_INDICES) {
		safe.add(start);
		safe.add((start + STAR_OFFSET) % RING_SIZE);
	}
	return safe;
};

const cellCenter = ([column, row]) => [(column + 0.5) * CELL, (row + 0.5) * CELL];

const starPoints = (centerX, centerY) => {
	const outer = CELL * 0.3;
	const inner = CELL * 0.12;
	return Array.from({ length: 10 }, (_, index) => {
		const radius = index % 2 === 0 ? outer : inner;
		const angle = -Math.PI / 2 + (index * Math.PI) / 5;
		return `${(centerX + radius * Math.cos(angle)).toFixed(2)},${(centerY + radius * Math.sin(angle)).toFixed(2)}`;
	}).join(' ');
};

const currentRolloffPlayer = () => state.rolloff.participants.at(state.rolloff.pointer) ?? 0;

const fanOffset = (index, total, spread) => {
	switch (total) {
		case 1:
			return [0, 0];
		case 2:
			return [index === 0 ? -spread : spread, 0];
		case 3:
			if (index === 0) return [-spread, -spread * 0.6];
			if (index === 1) return [spread, -spread * 0.6];
			return [0, spread];
		case 4:
			return [index % 2 === 0 ? -spread : spread, index < 2 ? -spread : spread];
		default: {
			const angle = (2 * Math.PI * index) / total;
			return [Math.cos(angle) * spread * 1.4, Math.sin(angle) * spread * 1.4];
		}
	}
};

const baseSlotPosition = (player, slot) => {
	const [column, row] = YARD_SLOTS.at(seatFor(player))?.at(slot) ?? [0, 0];
	return [column * CELL, row * CELL];
};

const trianglePoint = (player, points) => {
	const [column, row] = points.at(seatFor(player)) ?? [7.5, 7.5];
	return [column * CELL, row * CELL];
};

const centerApproach = (player) => trianglePoint(player, CENTER_APPROACHES);

const finishedPosition = (token) => {
	const [column, row] = FINISH_LINES.at(seatFor(token.player))?.at(token.slot) ?? [7.5, 7.5];
	return [column * CELL, row * CELL];
};

const tokenLocationKey = (token) => {
	if (token.pos === -1) return `yard-${token.id}`;
	if (token.pos < HOME_START) return `ring-${ringIndexOf(token)}`;
	if (token.pos < FINISH_POS) return `home-${token.player}-${token.pos}`;
	return `finished-${token.player}`;
};

const setTokenPosition = (element, x, y) => {
	element.style.left = `${((x / (CENTER * 2)) * 100).toFixed(2)}%`;
	element.style.top = `${((y / (CENTER * 2)) * 100).toFixed(2)}%`;
};

const renderTokens = () => {
	const movable = new Set(state.legal.map((move) => move.tokenId));
	const groups = new Map();
	for (const token of state.tokens) {
		if (token.pos === -1 || token.pos === FINISH_POS) continue;
		const key = tokenLocationKey(token);
		const group = groups.get(key);
		if (group) group.push(token);
		else groups.set(key, [token]);
	}

	for (const element of tokenEls.values()) element.querySelector('.stack-badge')?.remove();

	for (const token of state.tokens) {
		const element = tokenEls.get(token.id);
		if (!element) continue;
		const group = groups.get(tokenLocationKey(token)) ?? [];
		const stacked = group.length > 1;
		let position;
		if (token.pos === -1) {
			position = baseSlotPosition(token.player, token.slot);
		} else if (token.pos === FINISH_POS) {
			position = finishedPosition(token);
		} else {
			const index = group.indexOf(token);
			const spread = token.pos < HOME_START ? (stacked ? CELL * 0.18 : CELL * 0.1) : CELL * 0.1;
			const [offsetX, offsetY] = fanOffset(index, group.length, spread);
			let base;
			if (token.pos < HOME_START) {
				base = cellCenter(PATH.at(ringIndexOf(token)) ?? [7, 7]);
			} else if (token.pos - HOME_START < HOME_LANE_STEPS) {
				base = cellCenter(
					HOME_LANES.at(seatFor(token.player)).at(token.pos - HOME_START) ?? [7, 7]
				);
			} else {
				base = centerApproach(token.player);
			}
			position = [base.at(0) + offsetX, base.at(1) + offsetY];
		}
		setTokenPosition(element, position.at(0), position.at(1));
		element.classList.toggle('movable', movable.has(token.id));
		element.classList.toggle('in-base', token.pos === -1);
		element.classList.toggle('stacked', stacked);
		element.classList.toggle('approach', token.pos === HOME_START + HOME_LANE_STEPS);
		element.classList.toggle('finished', token.pos === FINISH_POS);
		element.tabIndex = movable.has(token.id) ? 0 : -1;
		element.setAttribute('aria-disabled', String(!movable.has(token.id)));
		element.style.zIndex = movable.has(token.id)
			? '9'
			: token.pos === FINISH_POS
				? '4'
				: token.pos === -1
					? '2'
					: '3';
	}

	for (const group of groups.values()) {
		if (group.length < 2) continue;
		const token = group.at(-1);
		const element = token ? tokenEls.get(token.id) : undefined;
		if (!element) continue;
		const badge = document.createElement('span');
		badge.className = 'stack-badge';
		badge.textContent = `×${group.length}`;
		element.appendChild(badge);
	}
};

const saveState = () => {
	if (state.phase === 'rolling' || state.phase === 'animating') return;
	if (state.phase === 'setup') {
		clearStoredState();
		return;
	}
	writeStoredState(
		JSON.stringify({
			phase: state.phase,
			count: state.count,
			tokens: state.tokens,
			current: state.current,
			die: state.die,
			sixes: state.sixes,
			message: state.message,
			legal: state.legal,
			rolloff: {
				participants: state.rolloff.participants,
				pointer: state.rolloff.pointer,
				rolls: [...state.rolloff.rolls.entries()]
			},
			winner: state.winner
		})
	);
};

const render = () => {
	setupScreen.hidden = state.phase !== 'setup';
	gameScreen.hidden = state.phase === 'setup';
	gameoverScreen.hidden = state.phase !== 'gameover';
	gameScreen.inert = state.phase === 'gameover';

	const activePlayer =
		state.phase === 'setup'
			? -1
			: state.phase === 'rolloff'
				? currentRolloffPlayer()
				: state.current;

	if (activePlayer >= 0) {
		turnEl.className = 'turn';
		turnEl.textContent =
			state.phase === 'rolloff' ? `${nameOf(activePlayer)} \u00b7 roll-off` : nameOf(activePlayer);
	} else {
		turnEl.className = 'turn';
		turnEl.textContent = '';
	}

	for (let player = 0; player < state.count; player++) {
		const element = playerEls.at(player);
		if (!element) continue;
		element.classList.toggle('active', player === activePlayer);
		const homeCount = state.tokens.filter(
			(token) => token.player === player && token.pos === FINISH_POS
		).length;
		element.setAttribute(
			'aria-label',
			`${nameOf(player)} player, ${homeCount} of ${TOKENS_PER_PLAYER} tokens home`
		);
		const countElement = element.querySelector('.home-count');
		if (countElement) countElement.textContent = `${homeCount}/${TOKENS_PER_PLAYER}`;
	}

	if (messageEl.textContent !== state.message) messageEl.textContent = state.message;

	const pips = state.die > 0 ? (PIP_LAYOUT.at(state.die - 1) ?? []) : [];
	for (const [index, pip] of pipEls.entries()) {
		pip.classList.toggle('on', pips.includes(index));
	}
	diceButton.disabled = !(state.phase === 'await-roll' || state.phase === 'rolloff');
	diceButton.classList.toggle('rolling', state.phase === 'rolling');
	restartButton.disabled = state.phase === 'rolling' || state.phase === 'animating';
	diceButton.setAttribute(
		'aria-label',
		state.phase === 'rolloff' ? `Roll for ${nameOf(currentRolloffPlayer())}` : 'Roll the dice'
	);

	if (state.phase === 'gameover') {
		winnerLabel.textContent = `${nameOf(state.winner)} wins!`;
		winnerSub.textContent = `All ${String(TOKENS_PER_PLAYER)} tokens made it home.`;
		winnerDot.className = `winner-dot p${seatFor(state.winner)}`;
		againButton.focus();
	}

	renderTokens();
	saveState();
};

const YARD_ORIGINS = [
	[0, 0],
	[9, 0],
	[9, 9],
	[0, 9]
];

const buildBoard = () => {
	const startOwners = new Map();
	for (let seat = 0; seat < PLAYERS.length; seat++) {
		startOwners.set(START_INDICES.at(seat) ?? 0, seat);
	}

	const parts = [
		`<rect class="board-surface" x="0" y="0" width="1000" height="1000" rx="18"></rect>`
	];

	for (const seat of [0, 1, 2, 3]) {
		const [originColumn, originRow] = YARD_ORIGINS.at(seat) ?? [0, 0];
		parts.push(
			`<rect class="base-shape p${seat}" x="${(originColumn * CELL).toFixed(2)}" y="${(originRow * CELL).toFixed(2)}" width="${(CELL * 6).toFixed(2)}" height="${(CELL * 6).toFixed(2)}" rx="${(CELL * 0.24).toFixed(2)}"></rect>`,
			`<rect class="base-inner" x="${((originColumn + 1) * CELL).toFixed(2)}" y="${((originRow + 1) * CELL).toFixed(2)}" width="${(CELL * 4).toFixed(2)}" height="${(CELL * 4).toFixed(2)}" rx="${(CELL * 0.16).toFixed(2)}"></rect>`
		);
		for (const [column, row] of YARD_SLOTS.at(seat) ?? []) {
			parts.push(
				`<circle class="base-slot p${seat}" cx="${(column * CELL).toFixed(2)}" cy="${(row * CELL).toFixed(2)}" r="${(CELL * 0.46).toFixed(2)}"></circle>`
			);
		}
	}

	for (let index = 0; index < RING_SIZE; index++) {
		const [column, row] = PATH.at(index) ?? [7, 7];
		const classes = ['ring-cell'];
		const owner = startOwners.get(index);
		if (state.safe.has(index)) classes.push('safe');
		if (owner !== undefined) classes.push('start', `p${owner}`);
		const x = column * CELL + 1.5;
		const y = row * CELL + 1.5;
		const size = CELL - 3;
		parts.push(
			`<rect class="${classes.join(' ')}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${(CELL * 0.12).toFixed(2)}"></rect>`
		);
		if (state.safe.has(index) && owner === undefined) {
			const [starX, starY] = cellCenter([column, row]);
			parts.push(
				`<polygon class="star" data-cell="${index}" points="${starPoints(starX, starY)}"></polygon>`
			);
		}
	}

	for (const seat of [0, 1, 2, 3]) {
		for (const [column, row] of HOME_LANES.at(seat) ?? []) {
			parts.push(
				`<rect class="home-cell p${seat}" x="${(column * CELL + 1.5).toFixed(2)}" y="${(row * CELL + 1.5).toFixed(2)}" width="${(CELL - 3).toFixed(2)}" height="${(CELL - 3).toFixed(2)}" rx="${(CELL * 0.12).toFixed(2)}"></rect>`
			);
		}
	}

	const left = CELL * 6;
	const top = CELL * 6;
	const right = CELL * 9;
	const bottom = CELL * 9;
	const middle = CELL * 7.5;
	parts.push(
		`<rect class="center-bg" x="${left.toFixed(2)}" y="${top.toFixed(2)}" width="${(CELL * 3).toFixed(2)}" height="${(CELL * 3).toFixed(2)}"></rect>`,
		`<path class="center-wedge p0" d="M${middle.toFixed(2)} ${middle.toFixed(2)} L${left.toFixed(2)} ${top.toFixed(2)} L${left.toFixed(2)} ${bottom.toFixed(2)} Z"></path>`,
		`<path class="center-wedge p1" d="M${middle.toFixed(2)} ${middle.toFixed(2)} L${left.toFixed(2)} ${top.toFixed(2)} L${right.toFixed(2)} ${top.toFixed(2)} Z"></path>`,
		`<path class="center-wedge p2" d="M${middle.toFixed(2)} ${middle.toFixed(2)} L${right.toFixed(2)} ${top.toFixed(2)} L${right.toFixed(2)} ${bottom.toFixed(2)} Z"></path>`,
		`<path class="center-wedge p3" d="M${middle.toFixed(2)} ${middle.toFixed(2)} L${left.toFixed(2)} ${bottom.toFixed(2)} L${right.toFixed(2)} ${bottom.toFixed(2)} Z"></path>`,
		`<circle class="center-circle" cx="${middle.toFixed(2)}" cy="${middle.toFixed(2)}" r="${(CELL * 0.34).toFixed(2)}"></circle>`
	);

	boardSvg.innerHTML = parts.join('');
};

const createTokens = (count) => {
	const tokens = [];
	for (let player = 0; player < count; player++) {
		for (let slot = 0; slot < TOKENS_PER_PLAYER; slot++) {
			tokens.push({
				id: player * TOKENS_PER_PLAYER + slot,
				player,
				slot,
				pos: -1
			});
		}
	}
	return tokens;
};

const buildTokens = () => {
	tokenLayer.innerHTML = '';
	tokenEls = new Map();
	for (const token of state.tokens) {
		const element = document.createElement('button');
		element.type = 'button';
		element.className = `token p${seatFor(token.player)}`;
		element.dataset.tokenId = String(token.id);
		element.setAttribute('aria-label', `${nameOf(token.player)} token ${token.slot + 1}`);
		tokenLayer.appendChild(element);
		tokenEls.set(token.id, element);
	}
};

const buildPlayerStrip = () => {
	playerStrip.innerHTML = '';
	playerEls = [];
	for (let player = 0; player < state.count; player++) {
		const element = document.createElement('div');
		element.className = `player p${seatFor(player)}`;
		element.innerHTML = `<span class="dot"></span><span class="player-name">${nameOf(player)}</span><span class="home-count">0/${TOKENS_PER_PLAYER}</span>`;
		playerStrip.appendChild(element);
		playerEls.push(element);
	}
};

const playerTokens = (player) => state.tokens.filter((token) => token.player === player);

const tokensAtRing = (ringIndex) =>
	state.tokens.filter(
		(token) => token.pos >= 0 && token.pos < HOME_START && ringIndexOf(token) === ringIndex
	);

const isBlocked = (ringIndex, player) => {
	const counts = new Map();
	for (const token of tokensAtRing(ringIndex)) {
		if (token.player === player) continue;
		counts.set(token.player, (counts.get(token.player) ?? 0) + 1);
	}
	for (const count of counts.values()) {
		if (count >= 2) return true;
	}
	return false;
};

const pathBlocked = (token, target) => {
	const lastRingStep = Math.min(target, LAST_RING_POS);
	for (let pos = token.pos + 1; pos <= lastRingStep; pos++) {
		const ringIndex = (startIndex(token.player) + pos) % RING_SIZE;
		if (isBlocked(ringIndex, token.player)) return true;
	}
	return false;
};

const computeLegalMoves = (player, roll) => {
	const moves = [];
	for (const token of playerTokens(player)) {
		if (token.pos === FINISH_POS) continue;
		if (token.pos === -1) {
			if (roll !== DIE_FACES) continue;
			const entry = startIndex(player) % RING_SIZE;
			if (isBlocked(entry, player)) continue;
			moves.push({ tokenId: token.id, target: 0 });
			continue;
		}
		const target = token.pos + roll;
		if (target > FINISH_POS) continue;
		if (pathBlocked(token, target)) continue;
		moves.push({ tokenId: token.id, target });
	}
	return moves;
};

const captureAt = (ringIndex, player) => {
	if (state.safe.has(ringIndex)) return [];
	const victims = tokensAtRing(ringIndex).filter((token) => token.player !== player);
	for (const token of victims) token.pos = -1;
	return victims;
};

const sleep = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const focusDice = () => diceButton.focus();
const focusFirstMove = () => tokenEls.get(state.legal.at(0)?.tokenId)?.focus();

const advanceTurn = () => {
	state.sixes = 0;
	state.legal = [];
	state.die = 0;
	state.current = (state.current + 1) % state.count;
	state.phase = 'await-roll';
	state.message = `${nameOf(state.current)}'s turn. Tap the dice in the center to roll.`;
	render();
	focusDice();
};

const chooseToken = async (tokenId) => {
	if (state.phase !== 'choose') return;
	const move = state.legal.find((candidate) => candidate.tokenId === tokenId);
	const token = state.tokens.at(tokenId);
	if (!move || !token) return;

	state.phase = 'animating';
	state.legal = [];
	render();

	if (token.pos === -1) {
		token.pos = 0;
		render();
		await sleep(TIMING.BASE_ENTRY);
	} else {
		for (let pos = token.pos + 1; pos <= move.target; pos++) {
			token.pos = pos;
			render();
			await sleep(TIMING.STEP);
		}
	}

	let captured = [];
	if (move.target < HOME_START) {
		const destination = (startIndex(token.player) + move.target) % RING_SIZE;
		captured = captureAt(destination, token.player);
	}
	const reachedHome = move.target === FINISH_POS;
	const extraTurn = state.die === DIE_FACES || captured.length > 0;

	const allHome = playerTokens(token.player).every((candidate) => candidate.pos === FINISH_POS);
	if (allHome) {
		state.winner = token.player;
		state.current = token.player;
		state.phase = 'gameover';
		state.message = `${nameOf(token.player)} wins!`;
		render();
		return;
	}

	if (captured.length > 0) {
		state.message = `${nameOf(token.player)} captured a token!`;
		render();
		await sleep(TIMING.CAPTURE);
	} else if (reachedHome) {
		state.message = `${nameOf(token.player)} brought a token home!`;
		render();
		await sleep(TIMING.HOME);
	}

	if (extraTurn) {
		state.phase = 'await-roll';
		state.legal = [];
		state.message =
			state.die === DIE_FACES
				? `${nameOf(token.player)} rolled a 6. Tap the dice again.`
				: `${nameOf(token.player)} captured a token. Tap the dice again.`;
		render();
		focusDice();
		return;
	}

	advanceTurn();
};

const randomDie = () => {
	if (typeof crypto === 'undefined') return Math.floor(Math.random() * DIE_FACES) + 1;
	const values = new Uint32Array(1);
	crypto.getRandomValues(values);
	return ((values.at(0) ?? 0) % DIE_FACES) + 1;
};

const animateDie = async () => {
	state.phase = 'rolling';
	render();
	for (let step = 0; step < DIE_ANIMATION_STEPS; step++) {
		state.die = randomDie();
		render();
		await sleep(TIMING.DIE_STEP);
	}
	const value = randomDie();
	state.die = value;
	render();
	return value;
};

const rolloffTurn = async () => {
	if (state.phase !== 'rolloff') return;
	const player = currentRolloffPlayer();
	const value = await animateDie();
	state.rolloff.rolls.set(player, value);

	const nextPointer = state.rolloff.pointer + 1;
	if (nextPointer < state.rolloff.participants.length) {
		state.rolloff.pointer = nextPointer;
		state.phase = 'rolloff';
		const nextPlayer = currentRolloffPlayer();
		state.message = `${nameOf(player)} rolled ${value}. ${nameOf(nextPlayer)}, tap the dice for the highest roll.`;
		render();
		focusDice();
		return;
	}

	let highest = 0;
	for (const candidate of state.rolloff.participants) {
		const roll = state.rolloff.rolls.get(candidate) ?? 0;
		if (roll > highest) highest = roll;
	}
	const tied = state.rolloff.participants.filter(
		(candidate) => (state.rolloff.rolls.get(candidate) ?? 0) === highest
	);
	if (tied.length === 1) {
		const winner = tied.at(0) ?? 0;
		state.current = winner;
		state.die = 0;
		state.sixes = 0;
		state.phase = 'await-roll';
		state.message = `${nameOf(winner)} rolled the highest and starts. Tap the dice in the center to roll.`;
		render();
		focusDice();
		return;
	}

	state.rolloff = { participants: tied, pointer: 0, rolls: new Map() };
	state.phase = 'rolloff';
	state.message = `${tied.map((candidate) => nameOf(candidate)).join(', ')} tied at ${highest}. Tap the dice again.`;
	render();
	focusDice();
};

const rollDice = async () => {
	if (state.phase === 'rolloff') {
		await rolloffTurn();
		return;
	}
	if (state.phase !== 'await-roll') return;

	const player = state.current;
	const value = await animateDie();
	if (value === DIE_FACES) state.sixes += 1;
	else state.sixes = 0;

	if (state.sixes >= 3) {
		state.sixes = 0;
		state.phase = 'animating';
		state.message = `${nameOf(player)} rolled three 6s in a row and forfeits the turn.`;
		render();
		await sleep(TIMING.FORFEIT);
		advanceTurn();
		return;
	}

	const moves = computeLegalMoves(player, value);
	state.legal = moves;
	if (moves.length === 0) {
		const extraTurn = value === DIE_FACES;
		state.phase = 'animating';
		state.message = extraTurn
			? `${nameOf(player)} rolled a 6 but has no legal move. Tap the dice again.`
			: `${nameOf(player)} has no legal move. Turn passes.`;
		render();
		await sleep(TIMING.NO_MOVE);
		if (extraTurn) {
			state.phase = 'await-roll';
			state.legal = [];
			state.message = `${nameOf(player)}, tap the dice again.`;
			render();
			focusDice();
		} else {
			advanceTurn();
		}
		return;
	}

	state.phase = 'choose';
	const allFromYard = moves.every((move) => state.tokens.at(move.tokenId)?.pos === -1);
	state.message = allFromYard
		? `${nameOf(player)} rolled a 6. Tap a token in the yard to move it out.`
		: `${nameOf(player)} rolled ${value}. Choose a token to move.`;
	render();
	focusFirstMove();
};

const startGame = (count) => {
	state = {
		phase: 'rolloff',
		count,
		tokens: createTokens(count),
		current: 0,
		die: 0,
		sixes: 0,
		message: `${nameOf(0)} rolls for the highest roll. Tap the dice in the center to roll.`,
		legal: [],
		safe: buildSafeCells(),
		rolloff: {
			participants: Array.from({ length: count }, (_, index) => index),
			pointer: 0,
			rolls: new Map()
		},
		winner: -1
	};
	buildBoard();
	buildTokens();
	buildPlayerStrip();
	render();
	focusDice();
};

const updateCountButtons = () => {
	for (const button of countRow.querySelectorAll('.count-button')) {
		const selected = Number(button.dataset.count) === selectedCount;
		button.type = 'button';
		button.classList.toggle('selected', selected);
		button.setAttribute('aria-pressed', String(selected));
	}
};

const showSetup = () => {
	if (state.phase === 'rolling' || state.phase === 'animating') return;
	state.phase = 'setup';
	state.legal = [];
	state.message = 'Best of luck.';
	updateCountButtons();
	render();
	startButton.focus();
};

const selectCount = (event) => {
	const target = event.target;
	if (!(target instanceof Element)) return;
	const button = target.closest('.count-button');
	if (!(button instanceof HTMLElement)) return;
	const value = Number(button.dataset.count);
	if (!Number.isInteger(value) || value < MIN_PLAYERS || value > MAX_PLAYERS) return;
	selectedCount = value;
	updateCountButtons();
};

const clickToken = (event) => {
	const target = event.target;
	if (!(target instanceof Element)) return;
	const element = target.closest('.token');
	if (!(element instanceof HTMLElement)) return;
	const tokenId = Number(element.dataset.tokenId);
	if (!Number.isInteger(tokenId)) return;

	const movable = new Set(state.legal.map((move) => move.tokenId));
	if (!movable.has(tokenId)) return;
	if (event.clientX === 0 && event.clientY === 0) {
		void chooseToken(tokenId);
		return;
	}
	let nearestId = tokenId;
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (const id of movable) {
		const candidate = tokenEls.get(id);
		if (!candidate) continue;
		const rect = candidate.getBoundingClientRect();
		const distance = Math.hypot(
			event.clientX - (rect.left + rect.width / 2),
			event.clientY - (rect.top + rect.height / 2)
		);
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestId = id;
		}
	}
	void chooseToken(nearestId);
};

countRow.onclick = selectCount;
startButton.onclick = () => startGame(selectedCount);
restartButton.onclick = showSetup;
againButton.onclick = showSetup;
diceButton.onclick = () => {
	void rollDice();
};
tokenLayer.onclick = clickToken;

boardSvg.setAttribute('viewBox', '0 0 1000 1000');
boardSvg.setAttribute('role', 'img');
boardSvg.setAttribute('aria-label', 'Ludo board');
messageEl.setAttribute('aria-live', 'polite');
countRow.setAttribute('role', 'group');
countRow.setAttribute('aria-label', 'Number of players');
gameoverScreen.setAttribute('role', 'dialog');
gameoverScreen.setAttribute('aria-modal', 'true');
gameoverScreen.setAttribute('aria-labelledby', 'winner-label');
for (const button of [startButton, restartButton, againButton, diceButton]) {
	button.type = 'button';
}
restartButton.setAttribute('aria-label', 'Restart game');
restartButton.title = 'Restart game';
diceButton.setAttribute('aria-label', 'Roll the dice');

const restoreState = () => {
	const raw = readStoredState();
	if (raw === null) return false;
	try {
		const stored = JSON.parse(raw);
		const phases = ['rolloff', 'await-roll', 'choose', 'gameover'];
		const count = stored?.count;
		const tokensValid =
			Array.isArray(stored?.tokens) &&
			stored.tokens.length === count * TOKENS_PER_PLAYER &&
			stored.tokens.every(
				(token) =>
					token !== null &&
					Number.isInteger(token.id) &&
					Number.isInteger(token.player) &&
					token.player >= 0 &&
					token.player < count &&
					Number.isInteger(token.slot) &&
					token.slot >= 0 &&
					token.slot < TOKENS_PER_PLAYER &&
					Number.isInteger(token.pos) &&
					token.pos >= -1 &&
					token.pos <= FINISH_POS
			);
		const currentValid =
			Number.isInteger(stored?.current) && stored.current >= 0 && stored.current < count;
		const winnerValid =
			stored?.winner === -1 ||
			(Number.isInteger(stored?.winner) && stored.winner >= 0 && stored.winner < count);
		const rolloff = stored?.rolloff;
		const rolloffParticipants = rolloff?.participants;
		const rolloffValid =
			stored?.phase !== 'rolloff' ||
			(Array.isArray(rolloffParticipants) &&
				rolloffParticipants.length > 0 &&
				new Set(rolloffParticipants).size === rolloffParticipants.length &&
				rolloffParticipants.every(
					(player) => Number.isInteger(player) && player >= 0 && player < count
				) &&
				Number.isInteger(rolloff?.pointer) &&
				rolloff.pointer >= 0 &&
				rolloff.pointer < rolloffParticipants.length &&
				Array.isArray(rolloff?.rolls) &&
				rolloff.rolls.every(
					(pair) =>
						Array.isArray(pair) &&
						pair.length === 2 &&
						rolloffParticipants.includes(pair[0]) &&
						Number.isInteger(pair[1]) &&
						pair[1] >= 1 &&
						pair[1] <= DIE_FACES
				));
		const legalValid =
			stored?.phase === 'choose'
				? Array.isArray(stored.legal) &&
					stored.legal.every(
						(move) =>
							move !== null &&
							Number.isInteger(move.tokenId) &&
							move.tokenId >= 0 &&
							move.tokenId < count * TOKENS_PER_PLAYER &&
							Number.isInteger(move.target) &&
							move.target >= 0 &&
							move.target <= FINISH_POS
					)
				: true;
		const valid =
			stored !== null &&
			typeof stored === 'object' &&
			Number.isInteger(count) &&
			count >= MIN_PLAYERS &&
			count <= MAX_PLAYERS &&
			phases.includes(stored.phase) &&
			tokensValid &&
			currentValid &&
			winnerValid &&
			legalValid &&
			rolloffValid &&
			typeof stored.message === 'string' &&
			(stored.phase !== 'gameover' || (stored.winner >= 0 && stored.winner < count));
		if (!valid) {
			clearStoredState();
			return false;
		}
		state = {
			phase: stored.phase,
			count: stored.count,
			tokens: stored.tokens,
			current: stored.current,
			die: Number.isInteger(stored.die) ? stored.die : 0,
			sixes: Number.isInteger(stored.sixes) ? stored.sixes : 0,
			message: stored.message,
			legal: stored.phase === 'choose' ? stored.legal : [],
			safe: buildSafeCells(),
			rolloff: {
				participants: stored.rolloff?.participants ?? [],
				pointer: stored.rolloff?.pointer ?? 0,
				rolls: new Map(stored.rolloff?.rolls ?? [])
			},
			winner: stored.winner ?? -1
		};
		selectedCount = state.count;
		buildBoard();
		buildTokens();
		buildPlayerStrip();
		updateCountButtons();
		render();
		return true;
	} catch {
		clearStoredState();
		resetState();
		return false;
	}
};

if (!restoreState()) {
	updateCountButtons();
	render();
}
