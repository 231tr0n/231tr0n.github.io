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

	const reset = () => {
		steps.length = 0;
		game_over = false;
		message.innerText = 'Best of Luck!';
		for (let i = 0; i < 3; i ++) {
			for (let j = 0; j < 3; j ++) {
				xobox[i][j].innerText = '';
			}
		}
		turn = x;
	};

	const predict_winner = () => {
		if (game_over) {
			if (steps.length != 9) {
				message.innerText = `Congratulations! ${turn} won.`;
			} else {
				message.innerText = 'It\'s a tie!';
				game_over = true;
			}
		}
	};

	const next = (i, j) => {
		if (xobox[i][j].innerText == '') {
			predict_winner();
			xobox[i][j].innerText = turn;
			steps.push([i, j, turn]);
			game_over = check();
			predict_winner();
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
				xobox[temp[0]][temp[1]].innerText = '';
				turn = temp[2];
			}
		}
	};

	restart.onclick = () => {
		reset();
	};

	xobox[0][0].onclick = () => {
		next(0, 0);
	};
	xobox[0][1].onclick = () => {
		next(0, 1);
	};
	xobox[0][2].onclick = () => {
		next(0, 2);
	};
	xobox[1][0].onclick = () => {
		next(1, 0);
	};
	xobox[1][1].onclick = () => {
		next(1, 1);
	};
	xobox[1][2].onclick = () => {
		next(1, 2);
	};
	xobox[2][0].onclick = () => {
		next(2, 0);
	};
	xobox[2][1].onclick = () => {
		next(2, 1);
	};
	xobox[2][2].onclick = () => {
		next(2, 2);
	};
	xobox[0][0].ondblclick = () => {
		prev();
	};
	xobox[0][1].ondblclick = () => {
		prev();
	};
	xobox[0][2].ondblclick = () => {
		prev();
	};
	xobox[1][0].ondblclick = () => {
		prev();
	};
	xobox[1][1].ondblclick = () => {
		prev();
	};
	xobox[1][2].ondblclick = () => {
		prev();
	};
	xobox[2][0].ondblclick = () => {
		prev();
	};
	xobox[2][1].ondblclick = () => {
		prev();
	};
	xobox[2][2].ondblclick = () => {
		prev();
	};
})();
