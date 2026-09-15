import { getDatabase } from '../config/database.js';

export async function pingDatabase() {
  const db = getDatabase();

  if (!db) {
    return {
      status: 'not_configured'
    };
  }

  try {
    await db.raw('select 1 as ok');
    return {
      status: 'up'
    };
  } catch (_error) {
    return {
      status: 'unavailable'
    };
  }
}
