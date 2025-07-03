import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ApiResponse } from '@shared/types';

const router = express.Router();

// @desc    Get user's characters
// @route   GET /api/character
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: { message: 'Character routes - Coming soon!' },
  });
});

// @desc    Create new character
// @route   POST /api/character
// @access  Private
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: { message: 'Create character - Coming soon!' },
  });
});

export { router as characterRoutes };
