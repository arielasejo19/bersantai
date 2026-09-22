import { addVillaAmenity, addVillaPhoto, assignReservation, assignVillaReceptionist, bookVilla, changeReservationStatus, createManagedVilla, editVilla, getAccounts, getPublicAvailability, getPublicVillas, getReservations, getVilla, getVillaReservations, getVillas, inviteStaff } from '../services/villaService.js';
import { amenitySchema, bookingSchema, photoSchema, reservationStatusSchema, staffInviteSchema, villaSchema } from '../validators/villaValidators.js';
import { validateBody } from '../validators/validate.js';

export async function listVillas(request, response) { response.json({ villas: await getVillas(request.user) }); }
export async function listPublicVillas(_request, response) { response.json({ villas: await getPublicVillas() }); }
export async function checkAvailability(request, response) { response.json(await getPublicAvailability({ villaId: request.query.villaId, villaTypeId: request.query.villaTypeId, bookingKind: request.query.bookingKind, checkIn: request.query.checkIn, checkOut: request.query.checkOut })); }
export async function createBooking(request, response) { response.status(201).json({ reservation: await bookVilla(validateBody(bookingSchema, request.body), request.user) }); }
export async function showVilla(request, response) { response.json({ villa: await getVilla(request.params.villaId, request.user) }); }
export async function createVilla(request, response) { response.status(201).json({ villa: await createManagedVilla(validateBody(villaSchema, request.body)) }); }
export async function updateVilla(request, response) { response.json({ villa: await editVilla(request.params.villaId, validateBody(villaSchema, request.body), request.user) }); }
export async function createAmenity(request, response) { response.status(201).json({ villa: await addVillaAmenity(request.params.villaId, validateBody(amenitySchema, request.body).name, request.user) }); }
export async function createPhoto(request, response) { response.status(201).json({ villa: await addVillaPhoto(request.params.villaId, validateBody(photoSchema, request.body), request.user) }); }
export async function assignReceptionist(request, response) { await assignVillaReceptionist(request.params.villaId, request.body.userId, request.user); response.status(204).send(); }
export async function listReservations(request, response) { response.json({ reservations: await getVillaReservations(request.params.villaId, request.user) }); }
export async function listAllReservations(request, response) { response.json({ reservations: await getReservations(request.user) }); }
export async function updateReservationStatus(request, response) { await changeReservationStatus(request.params.reservationId, validateBody(reservationStatusSchema, request.body).status, request.user); response.status(204).send(); }
export async function assignReservationVilla(request, response) { await assignReservation(request.params.reservationId, request.body.villaId, request.user); response.status(204).send(); }
export async function inviteStaffMember(request, response) { response.status(201).json(await inviteStaff(validateBody(staffInviteSchema, request.body))); }
export async function listAccounts(request, response) { response.json({ accounts: await getAccounts(request.query.role) }); }