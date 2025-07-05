import express, { Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ApiResponse } from '@shared/types';

const router = express.Router();

// @desc    Get user's campaigns
// @route   GET /api/campaign
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    data: { message: 'Campaign routes - Coming soon!' },
  });
});

export { router as campaignRoutes };
