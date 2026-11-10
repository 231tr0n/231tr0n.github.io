const board = document.getElementById('game-board');
const cells = [];
for (let i = 0; i < 3; i++) {
	for (let j = 0; j < 3; j++) {
		cells.push(document.getElementById(`${i}${j}`));
	}
}
const cellAt = (r, c) => cells.at(r * 3 + c);
const WIN_INDICES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];
const marksWin = (marks, mark) =>
	WIN_INDICES.some((line) => line.every((index) => marks.at(index) === mark));

const msg = document.getElementById('message');
const restart = document.getElementById('restart');
let turn = 'X';
let moves = 0;
let gameOver = false;

const STORAGE_KEY = 'tictactoe-game-state';

const {
	read: readStoredState,
	write: writeStoredState,
	clear: clearStoredState
} = window.createSnippetStorage(STORAGE_KEY);

const winningMark = () => {
	const marks = cells.map((cell) => cell.textContent ?? '');
	if (marksWin(marks, 'X')) return 'X';
	if (marksWin(marks, 'O')) return 'O';
	return '';
};

const win = () => winningMark() !== '';

const paint = (cell, mark) => {
	cell.textContent = mark;
	cell.classList.toggle('x', mark === 'X');
	cell.classList.toggle('o', mark === 'O');
	const label = cell.dataset.label ?? 'Cell';
	cell.setAttribute('aria-label', mark ? `${label}, ${mark}` : label);
	const occupied = mark !== '';
	cell.setAttribute('aria-disabled', String(occupied));
	cell.tabIndex = occupied ? -1 : 0;
};

const setGameOver = (over) => {
	gameOver = over;
	board.classList.toggle('game-over', over);
	if (!over) return;
	for (const cell of cells) {
		cell.setAttribute('aria-disabled', 'true');
		cell.tabIndex = -1;
	}
};

const saveState = () => {
	writeStoredState(
		JSON.stringify({
			cells: cells.map((cell) => cell.textContent)
		})
	);
};

const reset = (clearStorage = true) => {
	for (const cell of cells) paint(cell, '');
	turn = 'X';
	moves = 0;
	setGameOver(false);
	msg.textContent = "X's turn";
	if (clearStorage) clearStoredState();
};

const restoreState = () => {
	const raw = readStoredState();
	if (raw === null) return false;
	try {
		const stored = JSON.parse(raw);
		if (
			stored === null ||
			typeof stored !== 'object' ||
			!Array.isArray(stored.cells) ||
			stored.cells.length !== cells.length
		) {
			clearStoredState();
			return false;
		}
		const marks = stored.cells.map((mark) => (mark === 'X' || mark === 'O' ? mark : ''));
		const xCount = marks.filter((mark) => mark === 'X').length;
		const oCount = marks.filter((mark) => mark === 'O').length;
		const xWin = marksWin(marks, 'X');
		const oWin = marksWin(marks, 'O');
		if (
			marks.some((mark, index) => mark !== stored.cells.at(index)) ||
			(xCount !== oCount && xCount !== oCount + 1) ||
			(xWin && oWin) ||
			(xWin && xCount !== oCount + 1) ||
			(oWin && xCount !== oCount)
		) {
			clearStoredState();
			return false;
		}
		reset(false);
		marks.forEach((mark, index) => {
			const cell = cells.at(index);
			if (cell) paint(cell, mark);
		});
		moves = xCount + oCount;
		turn = xCount === oCount ? 'X' : 'O';
		const winner = xWin ? 'X' : oWin ? 'O' : '';
		if (winner) {
			turn = winner;
			setGameOver(true);
			msg.textContent = `'${winner}' won`;
		} else if (moves === cells.length) {
			setGameOver(true);
			msg.textContent = "It's a tie";
		} else {
			msg.textContent = `${turn}'s turn`;
		}
		return true;
	} catch {
		clearStoredState();
		return false;
	}
};

const play = (i, j) => {
	const cell = cellAt(i, j);
	if (gameOver || cell.textContent) return;
	paint(cell, turn);
	moves++;
	if (win()) {
		setGameOver(true);
		msg.textContent = `'${turn}' won`;
	} else if (moves === cells.length) {
		setGameOver(true);
		msg.textContent = "It's a tie";
	} else {
		turn = turn === 'X' ? 'O' : 'X';
		msg.textContent = `${turn}'s turn`;
	}
	saveState();
};

msg.setAttribute('role', 'status');
msg.setAttribute('aria-live', 'polite');
restart.onclick = () => reset();
for (let i = 0; i < 3; i++) {
	for (let j = 0; j < 3; j++) {
		const cell = cellAt(i, j);
		cell.dataset.label = `Row ${i + 1}, column ${j + 1}`;
		cell.setAttribute('role', 'button');
		cell.setAttribute('aria-label', cell.dataset.label);
		cell.tabIndex = 0;
		cell.onclick = () => play(i, j);
		cell.onkeydown = (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				play(i, j);
			}
		};
	}
}
if (!restoreState()) reset();
