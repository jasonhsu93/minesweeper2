# Minesweeper
This project implements a Minesweeper game using React for the frontend and Node.js for the backend. The game follows the classic Minesweeper rules and includes features like safe first click, flagging cells, and a timer to track the game duration.

# Installation Prerequisites
Clone the repo\
Node.js (v14 or higher)\
npm (v6 or higher)

# Backend Setup
1. cd minesweeper2/minesweeper-backend
2. Install the backend dependencies: npm install
3. Start the backend server: node index.js

# Frontend Setup 
1. cd minesweeper2/minesweeper
2. Install the frontend dependencies: npm install
3. Start the frontend: npm start

# Flow
Open your browser and navigate to http://localhost:3000.
Click "Restart Game" to restart a game.
Left-click on squares to reveal them.
Right-click on squares to flag them.
The game ends when all non-mine squares are revealed or a mine is clicked.

# Optional 
To test API calls, open the index.html file in a browser and interact with the file. One may need to go to minesweeper2/minesweeper-backend/index.js to modify the Middleware so that API calls are accepted. like this:\
\
// Middleware to handle CORS and allow credentials\
app.use(cors({\
  origin: '*', // Allow any origin for testing APIs\
  //origin: 'http://localhost:3000', //comment this out when testing for API calls\
  credentials: true,\
  allowedHeaders: ['Content-Type', 'Authorization']\
}));\
\
Make sure to restart the backend server.
