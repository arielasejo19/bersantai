import { addReservationCharge, collectReservationPayment, getReservationStatement, removeReservationCharge } from '../repositories/billingRepository.js';
import { reservationChargeSchema, reservationPaymentSchema } from '../validators/billingValidators.js';
import { validateBody } from '../validators/validate.js';
export async function showReservationStatement(request, response) { response.json({ statement: await getReservationStatement(request.params.reservationId, request.user) }); }
export async function addChargeToReservation(request, response) { response.status(201).json({ statement: await addReservationCharge(request.params.reservationId, validateBody(reservationChargeSchema, request.body), request.user) }); }
export async function removeChargeFromReservation(request, response) { response.json({ statement: await removeReservationCharge(request.params.reservationId, request.params.chargeId, request.user) }); }
export async function collectReservationPaymentHandler(request, response) { response.status(201).json({ statement: await collectReservationPayment(request.params.reservationId, validateBody(reservationPaymentSchema, request.body), request.user) }); }