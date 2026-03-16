const boardNode = document.getElementById("board");
const turnLabel = document.getElementById("turn-label");
const statusLabel = document.getElementById("status-label");
const difficultyLabel = document.getElementById("difficulty-label");
const difficultySelect = document.getElementById("difficulty-select");
const resetButton = document.getElementById("reset-button");
const capturedBlackNode = document.getElementById("captured-black");
const capturedWhiteNode = document.getElementById("captured-white");

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PIECES = {
  wp: "♟",
  wn: "♞",
  wb: "♝",
  wr: "♜",
  wq: "♛",
  wk: "♚",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 5, 5, 0, 0, 0],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

const initialBoard = () => [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];

const createState = () => ({
  board: initialBoard(),
  turn: "w",
  selected: null,
  legalMoves: [],
  thinking: false,
  message: "Haz tu primera jugada.",
  lastMove: null,
  winner: null,
  check: false,
  aiDepth: Number(difficultySelect.value),
  enPassant: null,
  halfmoveClock: 0,
  fullmove: 1,
  castling: {
    w: { kingSide: true, queenSide: true },
    b: { kingSide: true, queenSide: true },
  },
  capturedByWhite: [],
  capturedByBlack: [],
});

let state = createState();

function cloneState(source) {
  return {
    ...source,
    board: source.board.map((row) => [...row]),
    selected: source.selected ? { ...source.selected } : null,
    legalMoves: source.legalMoves.map((move) => ({ ...move })),
    lastMove: source.lastMove ? { ...source.lastMove } : null,
    enPassant: source.enPassant ? { ...source.enPassant } : null,
    castling: {
      w: { ...source.castling.w },
      b: { ...source.castling.b },
    },
    capturedByWhite: [...source.capturedByWhite],
    capturedByBlack: [...source.capturedByBlack],
  };
}

function inBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function coordToName(row, col) {
  return `${FILES[col]}${8 - row}`;
}

function isEnemy(piece, turn) {
  return piece && piece[0] !== turn;
}

function isFriend(piece, turn) {
  return piece && piece[0] === turn;
}

function kingPosition(board, turn) {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (board[row][col] === `${turn}k`) {
        return { row, col };
      }
    }
  }

  return null;
}

function squareAttacked(board, row, col, byTurn) {
  const pawnDir = byTurn === "w" ? -1 : 1;
  const pawnRow = row - pawnDir;
  for (const offset of [-1, 1]) {
    const pawnCol = col + offset;
    if (inBounds(pawnRow, pawnCol) && board[pawnRow][pawnCol] === `${byTurn}p`) {
      return true;
    }
  }

  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightMoves) {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (inBounds(nextRow, nextCol) && board[nextRow][nextCol] === `${byTurn}n`) {
      return true;
    }
  }

  const sliders = [
    { dirs: [[1, 0], [-1, 0], [0, 1], [0, -1]], pieces: ["r", "q"] },
    { dirs: [[1, 1], [1, -1], [-1, 1], [-1, -1]], pieces: ["b", "q"] },
  ];
  for (const slider of sliders) {
    for (const [dr, dc] of slider.dirs) {
      let nextRow = row + dr;
      let nextCol = col + dc;
      while (inBounds(nextRow, nextCol)) {
        const piece = board[nextRow][nextCol];
        if (piece) {
          if (piece[0] === byTurn && slider.pieces.includes(piece[1])) {
            return true;
          }
          break;
        }
        nextRow += dr;
        nextCol += dc;
      }
    }
  }

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) {
        continue;
      }
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (inBounds(nextRow, nextCol) && board[nextRow][nextCol] === `${byTurn}k`) {
        return true;
      }
    }
  }

  return false;
}

function inCheck(board, turn) {
  const king = kingPosition(board, turn);
  if (!king) {
    return false;
  }
  return squareAttacked(board, king.row, king.col, turn === "w" ? "b" : "w");
}

function pushMove(moves, move) {
  moves.push({
    promotion: null,
    isCastle: false,
    isEnPassant: false,
    captured: null,
    ...move,
  });
}

function pseudoMoves(gameState, row, col) {
  const board = gameState.board;
  const piece = board[row][col];
  if (!piece) {
    return [];
  }

  const turn = piece[0];
  const type = piece[1];
  const moves = [];

  if (type === "p") {
    const dir = turn === "w" ? -1 : 1;
    const startRow = turn === "w" ? 6 : 1;
    const promotionRow = turn === "w" ? 0 : 7;
    const oneRow = row + dir;

    if (inBounds(oneRow, col) && !board[oneRow][col]) {
      pushMove(moves, {
        fromRow: row,
        fromCol: col,
        toRow: oneRow,
        toCol: col,
        promotion: oneRow === promotionRow ? "q" : null,
      });

      const twoRow = row + dir * 2;
      if (row === startRow && !board[twoRow][col]) {
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: twoRow,
          toCol: col,
        });
      }
    }

    for (const offset of [-1, 1]) {
      const nextCol = col + offset;
      if (!inBounds(oneRow, nextCol)) {
        continue;
      }

      const target = board[oneRow][nextCol];
      if (isEnemy(target, turn)) {
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: oneRow,
          toCol: nextCol,
          captured: target,
          promotion: oneRow === promotionRow ? "q" : null,
        });
      }

      if (
        gameState.enPassant &&
        gameState.enPassant.row === oneRow &&
        gameState.enPassant.col === nextCol
      ) {
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: oneRow,
          toCol: nextCol,
          captured: `${turn === "w" ? "b" : "w"}p`,
          isEnPassant: true,
        });
      }
    }
  }

  if (type === "n") {
    const jumps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of jumps) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (!inBounds(nextRow, nextCol) || isFriend(board[nextRow][nextCol], turn)) {
        continue;
      }
      pushMove(moves, {
        fromRow: row,
        fromCol: col,
        toRow: nextRow,
        toCol: nextCol,
        captured: board[nextRow][nextCol],
      });
    }
  }

  if (["b", "r", "q"].includes(type)) {
    const directions = [];
    if (["b", "q"].includes(type)) {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    }
    if (["r", "q"].includes(type)) {
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
    }

    for (const [dr, dc] of directions) {
      let nextRow = row + dr;
      let nextCol = col + dc;
      while (inBounds(nextRow, nextCol)) {
        const target = board[nextRow][nextCol];
        if (isFriend(target, turn)) {
          break;
        }

        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: nextRow,
          toCol: nextCol,
          captured: target,
        });

        if (target) {
          break;
        }

        nextRow += dr;
        nextCol += dc;
      }
    }
  }

  if (type === "k") {
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) {
          continue;
        }
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (!inBounds(nextRow, nextCol) || isFriend(board[nextRow][nextCol], turn)) {
          continue;
        }
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: nextRow,
          toCol: nextCol,
          captured: board[nextRow][nextCol],
        });
      }
    }

    const castleRow = turn === "w" ? 7 : 0;
    if (row === castleRow && col === 4 && !inCheck(board, turn)) {
      if (
        gameState.castling[turn].kingSide &&
        !board[castleRow][5] &&
        !board[castleRow][6] &&
        !squareAttacked(board, castleRow, 5, turn === "w" ? "b" : "w") &&
        !squareAttacked(board, castleRow, 6, turn === "w" ? "b" : "w") &&
        board[castleRow][7] === `${turn}r`
      ) {
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: castleRow,
          toCol: 6,
          isCastle: true,
        });
      }

      if (
        gameState.castling[turn].queenSide &&
        !board[castleRow][1] &&
        !board[castleRow][2] &&
        !board[castleRow][3] &&
        !squareAttacked(board, castleRow, 3, turn === "w" ? "b" : "w") &&
        !squareAttacked(board, castleRow, 2, turn === "w" ? "b" : "w") &&
        board[castleRow][0] === `${turn}r`
      ) {
        pushMove(moves, {
          fromRow: row,
          fromCol: col,
          toRow: castleRow,
          toCol: 2,
          isCastle: true,
        });
      }
    }
  }

  return moves;
}

function applyMove(gameState, move) {
  const next = cloneState(gameState);
  const piece = next.board[move.fromRow][move.fromCol];
  const turn = piece[0];
  const enemy = turn === "w" ? "b" : "w";
  let placedPiece = piece;

  next.board[move.fromRow][move.fromCol] = null;

  if (move.isEnPassant) {
    const captureRow = move.toRow + (turn === "w" ? 1 : -1);
    next.board[captureRow][move.toCol] = null;
  }

  if (move.isCastle) {
    if (move.toCol === 6) {
      next.board[move.toRow][5] = next.board[move.toRow][7];
      next.board[move.toRow][7] = null;
    } else {
      next.board[move.toRow][3] = next.board[move.toRow][0];
      next.board[move.toRow][0] = null;
    }
  }

  if (move.promotion) {
    placedPiece = `${turn}${move.promotion}`;
  }

  const capturedPiece = move.isEnPassant
    ? `${enemy}p`
    : next.board[move.toRow][move.toCol];

  next.board[move.toRow][move.toCol] = placedPiece;
  next.selected = null;
  next.legalMoves = [];
  next.lastMove = { ...move };
  next.enPassant = null;
  next.turn = enemy;
  next.check = false;
  next.winner = null;

  if (piece[1] === "p" && Math.abs(move.toRow - move.fromRow) === 2) {
    next.enPassant = { row: (move.toRow + move.fromRow) / 2, col: move.toCol };
  }

  if (piece[1] === "k") {
    next.castling[turn].kingSide = false;
    next.castling[turn].queenSide = false;
  }

  if (piece[1] === "r") {
    if (move.fromRow === (turn === "w" ? 7 : 0) && move.fromCol === 0) {
      next.castling[turn].queenSide = false;
    }
    if (move.fromRow === (turn === "w" ? 7 : 0) && move.fromCol === 7) {
      next.castling[turn].kingSide = false;
    }
  }

  if (capturedPiece === `${enemy}r`) {
    if (move.toRow === (enemy === "w" ? 7 : 0) && move.toCol === 0) {
      next.castling[enemy].queenSide = false;
    }
    if (move.toRow === (enemy === "w" ? 7 : 0) && move.toCol === 7) {
      next.castling[enemy].kingSide = false;
    }
  }

  if (capturedPiece) {
    if (turn === "w") {
      next.capturedByWhite.push(capturedPiece);
    } else {
      next.capturedByBlack.push(capturedPiece);
    }
  }

  next.halfmoveClock =
    piece[1] === "p" || capturedPiece ? 0 : next.halfmoveClock + 1;
  if (turn === "b") {
    next.fullmove += 1;
  }

  return next;
}

function legalMovesForSquare(gameState, row, col) {
  const piece = gameState.board[row][col];
  if (!piece || piece[0] !== gameState.turn) {
    return [];
  }

  return pseudoMoves(gameState, row, col).filter((move) => {
    const nextState = applyMove(gameState, move);
    return !inCheck(nextState.board, piece[0]);
  });
}

function allLegalMoves(gameState, turn = gameState.turn) {
  const temp = { ...gameState, turn };
  const moves = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = temp.board[row][col];
      if (piece && piece[0] === turn) {
        moves.push(...legalMovesForSquare(temp, row, col));
      }
    }
  }
  return moves;
}

function evaluateBoard(board) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece) {
        continue;
      }
      const value = PIECE_VALUES[piece[1]];
      const table =
        piece[0] === "w" ? PST[piece[1]][row][col] : PST[piece[1]][7 - row][col];
      const signed = value + table;
      score += piece[0] === "b" ? signed : -signed;
    }
  }
  return score;
}

function evaluateState(gameState) {
  const currentMoves = allLegalMoves(gameState, gameState.turn);
  if (currentMoves.length === 0) {
    if (inCheck(gameState.board, gameState.turn)) {
      return gameState.turn === "b" ? -999999 : 999999;
    }
    return 0;
  }

  let score = evaluateBoard(gameState.board);
  score += allLegalMoves(gameState, "b").length * 4;
  score -= allLegalMoves(gameState, "w").length * 4;

  if (inCheck(gameState.board, "w")) {
    score += 24;
  }
  if (inCheck(gameState.board, "b")) {
    score -= 24;
  }

  return score;
}

function sortMoves(moves) {
  return [...moves].sort((a, b) => {
    const aScore = (a.captured ? PIECE_VALUES[a.captured[1]] : 0) + (a.promotion ? 800 : 0);
    const bScore = (b.captured ? PIECE_VALUES[b.captured[1]] : 0) + (b.promotion ? 800 : 0);
    return bScore - aScore;
  });
}

function minimax(gameState, depth, alpha, beta, maximizing) {
  if (depth === 0) {
    return { score: evaluateState(gameState), move: null };
  }

  const moves = sortMoves(allLegalMoves(gameState, gameState.turn));
  if (moves.length === 0) {
    return { score: evaluateState(gameState), move: null };
  }

  let bestMove = null;

  if (maximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      const nextState = applyMove(gameState, move);
      const result = minimax(nextState, depth - 1, alpha, beta, false);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) {
        break;
      }
    }
    return { score: bestScore, move: bestMove };
  }

  let bestScore = Infinity;
  for (const move of moves) {
    const nextState = applyMove(gameState, move);
    const result = minimax(nextState, depth - 1, alpha, beta, true);
    if (result.score < bestScore) {
      bestScore = result.score;
      bestMove = move;
    }
    beta = Math.min(beta, result.score);
    if (beta <= alpha) {
      break;
    }
  }
  return { score: bestScore, move: bestMove };
}

function updateGameStatus() {
  const moves = allLegalMoves(state, state.turn);
  const checked = inCheck(state.board, state.turn);
  state.check = checked;

  if (moves.length === 0) {
    if (checked) {
      state.winner = state.turn === "w" ? "Robot" : "Tú";
      state.message =
        state.turn === "w" ? "Jaque mate. El robot te ganó." : "Jaque mate. Le ganaste al robot.";
      statusLabel.textContent = "Jaque mate";
    } else {
      state.winner = "Tablas";
      state.message = "Tablas por ahogado. Qué pelea.";
      statusLabel.textContent = "Tablas";
    }
    return;
  }

  if (state.halfmoveClock >= 100) {
    state.winner = "Tablas";
    state.message = "Tablas por regla de 50 movimientos.";
    statusLabel.textContent = "Tablas";
    return;
  }

  statusLabel.textContent = checked
    ? state.turn === "w"
      ? "Estás en jaque"
      : "Robot en jaque"
    : state.thinking
      ? "Robot pensando"
      : state.turn === "w"
        ? "Tu turno"
        : "Turno del robot";
}

function renderCaptured() {
  capturedBlackNode.innerHTML = state.capturedByWhite
    .map(
      (piece) =>
        `<span class="piece-chip ${piece[0] === "w" ? "white-piece" : "black-piece"}">${PIECES[piece]}</span>`
    )
    .join("");
  capturedWhiteNode.innerHTML = state.capturedByBlack
    .map(
      (piece) =>
        `<span class="piece-chip ${piece[0] === "w" ? "white-piece" : "black-piece"}">${PIECES[piece]}</span>`
    )
    .join("");
}

function renderBoard() {
  updateGameStatus();
  boardNode.innerHTML = "";
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      square.dataset.row = String(row);
      square.dataset.col = String(col);
      square.setAttribute("aria-label", `Casilla ${coordToName(row, col)}`);

      if (state.selected && state.selected.row === row && state.selected.col === col) {
        square.classList.add("selected");
      }

      if (
        state.lastMove &&
        ((state.lastMove.fromRow === row && state.lastMove.fromCol === col) ||
          (state.lastMove.toRow === row && state.lastMove.toCol === col))
      ) {
        square.classList.add("last-move");
      }

      const legalMove = state.legalMoves.find((move) => move.toRow === row && move.toCol === col);
      if (legalMove) {
        square.classList.add(legalMove.captured ? "capture" : "legal");
      }

      const piece = state.board[row][col];
      if (piece) {
        const pieceNode = document.createElement("span");
        pieceNode.className = `piece ${piece[0] === "w" ? "white-piece" : "black-piece"}`;
        pieceNode.textContent = PIECES[piece];
        square.appendChild(pieceNode);
      }

      boardNode.appendChild(square);
    }
  }

  turnLabel.textContent = state.turn === "w" ? "Blancas" : "Negras";
  difficultyLabel.textContent = Number(difficultySelect.value) === 4 ? "Brutal" : "Agresivo";
  renderCaptured();
}

function selectSquare(row, col) {
  const piece = state.board[row][col];
  if (state.turn !== "w" || state.thinking || state.winner) {
    return;
  }

  if (state.selected) {
    const chosenMove = state.legalMoves.find((move) => move.toRow === row && move.toCol === col);
    if (chosenMove) {
      state = applyMove(state, chosenMove);
      const movedPiece = state.lastMove.promotion ? "peón coronado a dama" : "pieza";
      state.message = `Jugaste ${coordToName(chosenMove.fromRow, chosenMove.fromCol)}-${coordToName(
        chosenMove.toRow,
        chosenMove.toCol
      )} con ${movedPiece}.`;
      renderBoard();
      maybeRobotTurn();
      return;
    }
  }

  if (piece && piece[0] === "w") {
    state.selected = { row, col };
    state.legalMoves = legalMovesForSquare(state, row, col);
    state.message = `${PIECES[piece]} en ${coordToName(row, col)} lista para moverse.`;
  } else {
    state.selected = null;
    state.legalMoves = [];
  }

  renderBoard();
}

function maybeRobotTurn() {
  updateGameStatus();
  if (state.turn !== "b" || state.winner) {
    renderBoard();
    return;
  }

  state.thinking = true;
  state.selected = null;
  state.legalMoves = [];
  state.message = "El robot está calculando una maldad...";
  renderBoard();

  window.setTimeout(() => {
    const result = minimax(state, state.aiDepth, -Infinity, Infinity, true);
    state.thinking = false;

    if (!result.move) {
      updateGameStatus();
      renderBoard();
      return;
    }

    state = applyMove(state, result.move);
    state.message = `Robot jugó ${coordToName(result.move.fromRow, result.move.fromCol)}-${coordToName(
      result.move.toRow,
      result.move.toCol
    )}.`;
    renderBoard();
  }, 40);
}

function resetGame() {
  state = createState();
  state.aiDepth = Number(difficultySelect.value);
  renderBoard();
}

boardNode.addEventListener("click", (event) => {
  const square = event.target.closest(".square");
  if (!square) {
    return;
  }

  selectSquare(Number(square.dataset.row), Number(square.dataset.col));
});

difficultySelect.addEventListener("change", () => {
  state.aiDepth = Number(difficultySelect.value);
  difficultyLabel.textContent = state.aiDepth === 4 ? "Brutal" : "Agresivo";
  state.message = "Dificultad actualizada para la próxima jugada.";
  renderBoard();
});

resetButton.addEventListener("click", resetGame);

renderBoard();
