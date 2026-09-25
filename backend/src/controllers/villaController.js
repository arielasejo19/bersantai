import { addVillaAmenity, addVillaPhoto, archiveManagedVilla, assignReservation, assignVillaReceptionist, bookVilla, changeReservationStatus, completeCheckIn, completeCheckOut, confirmBooking, createManagedVilla, editVilla, getAccounts, getAssignableReservationVillas, getCalendarVillas, getPublicAvailability, getPublicAvailabilityCalendar, getPublicVilla, getPublicVillas, getReservation, getReservationNotifications, getReservations, getRevenueSummary, getVilla, getVillaReservations, getVillas, inviteStaff, resendReservationEmail, setVillaMapPosition, uploadVillaMedia } from '../services/villaService.js';
import { amenitySchema, bookingSchema, photoSchema, reservationAssignmentSchema, reservationRemarksSchema, reservationStatusSchema, staffInviteSchema, villaSchema } from '../validators/villaValidators.js';
import { validateBody } from '../validators/validate.js';
import { z } from 'zod';
import { getPricingEstimate } from '../services/villaService.js';

export async function listVillas(request, response) { response.json({ villas: await getVillas(request.user) }); }
export async function listCalendarVillas(request, response) { response.json({ villas: await getCalendarVillas(request.user) }); }
export async function listPublicVillas(_request, response) { response.json({ villas: await getPublicVillas() }); }
export async function showPublicVilla(request, response) { response.json({ villa: await getPublicVilla(request.params.villaId) }); }
export async function checkAvailability(request, response) { response.json(await getPublicAvailability({ villaId: request.query.villaId, villaTypeId: request.query.villaTypeId, bookingKind: request.query.bookingKind, checkIn: request.query.checkIn, checkOut: request.query.checkOut })); }
export async function availabilityCalendar(request, response) { response.json(await getPublicAvailabilityCalendar({ villaId: request.query.villaId, villaTypeId: request.query.villaTypeId, bookingKind: request.query.bookingKind, startDate: request.query.startDate, endDate: request.query.endDate })); }
export async function estimatePricing(request, response) { response.json(await getPricingEstimate({ villaId: request.query.villaId, villaTypeId: request.query.villaTypeId, bookingKind: request.query.bookingKind, checkIn: request.query.checkIn, checkOut: request.query.checkOut })); }
export async function createBooking(request, response) { response.status(201).json({ reservation: await bookVilla(validateBody(bookingSchema, request.body), request.user) }); }
export async function showVilla(request, response) { response.json({ villa: await getVilla(request.params.villaId, request.user) }); }
export async function createVilla(request, response) { response.status(201).json({ villa: await createManagedVilla(validateBody(villaSchema, request.body)) }); }
export async function updateVilla(request, response) { response.json({ villa: await editVilla(request.params.villaId, validateBody(villaSchema, request.body), request.user) }); }
export async function archiveVilla(request, response) { await archiveManagedVilla(request.params.villaId, request.user); response.status(204).send(); }
export async function updateVillaMap(request, response) { await setVillaMapPosition(request.params.villaId, validateBody(z.object({ mapX: z.coerce.number().min(0).max(100), mapY: z.coerce.number().min(0).max(100) }), request.body), request.user); response.status(204).send(); }
export async function createAmenity(request, response) { response.status(201).json({ villa: await addVillaAmenity(request.params.villaId, validateBody(amenitySchema, request.body).name, request.user) }); }
export async function createPhoto(request, response) { response.status(201).json({ villa: await addVillaPhoto(request.params.villaId, validateBody(photoSchema, request.body), request.user) }); }
export async function uploadMedia(request, response) { response.status(201).json({ villa: await uploadVillaMedia(request.params.villaId, request.files || [], request.user) }); }
export async function assignReceptionist(request, response) { await assignVillaReceptionist(request.params.villaId, request.body.userId, request.user); response.status(204).send(); }
export async function listReservations(request, response) { response.json({ reservations: await getVillaReservations(request.params.villaId, request.user) }); }
export async function listAllReservations(request, response) { response.json({ reservations: await getReservations(request.user) }); }
export async function listRevenueSummary(request, response) { response.json({ summary: await getRevenueSummary(request.user) }); }
export async function listReservationNotifications(request, response) { response.json(await getReservationNotifications(request.user, request.query.afterId)); }
export async function updateReservationStatus(request, response) { await changeReservationStatus(request.params.reservationId, validateBody(reservationStatusSchema, request.body).status, request.user); response.status(204).send(); }
export async function showReservation(request, response) { response.json({ reservation: await getReservation(request.params.reservationId, request.user) }); }
export async function listAssignableReservationVillas(request, response) { response.json({ villas: await getAssignableReservationVillas(request.params.reservationId, request.user) }); }
export async function confirmReservationBooking(request, response) { response.json(await confirmBooking(request.params.reservationId, request.user)); }
export async function checkInReservation(request, response) { response.json(await completeCheckIn(request.params.reservationId, validateBody(reservationRemarksSchema, request.body || {}).remarks, request.user)); }
export async function checkOutReservation(request, response) { response.json(await completeCheckOut(request.params.reservationId, validateBody(reservationRemarksSchema, request.body || {}).remarks, request.user)); }
export async function assignReservationVilla(request, response) { response.json({ reservation: await assignReservation(request.params.reservationId, validateBody(reservationAssignmentSchema, request.body).villaId, request.user) }); }
export async function resendReservationNotification(request, response) { response.json(await resendReservationEmail(request.params.reservationId, request.params.emailType, request.user)); }
export async function inviteStaffMember(request, response) { response.status(201).json(await inviteStaff(validateBody(staffInviteSchema, request.body))); }
export async function listAccounts(request, response) { response.json({ accounts: await getAccounts(request.query.role) }); }
