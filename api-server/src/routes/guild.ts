import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ApiResponse } from '@shared/types';

const router = express.Router();

// @desc    Get user's guilds
// @route   GET /api/guild
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: { message: 'Guild routes - Coming soon!' },
  });
});

export { router as guildRoutes };
