import { Router, Request, Response } from 'express';
import { ScoreService } from '../services/ScoreService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const scoreService = new ScoreService();

// Submit a new score (public endpoint with optional authentication)
router.post('/', async (req: Request, res: Response) => {
  try {
    let userId: number | null = null;
    let username: string = 'Guest';

    // If authenticated, use the user's ID
    if (req.headers.authorization) {
      try {
        const authResult = await authenticateToken(req, res, () => {});
        if (req.user) {
          userId = req.user.id;
        }
      } catch (error) {
        // If auth fails, continue as guest
        console.log('Auth failed, continuing as guest');
      }
    }

    const { score, gameTime, collectibles, distance, guestId } = req.body;

    // For guest users, use the provided guestId as username
    if (!userId && guestId) {
      username = `Guest_${guestId}`;
    }

    const result = await scoreService.submitScore(userId, {
      score,
      gameTime,
      collectibles,
      distance,
      guestUsername: username
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit score',
      },
    });
  }
});

// Get global leaderboard (public endpoint)
router.get('/leaderboard', async (req, res) => {
  try {
    console.log('Received leaderboard request with query:', req.query);
    
    const timeframe = (req.query.timeframe as 'all' | 'daily' | 'weekly' | 'monthly') || 'all';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    console.log('Processed parameters:', { timeframe, limit, offset });

    const result = await scoreService.getGlobalLeaderboard({
      timeframe,
      limit,
      offset,
    });

    console.log('Successfully fetched leaderboard:', {
      totalEntries: result.total,
      entriesReturned: result.leaderboard.length,
    });

    res.json(result);
  } catch (error) {
    console.error('Error in leaderboard route:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});

// Get player stats (requires authentication)
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;
    const stats = await scoreService.getPlayerStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch player stats',
      },
    });
  }
});

export default router; 