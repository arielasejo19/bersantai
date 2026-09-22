import { Router } from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import profileRoutes from './profileRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import villaTypeRoutes from './villaTypeRoutes.js';
import villaRoutes from './villaRoutes.js';
import bookingVerificationRoutes from './bookingVerificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/services', serviceRoutes);
router.use('/villa-types', villaTypeRoutes);
router.use('/villas', villaRoutes);
router.use('/booking-verification', bookingVerificationRoutes);

export default router;
