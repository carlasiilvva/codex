const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const statusLabel = document.getElementById("status");
const scoreBlue = document.getElementById("score-blue");
const scoreOrange = document.getElementById("score-orange");

const cellSize = 6;
const cols = canvas.width / cellSize;
const rows = canvas.height / cellSize;

const palette = {
  blue: "#33d1ff",
  orange: "#ff8a3d",
  grid: "#12263a",
  wall: "#f4fbff",
};

const directionMap = {
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowRight: { x: 1, y: 0 },
};

const controls = {
  blue: ["w", "a", "s", "d"],
  orange: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"],
};

const state = {
  board: [],
  running: false,
  lastFrame: 0,
  tickLength: 55,
  scores: {
    blue: 0,
    orange: 0,
  },
  players: [],
};

function createBoard() {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function createPlayer(id, color, x, y, direction) {
  return {
    id,
    color,
    alive: true,
    direction,
    nextDirection: direction,
    trail: [{ x, y }],
    head: { x, y },
  };
}

function isOpposite(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

function resetRound(message = "Pulsa una dirección para empezar la ronda.") {
  state.board = createBoard();
  state.running = false;
  state.lastFrame = 0;
  state.players = [
    createPlayer("blue", palette.blue, 12, Math.floor(rows / 2), { x: 1, y: 0 }),
    createPlayer(
      "orange",
      palette.orange,
      cols - 13,
      Math.floor(rows / 2),
      { x: -1, y: 0 }
    ),
  ];

  for (const player of state.players) {
    state.board[player.head.y][player.head.x] = player.id;
  }

  updateStatus(message);
  draw();
}

function updateStatus(message) {
  statusLabel.textContent = message;
  scoreBlue.textContent = state.scores.blue;
  scoreOrange.textContent = state.scores.orange;
}

function setDirection(key) {
  const bluePressed = controls.blue.includes(key);
  const orangePressed = controls.orange.includes(key);
  const player = state.players.find((candidate) =>
    bluePressed ? candidate.id === "blue" : orangePressed ? candidate.id === "orange" : false
  );

  if (!player || !player.alive) {
    return;
  }

  const next = directionMap[key];
  if (!next || isOpposite(player.direction, next)) {
    return;
  }

  player.nextDirection = next;

  if (!state.running) {
    state.running = true;
    updateStatus("Duelo en curso. No toques ninguna estela.");
    requestAnimationFrame(loop);
  }
}

function getWinnerLabel(winnerId) {
  return winnerId === "blue" ? "Azul" : "Naranja";
}

function finishRound(message, winnerId) {
  state.running = false;

  if (winnerId) {
    state.scores[winnerId] += 1;
  }

  updateStatus(`${message} Pulsa R para otra ronda.`);
}

function step() {
  const plannedMoves = state.players
    .filter((player) => player.alive)
    .map((player) => {
      player.direction = player.nextDirection;
      return {
        player,
        x: player.head.x + player.direction.x,
        y: player.head.y + player.direction.y,
      };
    });

  const collisions = new Set();

  for (const move of plannedMoves) {
    const outside =
      move.x < 0 || move.x >= cols || move.y < 0 || move.y >= rows;

    if (outside || state.board[move.y]?.[move.x]) {
      collisions.add(move.player.id);
    }
  }

  if (plannedMoves.length === 2) {
    const [a, b] = plannedMoves;
    const sameCell = a.x === b.x && a.y === b.y;
    const headSwap =
      a.x === b.player.head.x &&
      a.y === b.player.head.y &&
      b.x === a.player.head.x &&
      b.y === a.player.head.y;

    if (sameCell || headSwap) {
      collisions.add(a.player.id);
      collisions.add(b.player.id);
    }
  }

  if (collisions.size > 0) {
    for (const player of state.players) {
      if (collisions.has(player.id)) {
        player.alive = false;
      }
    }

    const survivors = state.players.filter((player) => player.alive);
    if (survivors.length === 1) {
      finishRound(`Punto para ${getWinnerLabel(survivors[0].id)}.`, survivors[0].id);
    } else {
      finishRound("Empate por colisión simultánea.");
    }
    draw();
    return;
  }

  for (const move of plannedMoves) {
    move.player.head = { x: move.x, y: move.y };
    move.player.trail.push(move.player.head);
    state.board[move.y][move.x] = move.player.id;
  }

  draw();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += cellSize * 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += cellSize * 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTrail(player) {
  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;

  for (const segment of player.trail) {
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  }

  ctx.fillStyle = palette.wall;
  ctx.fillRect(
    player.head.x * cellSize,
    player.head.y * cellSize,
    cellSize,
    cellSize
  );
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  state.players.forEach(drawTrail);
}

function loop(timestamp) {
  if (!state.running) {
    return;
  }

  if (!state.lastFrame) {
    state.lastFrame = timestamp;
  }

  const elapsed = timestamp - state.lastFrame;
  if (elapsed >= state.tickLength) {
    state.lastFrame = timestamp;
    step();
  }

  if (state.running) {
    requestAnimationFrame(loop);
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") {
    resetRound();
    return;
  }

  if (directionMap[event.key]) {
    event.preventDefault();
    setDirection(event.key);
  }
});

resetRound();
