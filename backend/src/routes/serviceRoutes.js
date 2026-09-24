import { Router } from 'express';
import { createManagedService, listManagedServices, listPublicServices, removeManagedService, updateManagedService, uploadServiceMedia } from '../controllers/serviceController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { singleMediaUpload } from '../utils/mediaUpload.js';

const router = Router();
router.get('/public', asyncHandler(listPublicServices));
router.use(asyncHandler(requireAuth), requireRole('admin'));
router.get('/', asyncHandler(listManagedServices));
router.post('/', asyncHandler(createManagedService));
router.put('/:serviceId', asyncHandler(updateManagedService));
router.post('/:serviceId/media', singleMediaUpload, asyncHandler(uploadServiceMedia));
router.delete('/:serviceId', asyncHandler(removeManagedService));

export default router;
