const cells = [];
for (let i = 0; i < 3; i++) {
	cells[i] = [];
	for (let j = 0; j < 3; j++) {
		cells[i][j] = document.getElementById(`${i}${j}`);
	}
}

const msg = document.getElementById('message');
const restart = document.getElementById('restart');
let turn = 'X';
let moves = 0;

const win = () => {
	const lines = [
		[cells[0][0], cells[0][1], cells[0][2]],
		[cells[1][0], cells[1][1], cells[1][2]],
		[cells[2][0], cells[2][1], cells[2][2]],
		[cells[0][0], cells[1][0], cells[2][0]],
		[cells[0][1], cells[1][1], cells[2][1]],
		[cells[0][2], cells[1][2], cells[2][2]],
		[cells[0][0], cells[1][1], cells[2][2]],
		[cells[2][0], cells[1][1], cells[0][2]]
	];
	return lines.some(
		([a, b, c]) => a.innerText && a.innerText === b.innerText && a.innerText === c.innerText
	);
};

const reset = () => {
	restart.blur();
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			cells[i][j].innerText = '';
		}
	}
	turn = 'X';
	moves = 0;
	msg.innerText = 'Best of Luck';
};

const play = (i, j) => {
	const cell = cells[i][j];
	if (cell.innerText || win()) return;
	cell.innerText = turn;
	moves++;
	if (win()) {
		msg.innerText = `'${turn}' won`;
	} else if (moves === 9) {
		msg.innerText = "It's a tie";
	} else {
		turn = turn === 'X' ? 'O' : 'X';
	}
};

reset();
restart.onclick = reset;
for (let i = 0; i < 3; i++) {
	for (let j = 0; j < 3; j++) {
		cells[i][j].onclick = () => play(i, j);
	}
}
