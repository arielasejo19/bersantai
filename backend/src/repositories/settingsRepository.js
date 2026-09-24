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

const publicDefaults = { location: 'Kintamani, Munduk & Bedugul', address: 'Bali, Indonesia', contactNumber: '+62 361 234 567', email: 'hello@bersantai.com', description: 'Private Bali mountain stays made for slower days, warm welcomes, and a closer connection to the highlands.', mapUrl: '' };

export async function getPublicSiteSettings() {
  const rows = await requireDatabase()('system_settings').whereIn('key', Object.keys(publicDefaults).map((key) => `public_${key}`));
  const values = Object.fromEntries(rows.map((row) => [row.key.replace('public_', ''), row.value]));
  return { ...publicDefaults, ...values };
}

export async function setPublicSiteSettings(settings) {
  const db = requireDatabase();
  for (const [key, value] of Object.entries(settings)) {
    if (!(key in publicDefaults)) continue;
    const settingKey = `public_${key}`;
    const exists = await db('system_settings').where({ key: settingKey }).first();
    if (exists) await db('system_settings').where({ key: settingKey }).update({ value: String(value || '') });
    else await db('system_settings').insert({ key: settingKey, value: String(value || '') });
  }
  return getPublicSiteSettings();
}