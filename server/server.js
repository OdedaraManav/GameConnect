import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { PrismaClient } from './generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticateToken } from './middleware/auth.js';

// Load environment variables from .env file
dotenv.config();

// Prisma PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow cross-origin requests from React frontend
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GameConnect API is running',
  });
});

// 2. Auth API Routes

// POST /api/auth/register — User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username, email, and password are all required fields.'
      });
    }

    // 2. Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists.'
      });
    }

    // 3. Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is already taken. Please choose another username.'
      });
    }

    // 4. Hash password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Store user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }
    });

    // 6. Return success response (never return password or hash)
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        location: newUser.location,
        platform: newUser.platform,
        playstyle: newUser.playstyle,
        availability: newUser.availability,
        availabilityStart: newUser.availabilityStart,
        availabilityEnd: newUser.availabilityEnd,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user due to a server error.'
    });
  }
});

// POST /api/auth/login — User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.'
      });
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // 3. Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 5. Return success response with JWT and safe user object
    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        platform: user.platform,
        playstyle: user.playstyle,
        availability: user.availability,
        availabilityStart: user.availabilityStart,
        availabilityEnd: user.availabilityEnd,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log in due to a server error.'
    });
  }
});

// GET /api/auth/me — Protected route to fetch current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        favoriteGames: { include: { game: true } },
        playingGames: { include: { game: true } }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.'
      });
    }

    res.json({
      status: 'success',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        platform: user.platform,
        playstyle: user.playstyle,
        availability: user.availability,
        availabilityStart: user.availabilityStart,
        availabilityEnd: user.availabilityEnd,
        status: user.status,
        favoriteGames: user.favoriteGames ? user.favoriteGames.map(fg => fg.game) : [],
        playingGames: user.playingGames ? user.playingGames.map(pg => pg.game) : [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile.'
    });
  }
});

// PUT /api/auth/profile — Protected route to update basic profile fields
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { avatar, bio, location, platform, playstyle, availability, availabilityStart, availabilityEnd, status } = req.body;

    const updateData = {};
    if (avatar !== undefined) updateData.avatar = String(avatar).trim();
    if (bio !== undefined) updateData.bio = String(bio).trim().slice(0, 500);
    if (location !== undefined) updateData.location = String(location).trim().slice(0, 100);
    if (platform !== undefined) updateData.platform = String(platform).trim().slice(0, 50);
    if (playstyle !== undefined) updateData.playstyle = String(playstyle).trim().slice(0, 50);
    if (availability !== undefined) updateData.availability = String(availability).trim().slice(0, 100);
    if (availabilityStart !== undefined) updateData.availabilityStart = String(availabilityStart).trim().slice(0, 20);
    if (availabilityEnd !== undefined) updateData.availabilityEnd = String(availabilityEnd).trim().slice(0, 20);
    if (status !== undefined) updateData.status = String(status).trim().slice(0, 50);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: {
        favoriteGames: { include: { game: true } },
        playingGames: { include: { game: true } }
      }
    });

    res.json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        platform: updatedUser.platform,
        playstyle: updatedUser.playstyle,
        availability: updatedUser.availability,
        availabilityStart: updatedUser.availabilityStart,
        availabilityEnd: updatedUser.availabilityEnd,
        status: updatedUser.status,
        favoriteGames: updatedUser.favoriteGames ? updatedUser.favoriteGames.map(fg => fg.game) : [],
        playingGames: updatedUser.playingGames ? updatedUser.playingGames.map(pg => pg.game) : [],
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user profile.'
    });
  }
});

// 2.5 User Game Relationships Routes

// POST /api/user/favorites — Add game to authenticated user's favorites
app.post('/api/user/favorites', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    const parsedGameId = parseInt(gameId, 10);

    if (Number.isNaN(parsedGameId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid game ID.' });
    }

    const game = await prisma.game.findUnique({ where: { id: parsedGameId } });
    if (!game) {
      return res.status(404).json({ status: 'error', message: `Game with ID ${gameId} not found.` });
    }

    await prisma.userFavoriteGame.upsert({
      where: {
        userId_gameId: { userId: req.user.id, gameId: parsedGameId }
      },
      create: { userId: req.user.id, gameId: parsedGameId },
      update: {}
    });

    const userWithFavs = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { favoriteGames: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game added to favorites.',
      favoriteGames: userWithFavs.favoriteGames.map(fg => fg.game)
    });
  } catch (error) {
    console.error('Error adding favorite game:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add favorite game.' });
  }
});

// DELETE /api/user/favorites/:gameId — Remove game from authenticated user's favorites
app.delete('/api/user/favorites/:gameId', authenticateToken, async (req, res) => {
  try {
    const parsedGameId = parseInt(req.params.gameId, 10);
    if (Number.isNaN(parsedGameId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid game ID.' });
    }

    await prisma.userFavoriteGame.deleteMany({
      where: {
        userId: req.user.id,
        gameId: parsedGameId
      }
    });

    const userWithFavs = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { favoriteGames: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game removed from favorites.',
      favoriteGames: userWithFavs.favoriteGames.map(fg => fg.game)
    });
  } catch (error) {
    console.error('Error removing favorite game:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove favorite game.' });
  }
});

// POST /api/user/playing — Add game to authenticated user's currently playing list
app.post('/api/user/playing', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.body;
    const parsedGameId = parseInt(gameId, 10);

    if (Number.isNaN(parsedGameId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid game ID.' });
    }

    const game = await prisma.game.findUnique({ where: { id: parsedGameId } });
    if (!game) {
      return res.status(404).json({ status: 'error', message: `Game with ID ${gameId} not found.` });
    }

    await prisma.userPlayingGame.upsert({
      where: {
        userId_gameId: { userId: req.user.id, gameId: parsedGameId }
      },
      create: { userId: req.user.id, gameId: parsedGameId },
      update: {}
    });

    const userWithPlaying = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { playingGames: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game added to currently playing list.',
      playingGames: userWithPlaying.playingGames.map(pg => pg.game)
    });
  } catch (error) {
    console.error('Error adding playing game:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add playing game.' });
  }
});

// DELETE /api/user/playing/:gameId — Remove game from authenticated user's currently playing list
app.delete('/api/user/playing/:gameId', authenticateToken, async (req, res) => {
  try {
    const parsedGameId = parseInt(req.params.gameId, 10);
    if (Number.isNaN(parsedGameId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid game ID.' });
    }

    await prisma.userPlayingGame.deleteMany({
      where: {
        userId: req.user.id,
        gameId: parsedGameId
      }
    });

    const userWithPlaying = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { playingGames: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game removed from currently playing list.',
      playingGames: userWithPlaying.playingGames.map(pg => pg.game)
    });
  } catch (error) {
    console.error('Error removing playing game:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove playing game.' });
  }
});

// 3. Games API Routes

// GET /api/games — Return all games
app.get('/api/games', async (req, res) => {
  try {
    const games = await prisma.game.findMany();
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch games.',
    });
  }
});

// GET /api/games/:id — Return single game by ID or 404
app.get('/api/games/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id, 10);

    if (Number.isNaN(gameId)) {
      return res.status(404).json({
        status: 'error',
        message: `Game with ID ${req.params.id} not found.`,
      });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({
        status: 'error',
        message: `Game with ID ${req.params.id} not found.`,
      });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch game.',
    });
  }
});

// 4. Players API Routes

// GET /api/players — Return all squad players
app.get('/api/players', async (req, res) => {
  try {
    const players = await prisma.player.findMany();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch players.',
    });
  }
});

// GET /api/players/:id — Return single player by ID or 404
app.get('/api/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id, 10);

    if (Number.isNaN(playerId)) {
      return res.status(404).json({
        status: 'error',
        message: `Player with ID ${req.params.id} not found.`,
      });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: `Player with ID ${req.params.id} not found.`,
      });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch player.',
    });
  }
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🎮 GameConnect Express server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});