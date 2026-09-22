import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

function parseJson(value, fallback = []) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch (_error) { return fallback; }
}

function toVillaType(row) {
  return {
    id: String(row.id), name: row.name, slug: row.slug, description: row.description,
    isActive: Boolean(row.is_active), dayTourOnly: Boolean(row.day_tour_only), defaultImageUrl: row.default_image_url,
    galleryUrls: parseJson(row.gallery_urls_json), amenities: parseJson(row.amenities_json),
    nightlyPrice: Number(row.nightly_price || 0), capacity: Number(row.capacity || 2), bedroomCount: Number(row.bedroom_count || 1),
    status: row.status || 'active', availabilityStatus: row.availability_status || 'available',
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

export async function listVillaTypes({ activeOnly = false } = {}) {
  const db = database();
  const query = db('villa_types').orderBy('name');
  if (activeOnly) query.where({ 'is_active': true, 'status': 'active', 'availability_status': 'available' }).whereExists(
    db('villas').select(1).whereRaw('villas.villa_type_id = villa_types.id').where({ status: 'active', availability_status: 'available' })
  );
  return (await query).map(toVillaType);
}

export async function findVillaType(id) {
  const row = await database()('villa_types').where({ id }).first();
  if (!row) throw new ApiError(404, 'Villa type not found');
  return toVillaType(row);
}

export async function createVillaType(input) {
  const db = database();
  const [id] = await db('villa_types').insert({
    name: input.name, slug: input.slug, description: input.description || null, is_active: input.isActive,
    day_tour_only: input.dayTourOnly, default_image_url: input.defaultImageUrl || null,
    gallery_urls_json: JSON.stringify(input.galleryUrls || []), amenities_json: JSON.stringify(input.amenities || []),
    nightly_price: input.nightlyPrice, capacity: input.capacity, bedroom_count: input.bedroomCount,
    status: input.status, availability_status: input.availabilityStatus
  });
  return findVillaType(id);
}

export async function updateVillaType(id, input) {
  const db = database();
  const count = await db('villa_types').where({ id }).update({
    name: input.name, slug: input.slug, description: input.description || null, is_active: input.isActive,
    day_tour_only: input.dayTourOnly, default_image_url: input.defaultImageUrl || null,
    gallery_urls_json: JSON.stringify(input.galleryUrls || []), amenities_json: JSON.stringify(input.amenities || []),
    nightly_price: input.nightlyPrice, capacity: input.capacity, bedroom_count: input.bedroomCount,
    status: input.status, availability_status: input.availabilityStatus
  });
  if (!count) throw new ApiError(404, 'Villa type not found');
  return findVillaType(id);
}

export async function deleteVillaType(id) {
  const db = database();
  const linked = await db('villas').where({ villa_type_id: id }).count({ count: '*' }).first();
  if (Number(linked.count) > 0) throw new ApiError(409, 'Remove this villa type from its villas before deleting it');
  const count = await db('villa_types').where({ id }).del();
  if (!count) throw new ApiError(404, 'Villa type not found');
}
