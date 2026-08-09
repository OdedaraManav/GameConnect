import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MOCK_GAMES, MOCK_PLAYERS } from './data/mockData.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow cross-origin requests from React frontend
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GameConnect API is running'
  });
});

// 2. Games API Routes
// GET /api/games — Return all games
app.get('/api/games', (req, res) => {
  res.json(MOCK_GAMES);
});

// GET /api/games/:id — Return single game by ID or 404
app.get('/api/games/:id', (req, res) => {
  const gameId = parseInt(req.params.id, 10);
  const game = MOCK_GAMES.find((g) => g.id === gameId);

  if (!game) {
    return res.status(404).json({
      status: 'error',
      message: `Game with ID ${req.params.id} not found.`
    });
  }

  res.json(game);
});

// 3. Players API Routes
// GET /api/players — Return all squad players
app.get('/api/players', (req, res) => {
  res.json(MOCK_PLAYERS);
});

// GET /api/players/:id — Return single player by ID or 404
app.get('/api/players/:id', (req, res) => {
  const playerId = parseInt(req.params.id, 10);
  const player = MOCK_PLAYERS.find((p) => p.id === playerId);

  if (!player) {
    return res.status(404).json({
      status: 'error',
      message: `Player with ID ${req.params.id} not found.`
    });
  }

  res.json(player);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🎮 GameConnect Express server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
