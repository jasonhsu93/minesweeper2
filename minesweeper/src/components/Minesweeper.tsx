import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig";

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent_mines: number;
}

const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameStatus === "Game Over" || gameStatus === "Won") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [gameStatus]);

  const startNewGame = async () => {
    try {
      const response = await axios.post("/start", {
        width: 10,
        height: 10,
        mines: 10,
      });
      setBoard(response.data.board);
      setGameStatus("Game started");
      setTimer(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleCellClick = async (x: number, y: number) => {
    if (gameStatus === "Game Over" || gameStatus === "Won") return;  // Prevent clicks after game over or won
    const data = { x, y };

    // Retrieve the cell from the board
    const cell = board[y][x];

    // Prevent action if the cell is flagged
    if (cell.flagged) return;
    
    try {
      const response = await axios.post("/reveal", data);
      setBoard(response.data.board);
      setGameStatus(response.data.result);
      setTimer(response.data.timeElapsed);
    } catch (error) {
      console.error("Error revealing cell:", error);
    }
  };

  const handleCellRightClick = async (
    event: React.MouseEvent,
    x: number,
    y: number
  ) => {
    event.preventDefault();
    if (gameStatus === "Game Over" || gameStatus === "Won") return;  // Prevent clicks after game over or won
    try {
      const response = await axios.post("/flag", { x, y });
      setBoard(response.data.board);
    } catch (error) {
      console.error("Error flagging cell:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div>
      <h1>Minesweeper</h1>
      <button onClick={startNewGame}>Restart Game</button>
      <p>{gameStatus}</p>
      <p>Time: {formatTime(timer)}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${board[0]?.length || 0}, 30px)` }}>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              onContextMenu={(e) => handleCellRightClick(e, x, y)}
              style={{
                width: 30,
                height: 30,
                border: "1px solid black",
                backgroundColor: cell.revealed ? "#ddd" : "#bbb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {cell.revealed && cell.mine && "💣"}
              {cell.revealed && !cell.mine && cell.adjacent_mines > 0 && cell.adjacent_mines}
              {!cell.revealed && cell.flagged && "🚩"}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Minesweeper;
