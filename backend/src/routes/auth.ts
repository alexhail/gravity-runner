import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const router = Router();
const authService = new AuthService();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        }
      });
    }

    const result = await authService.register(username, password);
    
    res.status(201).json({
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', {
      error,
      body: req.body,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error) {
      // Always show validation and username-related errors
      if (error.message.includes('already taken') ||
          error.message.includes('Validation failed') || 
          error.message.includes('must be between') ||
          error.message.includes('must contain only') ||
          error.message.includes('inappropriate words') ||
          error.message.includes('cannot contain') ||  // Added for repeated characters error
          error.message.includes('Username')) {        // Added to catch any username-related errors
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        });
      }
      
      // For other errors, still protect sensitive details in production
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: error.message // Always show the error message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        }
      });
    }

    const result = await authService.login(username, password);
    
    res.json({
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        lastLoginAt: result.user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Login error:', {
      error,
      username: req.body.username,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error) {
      // Always show validation and auth-related errors
      if (error.message === 'User not found' || 
          error.message === 'Invalid password' ||
          error.message.includes('Validation') ||
          error.message.includes('Username')) {
        return res.status(401).json({
          error: {
            code: 'AUTH_ERROR',
            message: error.message
          }
        });
      }

      // For other errors, still show the message
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: error.message
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

export default router; 