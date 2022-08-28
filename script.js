const prev_button = document.getElementById('prev');
const next_button = document.getElementById('next');

prev_button.onclick = () => {
	prev_button.blur();
};

next_button.onclick = () => {
	next_button.blur();
};

(() => {
	const xobox = [];
	const x = '❌';
	const o = '⭕';
	let turn = x;
	const steps = [];
	let game_over = false;
	const message = document.getElementById('message');
	const restart = document.getElementById('restart');

	for (let i = 0; i < 3; i ++) {
		xobox.push([]);
		for (let j = 0; j < 3; j ++) {
			xobox[i].push(document.getElementById(i.toString() + j.toString()));
		}
	}

	const check = () => {
		if (xobox[0][0].innerText != '' && xobox[0][0].innerText == xobox[0][1].innerText && xobox[0][0].innerText == xobox[0][2].innerText) {
			return true;
		}
		if (xobox[1][0].innerText != '' && xobox[1][0].innerText == xobox[1][1].innerText && xobox[1][0].innerText == xobox[1][2].innerText) {
			return true;
		}
		if (xobox[2][0].innerText != '' && xobox[2][0].innerText == xobox[2][1].innerText && xobox[2][0].innerText == xobox[2][2].innerText) {
			return true;
		}
		if (xobox[0][0].innerText != '' && xobox[0][0].innerText == xobox[1][0].innerText && xobox[0][0].innerText == xobox[2][0].innerText) {
			return true;
		}
		if (xobox[0][1].innerText != '' && xobox[0][1].innerText == xobox[1][1].innerText && xobox[0][1].innerText == xobox[2][1].innerText) {
			return true;
		}
		if (xobox[0][2].innerText != '' && xobox[0][2].innerText == xobox[1][2].innerText && xobox[0][2].innerText == xobox[2][2].innerText) {
			return true;
		}
		if (xobox[0][0].innerText != '' && xobox[0][0].innerText == xobox[1][1].innerText && xobox[0][0].innerText == xobox[2][2].innerText) {
			return true;
		}
		if (xobox[2][0].innerText != '' && xobox[2][0].innerText == xobox[1][1].innerText && xobox[2][0].innerText == xobox[0][2].innerText) {
			return true;
		}
		return false;
	};

	const getter = (i, j) => xobox[i][j].innerText;

	const setter = (i, j, value) => {
		xobox[i][j].innerText = value;
	};

	const reset = () => {
		restart.blur();
		steps.length = 0;
		game_over = false;
		message.innerText = 'Best of Luck!';
		for (let i = 0; i < 3; i ++) {
			for (let j = 0; j < 3; j ++) {
				setter(i, j, '');
			}
		}
		turn = x;
	};

	const predict_winner = () => {
		if (check()) {
			message.innerText = `Congratulations! ${turn} won.`;
			game_over = true;
			return true;
		}
		if (steps.length == 9) {
			message.innerText = 'It\'s a tie!';
			game_over = true;
			return true;
		}
		game_over = false;
		return false;
	};

	const next = (i, j) => {
		if (getter(i, j) == '') {
			if (predict_winner()) {
				return;
			}
			setter(i, j, turn);
			steps.push([i, j, turn]);
			if (predict_winner()) {
				return;
			}
			if (turn == x) {
				turn = o;
			} else {
				turn = x;
			}
		}
	};

	const prev = () => {
		if (!game_over) {
			if (steps.length > 0) {
				const temp = steps.pop();
				setter(temp[0], temp[1], '');
				turn = temp[2];
			}
		}
	};

	restart.onclick = () => {
		reset();
	};

	for (let i = 0; i < 3; i ++) {
		for (let j = 0; j < 3; j ++) {
			(() => {
				xobox[i][j].onclick = () => {
					next(i, j);
				};
				xobox[i][j].ondblclick = () => {
					prev();
				};
			})();
		}
	}
})();

(() => {
	const message = document.getElementById('message1');
	const restart = document.getElementById('restart1');
	const answer = 'POWER';
	const matrix = [];
	let game_over = false;
	let x = 0;
	let y = 0;

	for (let i = 0; i < 6; i ++) {
		matrix.push([]);
		for (let j = 0; j < 5; j ++) {
			matrix[i][j] = document.getElementById(`w${i}${j}`);
			matrix[i][j].innerText = '';
		}
	}

	const setter = (i, j, value) => {
		matrix[i][j].innerText = value.toUpperCase();
	};

	const csetter = (i, j, color) => {
		matrix[i][j].style.backgroundColor = color;
	};

	const getter = (i, j) => matrix[i][j].innerText;

	const updater = (value) => {
		matrix[x][y].innerText = value.toUpperCase();
	};

	const reset = () => {
		restart.blur();
		message.innerText = 'Best of Luck!';
		game_over = false;
		x = 0;
		y = 0;
		for (let i = 0; i < 6; i ++) {
			for (let j = 0; j < 5; j ++) {
				setter(i, j, '');
				csetter(i, j, '#212529');
			}
		}
	};

	const newline = () => {
		if (x < 5) {
			x += 1;
			y = 0;
			return true;
		}
		return false;
	};

	const check = () => {
		let score = 0;
		const test = answer.toUpperCase().split('');
		for (let j = 0; j < 5; j ++) {
			const temp = getter(x, j);
			if (answer[j] == temp) {
				csetter(x, j, '#538d4e');
				test.splice(j, 1);
				score += 1;
			} else {
				if (test.includes(temp)) {
					csetter(x, j, '#b59f3b');
					test.splice(test.indexOf(temp), 1);
				}
			}
		}
		return score;
	};

	const increment = () => {
		if (y < 5) {
			y += 1;
			return true;
		}
		return false;
	};

	const decrement = () => {
		if (y > 0) {
			y -= 1;
			return true;
		}
		return false;
	};

	restart.onclick = () => {
		reset();
	};

	document.addEventListener('keydown', (event) => {
		if (!game_over) {
			if (event.key == 'Backspace') {
				decrement();
				updater('');
			} else if (event.key == 'Enter') {
				if (y == 5) {
					const score = check();
					if (score == 5) {
						game_over = true;
						message.innerText = `Congratulations! The word is '${answer}'.`;
						return;
					}
					const new_word = newline();
					if (!new_word) {
						game_over = true;
						message.innerText = `Well Tried! The word is '${answer}'.`;
					}
				}
			} else if (event.key.toUpperCase() !== event.key.toLowerCase() && event.key.length == 1) {
				if (y < 5) {
					updater(event.key.toUpperCase());
					increment();
				}
			}
		}
	});
})();
