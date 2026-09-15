import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function requireDatabase() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

export async function getOperatingMode() {
  const row = await requireDatabase()('system_settings').where({ key: 'operating_mode' }).first();
  return row?.value === 'hotel' ? 'hotel' : 'airbnb';
}

export async function setOperatingMode(mode) {
  const db = requireDatabase();
  await db('system_settings').where({ key: 'operating_mode' }).update({ value: mode });
  return mode;
}