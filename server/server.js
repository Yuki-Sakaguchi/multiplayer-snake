/**
 * サーバー処理
 */
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

const { initGame, gameLoop, getUpdateVelocity } = require('./game');
const { makeId } = require('./utils');
const { FRAME_RATE } = require('./constants');

const state = {};
const clientRooms = {};

const PORT = process.env.PORT || 5000;

io.on('connect', client => {

  function handleKeydown (keyCode) {
    const roomName = clientRooms[client.id];

    if (!roomName) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.log(e);
      return;
    }

    const vel = getUpdateVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }

  function handleNewGame () {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleJoinGame (gameCode) {
    const room = io.sockets.adapter.rooms.get(gameCode); // 部屋番号から部屋を取得

    // ユーザーが取得できたらユーザーの数が自分の番号とする（一番後ろになる）
    let numClients = 0;
    if (room) {
      numClients = room.size;
    }

    // エラーハンドリング
    if (numClients === 0) {
      // 自分しかいなかったらゲームがないことになる
      client.emit('unknownGame');
      return;
    } else if (numClients > 1) {
      // すでに人がいたら人数制限を肥えていることにする
      client.emit('tooManyPlayers');
      return;
    }

    // その人の入っている部屋を保存して、部屋に入室
    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    client.number = 2;
    client.emit('init', 2);

    startGameInterval(gameCode);
  }

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState (roomName, state) {
  io.sockets.in(roomName)
    .emit('gameState', JSON.stringify(state));
}

function emitGameOver (roomName, winner) {
  io.sockets.in(roomName)
    .emit('gameOver', JSON.stringify({ winner }));
}

app.use(express.static('frontend'));
httpServer.listen(PORT);

