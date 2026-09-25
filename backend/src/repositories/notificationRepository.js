import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

export async function listReservationNotifications(user, afterId) {
  const db = database();
  const cursor = afterId === undefined || afterId === '' ? null : String(afterId);
  if (cursor !== null && !/^\d+$/.test(cursor)) throw new ApiError(400, 'Invalid notification cursor');

  let query = db('reservation_activity')
    .join('reservations', 'reservations.id', 'reservation_activity.reservation_id')
    .leftJoin('villas as event_villas', 'event_villas.id', 'reservation_activity.villa_id')
    .leftJoin('villas as booking_villas', 'booking_villas.id', 'reservations.villa_id')
    .leftJoin('villa_types', 'villa_types.id', 'reservations.villa_type_id')
    .leftJoin('users as staff_users', 'staff_users.id', 'reservation_activity.staff_user_id')
    .leftJoin('profiles as staff_profiles', 'staff_profiles.user_id', 'staff_users.id')
    .select(
      'reservation_activity.id as id', 'reservation_activity.reservation_id', 'reservation_activity.action',
      'reservation_activity.occurred_at', 'reservation_activity.remarks', 'reservations.reference_number',
      'reservations.guest_name', 'staff_profiles.display_name as staff_name', 'staff_users.email as staff_email',
      db.raw('COALESCE(event_villas.name, booking_villas.name, villa_types.name) AS accommodation_name')
    );

  if (user.role === 'host') {
    query = query.where('booking_villas.owner_user_id', user.id);
  }

  const latestActivity = await db('reservation_activity').max({ max_id: 'id' }).first();
  const newestActivityId = latestActivity?.max_id == null ? (cursor || '0') : String(latestActivity.max_id);
  const nextCursor = cursor !== null && BigInt(newestActivityId) < BigInt(cursor) ? cursor : newestActivityId;
  if (cursor === null) query = query.where('reservation_activity.id', '<=', nextCursor).orderBy('reservation_activity.id', 'desc').limit(20);
  else query = query.where('reservation_activity.id', '>', cursor).where('reservation_activity.id', '<=', nextCursor).orderBy('reservation_activity.id', 'asc').limit(50);

  const rows = await query;
  return {
    cursor: nextCursor,
    notifications: rows.map((row) => ({
      id: String(row.id),
      reservationId: String(row.reservation_id),
      action: row.action,
      occurredAt: row.occurred_at,
      remarks: row.remarks,
      referenceNumber: row.reference_number,
      guestName: row.guest_name,
      staffName: row.staff_name || row.staff_email || null,
      accommodationName: row.accommodation_name || 'Reservation'
    }))
  };
}
