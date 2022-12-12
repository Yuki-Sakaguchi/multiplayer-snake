/**
 * サーバー処理
 */
const io = require('socket.io')();
const { createGameState, gameLoop, getUpdateVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');

io.on('connection', client => {
  const state = createGameState();

  function hanleKeydown (keyCode) {
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.log(e);
      return;
    }

    const vel = getUpdateVelocity(keyCode);
    console.log(keyCode, vel)

    if (vel) {
      state.player.vel = vel;
    }
  }


  client.on('keydown', hanleKeydown);

  startGameInterval(client, state);
});

function startGameInterval(client, state) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state);
    if (!winner) {
      client.emit('gameState', JSON.stringify(state));
    } else {
      client.emit('gameOver');
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

io.listen(3000);
