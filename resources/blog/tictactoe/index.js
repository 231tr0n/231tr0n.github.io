(() => {
  const xobox = [];
  const x = 'x';
  const o = 'o';
  let turn = x;
  const steps = [];
  let game_over = false;
  const grid = document.getElementById('game-board');
  const message = document.getElementById('message');
  const restart = document.getElementById('restart');

  for (let i = 0; i < 3; i++) {
    xobox.push([]);
    for (let j = 0; j < 3; j++) {
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
    grid.focus();
    steps.length = 0;
    game_over = false;
    message.innerText = 'Best of Luck!';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        setter(i, j, '');
      }
    }
    turn = x;
  };

  const predict_winner = () => {
    if (check()) {
      message.innerText = "Congratulations! '" + turn + "' won.";
      game_over = true;
      return true;
    }
    if (steps.length == 9) {
      message.innerText = "It's a tie!";
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

  restart.onclick = () => {
    reset();
  };

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      (() => {
        xobox[i][j].onclick = () => {
          grid.focus();
          next(i, j);
        };
        xobox[i][j].ondblclick = () => {
          grid.focus();
          prev();
        };
      })();
    }
  }
})();
