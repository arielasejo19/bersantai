import { Router } from 'express';
import { getGuestBookings, getProfile, updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(requireAuth));
router.get('/', asyncHandler(getProfile));
router.get('/bookings', asyncHandler(getGuestBookings));
router.put('/', asyncHandler(updateProfile));

export default router;
