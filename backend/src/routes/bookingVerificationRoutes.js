import { Router } from 'express';
import { sendVerification, verifyVerification } from '../controllers/bookingVerificationController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/send', asyncHandler(sendVerification));
router.post('/verify', asyncHandler(verifyVerification));
export default router;
