import { Router } from 'express';
import { createManagedVillaType, listManagedVillaTypes, listPublicVillaTypes, removeManagedVillaType, updateManagedVillaType, uploadVillaTypeMedia } from '../controllers/villaTypeController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { singleMediaUpload } from '../utils/mediaUpload.js';

const router = Router();
router.get('/public', asyncHandler(listPublicVillaTypes));
router.use(asyncHandler(requireAuth), requireRole('admin'));
router.get('/', asyncHandler(listManagedVillaTypes));
router.post('/', asyncHandler(createManagedVillaType));
router.put('/:villaTypeId', asyncHandler(updateManagedVillaType));
router.post('/:villaTypeId/media', singleMediaUpload, asyncHandler(uploadVillaTypeMedia));
router.delete('/:villaTypeId', asyncHandler(removeManagedVillaType));

export default router;
