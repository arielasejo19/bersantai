import { Router } from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import profileRoutes from './profileRoutes.js';
import villaRoutes from './villaRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/villas', villaRoutes);

export default router;
