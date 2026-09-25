import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() { const db = getDatabase(); if (!db) throw new ApiError(503, 'Database is not configured'); return db; }
async function reservationForUser(db, reservationId, user, lock = false) {
  const query = db('reservations').leftJoin('villas', 'villas.id', 'reservations.villa_id').where('reservations.id', reservationId).select('reservations.*', 'villas.owner_user_id');
  if (user.role === 'host') query.where('villas.owner_user_id', user.id);
  if (lock) query.forUpdate();
  const reservation = await query.first();
  if (!reservation) throw new ApiError(404, 'Reservation not found');
  return reservation;
}
export function calculateReservationBalance(reservation, charges, payments) {
  const collectedPayments = payments.filter((payment) => !payment.status || payment.status === 'collected');
  const roomTotal = Number(reservation.total_amount || 0);
  const includedChargesTotal = charges.filter((charge) => charge.item_type === 'prebooked_food').reduce((sum, charge) => sum + Number(charge.total_amount || 0), 0);
  const chargesTotal = charges.filter((charge) => charge.item_type !== 'prebooked_food').reduce((sum, charge) => sum + Number(charge.total_amount || 0), 0);
  const total = roomTotal + chargesTotal;
  const paymentsTotal = collectedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const legacyPaidRoomTotal = reservation.payment_status === 'paid' && !collectedPayments.some((payment) => payment.reference === 'Initial booking payment') ? roomTotal : 0;
  const balance = Math.max(0, total - legacyPaidRoomTotal - paymentsTotal);
  return { roomTotal, chargesTotal, includedChargesTotal, total, paymentsTotal, balance };
}
async function statementFor(db, reservationId) {
  const [reservation, charges, payments] = await Promise.all([
    db('reservations').where({ id: reservationId }).first(),
    db('reservation_charges').where({ reservation_id: reservationId }).orderBy('created_at', 'asc'),
    db('reservation_payments').where({ reservation_id: reservationId, status: 'collected' }).orderBy('collected_at', 'asc')
  ]);
  const totals = calculateReservationBalance(reservation, charges, payments);
  return { reservationId: String(reservationId), ...totals, charges: charges.map((charge) => ({ id: String(charge.id), itemType: charge.item_type, itemId: charge.item_id ? String(charge.item_id) : null, description: charge.description, quantity: charge.quantity, unitPrice: Number(charge.unit_price), totalAmount: Number(charge.total_amount), isIncluded: charge.item_type === 'prebooked_food', createdAt: charge.created_at })), payments: payments.map((payment) => ({ id: String(payment.id), amount: Number(payment.amount), paymentMethod: payment.payment_method, reference: payment.reference, status: payment.status, collectedAt: payment.collected_at })) };
}

function assertBillable(reservation) {
  if (['checked_out', 'cancelled', 'no_show'].includes(reservation.booking_status)) throw new ApiError(409, 'This booking is closed. An admin must reopen it before changing the bill.');
}
async function recordBillingActivity(trx, reservation, user, action, remarks) {
  await trx('reservation_activity').insert({ reservation_id: reservation.id, guest_user_id: reservation.guest_user_id || null, villa_id: reservation.villa_id || null, staff_user_id: user.id, action, remarks });
}
export async function getReservationStatement(reservationId, user) { const db = database(); await reservationForUser(db, reservationId, user); return statementFor(db, reservationId); }
export async function addReservationCharge(reservationId, input, user) {
  const db = database();
  return db.transaction(async (trx) => {
    const reservation = await reservationForUser(trx, reservationId, user, true); assertBillable(reservation);
    const item = input.itemType === 'food'
      ? await trx('menu_items').where({ id: input.itemId, is_active: true, is_available: true }).first()
      : await trx('services').where({ id: input.itemId, is_active: true }).first();
    if (!item) throw new ApiError(404, 'Chargeable item not found or inactive');
    const description = input.itemType === 'food' ? item.name : item.title;
    const unitPrice = Number(item.price || 0);
    await trx('reservation_charges').insert({ reservation_id: reservationId, item_type: input.itemType, item_id: input.itemId, description, quantity: input.quantity, unit_price: unitPrice, total_amount: unitPrice * input.quantity, created_by_user_id: user.id });
    await recordBillingActivity(trx, reservation, user, 'charge-added', `${description} × ${input.quantity}`);
    return statementFor(trx, reservationId);
  });
}
export async function removeReservationCharge(reservationId, chargeId, user) {
  const db = database();
  return db.transaction(async (trx) => {
    const reservation = await reservationForUser(trx, reservationId, user, true); assertBillable(reservation);
    const charge = await trx('reservation_charges').where({ id: chargeId, reservation_id: reservationId }).first();
    if (!charge) throw new ApiError(404, 'Charge not found');
    await trx('reservation_charges').where({ id: chargeId, reservation_id: reservationId }).del();
    await recordBillingActivity(trx, reservation, user, 'charge-removed', charge.description);
    return statementFor(trx, reservationId);
  });
}
export async function collectReservationPayment(reservationId, input, user) {
  const db = database();
  return db.transaction(async (trx) => {
    const reservation = await reservationForUser(trx, reservationId, user, true); assertBillable(reservation);
    const current = await statementFor(trx, reservationId);
    if (input.amount > current.balance) throw new ApiError(400, 'Payment cannot exceed the outstanding balance');
    await trx('reservation_payments').insert({ reservation_id: reservationId, amount: input.amount, payment_method: input.paymentMethod, reference: input.reference || null, collected_by_user_id: user.id });
    const updated = await statementFor(trx, reservationId);
    await trx('reservations').where({ id: reservationId }).update({ payment_status: updated.balance <= 0 ? 'paid' : 'partial', payment_method: input.paymentMethod });
    await recordBillingActivity(trx, reservation, user, 'payment-collected', `${Number(input.amount).toFixed(2)} via ${input.paymentMethod}`);
    return updated;
  });
}
