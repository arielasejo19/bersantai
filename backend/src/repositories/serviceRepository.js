import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() {
  const db = getDatabase();
  if (!db) throw new ApiError(503, 'Database is not configured');
  return db;
}

function toService(row) {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url, mediaType: row.media_type || 'image', price: Number(row.price || 0), category: row.category, dayTourOnly: Boolean(row.day_tour_only),
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listServices({ activeOnly = false } = {}) {
  const query = database()('services').orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'created_at', order: 'asc' }]);
  if (activeOnly) query.where('is_active', true);
  return (await query).map(toService);
}

export async function createService(input) {
  const db = database();
  const [id] = await db('services').insert({ title: input.title, slug: input.slug, description: input.description, price: input.price, category: input.category, image_url: input.imageUrl || null, is_active: input.isActive, day_tour_only: input.dayTourOnly, sort_order: input.sortOrder });
  return toService(await db('services').where({ id }).first());
}

export async function updateService(id, input) {
  const db = database();
  const updated = await db('services').where({ id }).update({ title: input.title, slug: input.slug, description: input.description, price: input.price, category: input.category, image_url: input.imageUrl || null, is_active: input.isActive, day_tour_only: input.dayTourOnly, sort_order: input.sortOrder });
  if (!updated) throw new ApiError(404, 'Service not found');
  return toService(await db('services').where({ id }).first());
}

export async function deleteService(id) {
  const deleted = await database()('services').where({ id }).del();
  if (!deleted) throw new ApiError(404, 'Service not found');
}

export async function updateServiceMedia(id, media) {
  const db = database();
  const count = await db('services').where({ id }).update({ image_url: media.url, media_type: media.mediaType });
  if (!count) throw new ApiError(404, 'Service not found');
  return toService(await db('services').where({ id }).first());
}
