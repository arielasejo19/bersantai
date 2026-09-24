import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() { const db = getDatabase(); if (!db) throw new ApiError(503, 'Database is not configured'); return db; }
async function reservationForUser(db, reservationId, user) {
  const query = db('reservations').leftJoin('villas', 'villas.id', 'reservations.villa_id').where('reservations.id', reservationId).select('reservations.*', 'villas.owner_user_id');
  if (user.role === 'host') query.where('villas.owner_user_id', user.id);
  if (user.role === 'receptionist') query.whereNotNull('reservations.villa_id');
  const reservation = await query.first();
  if (!reservation) throw new ApiError(404, 'Reservation not found');
  return reservation;
}
async function statementFor(db, reservationId) {
  const [reservation, charges, payments] = await Promise.all([
    db('reservations').where({ id: reservationId }).first(),
    db('reservation_charges').where({ reservation_id: reservationId }).orderBy('created_at', 'asc'),
    db('reservation_payments').where({ reservation_id: reservationId }).orderBy('collected_at', 'asc')
  ]);
  const chargesTotal = charges.reduce((sum, charge) => sum + Number(charge.total_amount || 0), 0);
  const paymentsTotal = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const roomTotal = Number(reservation.total_amount || 0);
  const total = roomTotal + chargesTotal;
  return { reservationId: String(reservationId), roomTotal, chargesTotal, total, paymentsTotal, balance: Math.max(0, total - paymentsTotal), charges: charges.map((charge) => ({ id: String(charge.id), itemType: charge.item_type, itemId: charge.item_id ? String(charge.item_id) : null, description: charge.description, quantity: charge.quantity, unitPrice: Number(charge.unit_price), totalAmount: Number(charge.total_amount), createdAt: charge.created_at })), payments: payments.map((payment) => ({ id: String(payment.id), amount: Number(payment.amount), paymentMethod: payment.payment_method, reference: payment.reference, status: payment.status, collectedAt: payment.collected_at })) };
}
export async function getReservationStatement(reservationId, user) { const db = database(); await reservationForUser(db, reservationId, user); return statementFor(db, reservationId); }
export async function addReservationCharge(reservationId, input, user) {
  const db = database(); await reservationForUser(db, reservationId, user);
  const item = input.itemType === 'food'
    ? await db('menu_items').where({ id: input.itemId, is_active: true, is_available: true }).first()
    : await db('services').where({ id: input.itemId, is_active: true }).first();
  if (!item) throw new ApiError(404, 'Chargeable item not found or inactive');
  const description = input.itemType === 'food' ? item.name : item.title;
  const unitPrice = Number(item.price || 0);
  await db('reservation_charges').insert({ reservation_id: reservationId, item_type: input.itemType, item_id: input.itemId, description, quantity: input.quantity, unit_price: unitPrice, total_amount: unitPrice * input.quantity, created_by_user_id: user.id });
  return statementFor(db, reservationId);
}
export async function removeReservationCharge(reservationId, chargeId, user) {
  const db = database(); await reservationForUser(db, reservationId, user); const deleted = await db('reservation_charges').where({ id: chargeId, reservation_id: reservationId }).del(); if (!deleted) throw new ApiError(404, 'Charge not found'); return statementFor(db, reservationId);
}
export async function collectReservationPayment(reservationId, input, user) {
  const db = database(); await reservationForUser(db, reservationId, user); const current = await statementFor(db, reservationId); if (input.amount > current.balance) throw new ApiError(400, 'Payment cannot exceed the outstanding balance');
  await db('reservation_payments').insert({ reservation_id: reservationId, amount: input.amount, payment_method: input.paymentMethod, reference: input.reference || null, collected_by_user_id: user.id });
  const updated = await statementFor(db, reservationId); await db('reservations').where({ id: reservationId }).update({ payment_status: updated.balance <= 0 ? 'paid' : 'partial', payment_method: input.paymentMethod }); return updated;
}