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
        favoriteGames: [],
        playingGames: [],
        gameProfiles: [],
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

    // 2. Find user by email (include favoriteGames, playingGames, and gameProfiles)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        favoriteGames: { include: { game: true } },
        playingGames: { include: { game: true } },
        gameProfiles: { include: { game: true } }
      }
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

    // 5. Return success response with JWT and safe user object including relations
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
        favoriteGames: user.favoriteGames ? user.favoriteGames.map(fg => fg.game) : [],
        playingGames: user.playingGames ? user.playingGames.map(pg => pg.game) : [],
        gameProfiles: user.gameProfiles || [],
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
        playingGames: { include: { game: true } },
        gameProfiles: { include: { game: true } }
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
        gameProfiles: user.gameProfiles || [],
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
        playingGames: { include: { game: true } },
        gameProfiles: { include: { game: true } }
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
        gameProfiles: updatedUser.gameProfiles || [],
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

// 2.6 UserGameProfile Routes

// POST /api/user/game-profiles — Create or update optional game-specific profile for authenticated user
app.post('/api/user/game-profiles', authenticateToken, async (req, res) => {
  try {
    const { gameId, gamerTag, gameAccountId, rank, tier, level, platform, region, stats } = req.body;
    const parsedGameId = parseInt(gameId, 10);

    if (Number.isNaN(parsedGameId)) {
      return res.status(400).json({ status: 'error', message: 'Valid game ID is required.' });
    }

    if (!gamerTag || !String(gamerTag).trim()) {
      return res.status(400).json({ status: 'error', message: 'In-game handle (gamerTag) is required.' });
    }

    const game = await prisma.game.findUnique({ where: { id: parsedGameId } });
    if (!game) {
      return res.status(404).json({ status: 'error', message: `Game with ID ${gameId} not found.` });
    }

    // Force self-reported verification status for user-submitted profiles
    await prisma.userGameProfile.upsert({
      where: {
        userId_gameId: { userId: req.user.id, gameId: parsedGameId }
      },
      create: {
        userId: req.user.id,
        gameId: parsedGameId,
        gamerTag: String(gamerTag).trim(),
        gameAccountId: gameAccountId ? String(gameAccountId).trim() : null,
        rank: rank ? String(rank).trim() : null,
        tier: tier ? String(tier).trim() : null,
        level: level ? parseInt(level, 10) : null,
        platform: platform ? String(platform).trim() : null,
        region: region ? String(region).trim() : null,
        stats: stats && typeof stats === 'object' ? stats : null,
        isAccountConnected: false,
        verificationStatus: 'SELF_REPORTED'
      },
      update: {
        gamerTag: String(gamerTag).trim(),
        gameAccountId: gameAccountId ? String(gameAccountId).trim() : null,
        rank: rank ? String(rank).trim() : null,
        tier: tier ? String(tier).trim() : null,
        level: level ? parseInt(level, 10) : null,
        platform: platform ? String(platform).trim() : null,
        region: region ? String(region).trim() : null,
        stats: stats && typeof stats === 'object' ? stats : null
      }
    });

    const userWithProfiles = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { gameProfiles: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game profile created/updated successfully.',
      gameProfiles: userWithProfiles.gameProfiles
    });
  } catch (error) {
    console.error('Error creating game profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save game profile.' });
  }
});

// DELETE /api/user/game-profiles/:id — Delete game profile belonging to authenticated user
app.delete('/api/user/game-profiles/:id', authenticateToken, async (req, res) => {
  try {
    const profileId = parseInt(req.params.id, 10);
    if (Number.isNaN(profileId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid profile ID.' });
    }

    const existingProfile = await prisma.userGameProfile.findUnique({
      where: { id: profileId }
    });

    if (!existingProfile) {
      return res.status(404).json({ status: 'error', message: 'Game profile not found.' });
    }

    if (existingProfile.userId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized to delete this game profile.' });
    }

    await prisma.userGameProfile.delete({
      where: { id: profileId }
    });

    const userWithProfiles = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { gameProfiles: { include: { game: true } } }
    });

    res.json({
      status: 'success',
      message: 'Game profile deleted successfully.',
      gameProfiles: userWithProfiles.gameProfiles
    });
  } catch (error) {
    console.error('Error deleting game profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete game profile.' });
  }
});

// Canonical helper function for normalized mutual friendships
function getCanonicalPair(id1, id2) {
  return {
    userAId: Math.min(id1, id2),
    userBId: Math.max(id1, id2)
  };
}

// 2.7 Social Foundation Routes

// GET /api/users/search — Search users by username (excluding self, blocked users, & sensitive data)
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    if (!query) {
      return res.json({ status: 'success', users: [], page, total: 0 });
    }

    // Find users blocked by current user or who blocked current user
    const blocks = await prisma.userBlock.findMany({
      where: {
        OR: [
          { blockerId: req.user.id },
          { blockedId: req.user.id }
        ]
      }
    });

    const blockedUserIds = blocks.map(b => b.blockerId === req.user.id ? b.blockedId : b.blockerId);
    const excludedIds = [req.user.id, ...blockedUserIds];

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          username: { contains: query, mode: 'insensitive' },
          id: { notIn: excludedIds }
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          platform: true,
          playstyle: true
        },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: {
          username: { contains: query, mode: 'insensitive' },
          id: { notIn: excludedIds }
        }
      })
    ]);

    res.json({
      status: 'success',
      users,
      page,
      limit,
      total: totalCount
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to search users.' });
  }
});

// POST /api/social/requests — Send friend request (with reciprocal auto-accept check)
app.post('/api/social/requests', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const targetId = parseInt(receiverId, 10);

    if (Number.isNaN(targetId) || targetId === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'Invalid target user for friend request.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ status: 'error', message: 'Target user not found.' });
    }

    // Check if block exists
    const blockCount = await prisma.userBlock.count({
      where: {
        OR: [
          { blockerId: req.user.id, blockedId: targetId },
          { blockerId: targetId, blockedId: req.user.id }
        ]
      }
    });
    if (blockCount > 0) {
      return res.status(400).json({ status: 'error', message: 'Cannot send friend request to this user.' });
    }

    // Check if already friends using canonical pair
    const canonical = getCanonicalPair(req.user.id, targetId);
    const existingFriendship = await prisma.friendship.findUnique({
      where: { userAId_userBId: canonical }
    });
    if (existingFriendship) {
      return res.status(400).json({ status: 'error', message: 'You are already friends with this user.' });
    }

    // Check if reciprocal pending request exists (targetId -> req.user.id)
    const reciprocalRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: targetId, receiverId: req.user.id }
      }
    });

    if (reciprocalRequest && reciprocalRequest.status === 'PENDING') {
      // Reciprocal Auto-Accept in Transaction
      await prisma.$transaction([
        prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { senderId: targetId, receiverId: req.user.id },
              { senderId: req.user.id, receiverId: targetId }
            ]
          }
        }),
        prisma.friendship.create({
          data: canonical
        })
      ]);

      return res.json({
        status: 'success',
        message: 'Reciprocal request detected! You are now friends.',
        isFriend: true
      });
    }

    // Upsert outgoing friend request
    await prisma.friendRequest.upsert({
      where: {
        senderId_receiverId: { senderId: req.user.id, receiverId: targetId }
      },
      create: {
        senderId: req.user.id,
        receiverId: targetId,
        status: 'PENDING'
      },
      update: {
        status: 'PENDING'
      }
    });

    res.json({
      status: 'success',
      message: 'Friend request sent.'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send friend request.' });
  }
});

// GET /api/social/requests/incoming — Fetch received pending friend requests
app.get('/api/social/requests/incoming', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: req.user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            platform: true,
            playstyle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', requests });
  } catch (error) {
    console.error('Error fetching incoming friend requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch incoming requests.' });
  }
});

// GET /api/social/requests/outgoing — Fetch sent pending friend requests
app.get('/api/social/requests/outgoing', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: req.user.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
            platform: true,
            playstyle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'success', requests });
  } catch (error) {
    console.error('Error fetching outgoing friend requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch outgoing requests.' });
  }
});

// POST /api/social/requests/:id/accept — Accept received friend request
app.post('/api/social/requests/:id/accept', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (Number.isNaN(requestId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid request ID.' });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Friend request not found.' });
    }

    // Security check: receiver MUST be req.user.id
    if (request.receiverId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized to accept this request.' });
    }

    const canonical = getCanonicalPair(request.senderId, request.receiverId);

    await prisma.$transaction([
      prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: request.senderId, receiverId: request.receiverId },
            { senderId: request.receiverId, receiverId: request.senderId }
          ]
        }
      }),
      prisma.friendship.upsert({
        where: { userAId_userBId: canonical },
        create: canonical,
        update: {}
      })
    ]);

    res.json({ status: 'success', message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to accept friend request.' });
  }
});

// POST /api/social/requests/:id/reject — Reject received friend request
app.post('/api/social/requests/:id/reject', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (Number.isNaN(requestId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid request ID.' });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Friend request not found.' });
    }

    // Security check: receiver MUST be req.user.id
    if (request.receiverId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized to reject this request.' });
    }

    await prisma.friendRequest.delete({ where: { id: requestId } });

    res.json({ status: 'success', message: 'Friend request rejected.' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to reject friend request.' });
  }
});

// GET /api/social/friends — Fetch authenticated user's friends with presence information
app.get('/api/social/friends', authenticateToken, async (req, res) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: req.user.id },
          { userBId: req.user.id }
        ]
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            location: true,
            platform: true,
            playstyle: true,
            availability: true,
            status: true
          }
        },
        userB: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            location: true,
            platform: true,
            playstyle: true,
            availability: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to friend list and include presence authorization
    const friends = friendships.map(f => {
      const friendObj = f.userAId === req.user.id ? f.userB : f.userA;
      return {
        ...friendObj,
        friendshipId: f.id,
        friendsSince: f.createdAt
      };
    });

    res.json({ status: 'success', friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch friends list.' });
  }
});

// DELETE /api/social/friends/:friendId — Unfriend user
app.delete('/api/social/friends/:friendId', authenticateToken, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId, 10);
    if (Number.isNaN(friendId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid friend ID.' });
    }

    const canonical = getCanonicalPair(req.user.id, friendId);

    await prisma.friendship.deleteMany({
      where: canonical
    });

    res.json({ status: 'success', message: 'User removed from friends list.' });
  } catch (error) {
    console.error('Error unfriending user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove friend.' });
  }
});

// POST /api/social/block — Block user (terminates friendship & requests in both directions)
app.post('/api/social/block', authenticateToken, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const targetId = parseInt(targetUserId, 10);

    if (Number.isNaN(targetId) || targetId === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'Invalid user to block.' });
    }

    const canonical = getCanonicalPair(req.user.id, targetId);

    await prisma.$transaction([
      prisma.userBlock.upsert({
        where: {
          blockerId_blockedId: { blockerId: req.user.id, blockedId: targetId }
        },
        create: { blockerId: req.user.id, blockedId: targetId },
        update: {}
      }),
      prisma.friendship.deleteMany({ where: canonical }),
      prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: targetId },
            { senderId: targetId, receiverId: req.user.id }
          ]
        }
      })
    ]);

    res.json({ status: 'success', message: 'User blocked.' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to block user.' });
  }
});

// DELETE /api/social/block/:targetUserId — Unblock user (returns relationship to Neutral)
app.delete('/api/social/block/:targetUserId', authenticateToken, async (req, res) => {
  try {
    const targetId = parseInt(req.params.targetUserId, 10);
    if (Number.isNaN(targetId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid target user ID.' });
    }

    await prisma.userBlock.deleteMany({
      where: { blockerId: req.user.id, blockedId: targetId }
    });

    res.json({ status: 'success', message: 'User unblocked.' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to unblock user.' });
  }
});

// GET /api/social/blocked — Fetch list of users blocked by authenticated user
app.get('/api/social/blocked', authenticateToken, async (req, res) => {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: req.user.id },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            avatar: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const blockedUsers = blocks.map(b => b.blocked);
    res.json({ status: 'success', blockedUsers });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch blocked list.' });
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