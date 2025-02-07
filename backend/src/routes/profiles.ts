import { Router, Request, Response } from 'express';
import { ProfileService } from '../services/ProfileService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const profileService = new ProfileService();

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
  };
}

// Get user profile
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const profile = await profileService.getProfile(userId);
    res.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === 'Profile not found') {
      // Create new profile if it doesn't exist
      try {
        const profile = await profileService.createProfile(
          (req as AuthenticatedRequest).user.id,
          (req as AuthenticatedRequest).user.username
        );
        res.json(profile);
      } catch (createError) {
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to create profile',
          },
        });
      }
    } else {
      res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch profile',
        },
      });
    }
  }
});

// Update profile
router.patch('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { avatar, preferences } = req.body;
    const profile = await profileService.updateProfile(userId, { avatar, preferences });
    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
});

// Update preferences
router.patch('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { musicVolume, sfxVolume, theme } = req.body;
    const profile = await profileService.updatePreferences(userId, {
      musicVolume,
      sfxVolume,
      theme,
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update preferences',
      },
    });
  }
});

// Update game stats
router.post('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { playTime, score, distance, collectibles } = req.body;
    const profile = await profileService.updateStats(userId, {
      playTime,
      score,
      distance,
      collectibles,
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update stats',
      },
    });
  }
});

// Add achievement
router.post('/achievements/:achievementId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { achievementId } = req.params;
    const profile = await profileService.addAchievement(userId, achievementId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add achievement',
      },
    });
  }
});

export default router; 