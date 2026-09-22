import { Router } from 'express';
import { assignReceptionist, assignReservationVilla, checkAvailability, createAmenity, createBooking, createPhoto, createVilla, inviteStaffMember, listAccounts, listAllReservations, listPublicVillas, listReservations, listVillas, showVilla, updateReservationStatus, updateVilla } from '../controllers/villaController.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getConfig, updateConfig } from '../controllers/settingsController.js';

const router = Router();
router.get('/public', asyncHandler(listPublicVillas));
router.get('/availability', asyncHandler(checkAvailability));
router.get('/config/public', asyncHandler(getConfig));
router.post('/bookings', optionalAuth, asyncHandler(createBooking));
router.use(asyncHandler(requireAuth));
router.get('/config', asyncHandler(getConfig));
router.patch('/config', requireRole('admin'), asyncHandler(updateConfig));
router.get('/', asyncHandler(listVillas));
router.post('/', requireRole('admin'), asyncHandler(createVilla));
router.post('/staff', requireRole('admin'), asyncHandler(inviteStaffMember));
router.get('/accounts', requireRole('admin'), asyncHandler(listAccounts));
router.get('/reservations', requireRole('admin', 'host', 'receptionist'), asyncHandler(listAllReservations));
router.get('/:villaId', asyncHandler(showVilla));
router.put('/:villaId', requireRole('admin', 'host'), asyncHandler(updateVilla));
router.post('/:villaId/amenities', requireRole('admin', 'host'), asyncHandler(createAmenity));
router.post('/:villaId/photos', requireRole('admin', 'host'), asyncHandler(createPhoto));
router.post('/:villaId/receptionists', requireRole('admin'), asyncHandler(assignReceptionist));
router.get('/:villaId/reservations', requireRole('admin', 'host', 'receptionist'), asyncHandler(listReservations));
router.patch('/reservations/:reservationId/assign', requireRole('admin', 'receptionist'), asyncHandler(assignReservationVilla));
router.patch('/:villaId/reservations/:reservationId/status', requireRole('admin', 'host', 'receptionist'), asyncHandler(updateReservationStatus));

export default router;