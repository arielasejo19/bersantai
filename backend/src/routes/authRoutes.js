import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { social } from '../controllers/socialAuthController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', asyncHandler(requireAuth), asyncHandler(me));
router.post('/logout', asyncHandler(logout));
router.post('/social', asyncHandler(social));

export default router;
