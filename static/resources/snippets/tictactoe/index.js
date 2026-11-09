const board = document.getElementById('game-board');
const cells = [];
for (let i = 0; i < 3; i++) {
	for (let j = 0; j < 3; j++) {
		cells.push(document.getElementById(`${i}${j}`));
	}
}

const cellAt = (r, c) => cells.at(r * 3 + c);
const WIN_LINES = [
	[cellAt(0, 0), cellAt(0, 1), cellAt(0, 2)],
	[cellAt(1, 0), cellAt(1, 1), cellAt(1, 2)],
	[cellAt(2, 0), cellAt(2, 1), cellAt(2, 2)],
	[cellAt(0, 0), cellAt(1, 0), cellAt(2, 0)],
	[cellAt(0, 1), cellAt(1, 1), cellAt(2, 1)],
	[cellAt(0, 2), cellAt(1, 2), cellAt(2, 2)],
	[cellAt(0, 0), cellAt(1, 1), cellAt(2, 2)],
	[cellAt(2, 0), cellAt(1, 1), cellAt(0, 2)]
];

const msg = document.getElementById('message');
const restart = document.getElementById('restart');
let turn = 'X';
let moves = 0;

const win = () =>
	WIN_LINES.some(
		([a, b, c]) =>
			a.textContent && a.textContent === b.textContent && a.textContent === c.textContent
	);

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
	board.classList.toggle('game-over', over);
	if (!over) return;
	for (const cell of cells) {
		cell.setAttribute('aria-disabled', 'true');
		cell.tabIndex = -1;
	}
};

const reset = () => {
	for (const cell of cells) paint(cell, '');
	turn = 'X';
	moves = 0;
	setGameOver(false);
	msg.textContent = "X's turn";
};

const play = (i, j) => {
	const cell = cellAt(i, j);
	if (cell.textContent || win()) return;
	paint(cell, turn);
	moves++;
	if (win()) {
		setGameOver(true);
		msg.textContent = `'${turn}' won`;
	} else if (moves === 9) {
		setGameOver(true);
		msg.textContent = "It's a tie";
	} else {
		turn = turn === 'X' ? 'O' : 'X';
		msg.textContent = `${turn}'s turn`;
	}
};

reset();
msg.setAttribute('role', 'status');
msg.setAttribute('aria-live', 'polite');
restart.onclick = reset;
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
