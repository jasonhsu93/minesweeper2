const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = 5000;

// Middleware to handle CORS and allow credentials
app.use(cors({
  origin: '*', // Allow any origin for testing APIs
  origin: 'http://localhost:3000',//comment this out when testing for API calls
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());

let board;
let startTime;
let isFirstClick = true;

function createEmptyBoard(width, height) {
  return Array.from({ length: height }, () => 
    Array.from({ length: width }, () => ({
      mine: false, revealed: false, flagged: false, adjacent_mines: 0
    }))
  );
}

function generateSafeZone(x, y) {
  const safeZone = new Set();
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      safeZone.add(`${x + dx},${y + dy}`);
    }
  }
  return safeZone;
}

function placeMines(board, width, height, mines, firstClickX, firstClickY) {
  let placed = 0;
  const safeZone = generateSafeZone(firstClickX, firstClickY);

  while (placed < mines) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!board[y][x].mine && !safeZone.has(`${x},${y}`)) {
      board[y][x].mine = true;
      placed++;
    }
  }
}

function calculateAdjacency(board, width, height) {
  const directions = [-1, 0, 1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!board[y][x].mine) {
        let count = 0;
        for (const dy of directions) {
          for (const dx of directions) {
            if (dy === 0 && dx === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && board[ny][nx].mine) {
              count += 1;
            }
          }
        }
        board[y][x].adjacent_mines = count;
      }
    }
  }
}

function revealAllMines(board) {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x].mine) {
        board[y][x].revealed = true;
      }
    }
  }
}

function revealCell(board, x, y) {
  if (isFirstClick) {
    placeMines(board, board[0].length, board.length, 10, x, y);
    calculateAdjacency(board, board[0].length, board.length);
    isFirstClick = false;
  }

  if (board[y][x].mine) {
    revealAllMines(board);
    return "Game Over";
  }
  revealRecursive(board, x, y);
  if (checkWin(board)) {
    revealAllMines(board); 
    return "Won";
  }
  return "Continue";
}

function revealRecursive(board, x, y) {
  if (board[y][x].revealed || board[y][x].flagged) return;
  board[y][x].revealed = true;
  if (board[y][x].adjacent_mines === 0) {
    const directions = [-1, 0, 1];
    for (const dy of directions) {
      for (const dx of directions) {
        if (dy === 0 && dx === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < board.length && nx >= 0 && nx < board[0].length) {
          revealRecursive(board, nx, ny);
        }
      }
    }
  }
}

// Function to check if the game is won
function checkWin(board) {
  return board.every(row => row.every(cell => cell.revealed || cell.mine));
}

app.post('/start', (req, res) => {
  const { width, height, mines } = req.body;
  board = createEmptyBoard(width, height);
  startTime = Date.now();
  isFirstClick = true;
  res.cookie('board', JSON.stringify(board), { httpOnly: true });
  res.cookie('startTime', startTime, { httpOnly: true });
  res.json({ board });
});

app.post('/reveal', (req, res) => {
  const { x, y } = req.body;
  console.log("Request data:", req.body);
  if (!board) return res.status(400).json({ error: "Board not found" });

  const result = revealCell(board, x, y);
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  res.cookie('board', JSON.stringify(board), { httpOnly: true });
  res.json({ board, result, timeElapsed });
});

app.post('/flag', (req, res) => {
  const { x, y } = req.body;
  if (!board) return res.status(400).json({ error: "Board not found" });
  board[y][x].flagged = !board[y][x].flagged;
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  res.cookie('board', JSON.stringify(board), { httpOnly: true });
  res.json({ board, timeElapsed });
});

app.listen(port, () => {
  console.log(`Minesweeper backend running at http://localhost:${port}`);
});
