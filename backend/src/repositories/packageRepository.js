import { getDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

function database() { const db = getDatabase(); if (!db) throw new ApiError(503, 'Database is not configured'); return db; }
function packageQuery(db) { return db('packages').select('*').orderBy('created_at', 'desc'); }

async function hydrate(db, row) {
  const [villas, menuItems] = await Promise.all([
    db('package_villas').join('villas', 'villas.id', 'package_villas.villa_id').where({ package_id: row.id }).select('villas.id', 'villas.name', 'villas.location', 'villas.nightly_price', 'villas.status', 'villas.availability_status'),
    db('package_menu_items').join('menu_items', 'menu_items.id', 'package_menu_items.menu_item_id').leftJoin('menu_categories', 'menu_categories.id', 'menu_items.category_id').where({ package_id: row.id }).select('menu_items.id', 'menu_items.name', 'menu_items.description', 'menu_items.image_url', 'menu_items.price', 'menu_items.is_active', 'menu_items.is_available', 'menu_categories.name as category_name', 'package_menu_items.quantity')
  ]);
  const originalPrice = villas.reduce((total, villa) => total + Number(villa.nightly_price || 0), 0) + menuItems.reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  return {
    id: String(row.id), name: row.name, slug: row.slug, description: row.description, imageUrl: row.image_url, mediaType: row.media_type || 'image',
    price: Number(row.price || 0), originalPrice, savings: Math.max(0, originalPrice - Number(row.price || 0)),
    discountPercent: originalPrice ? Math.max(0, Math.round(((originalPrice - Number(row.price || 0)) / originalPrice) * 100)) : 0,
    isAvailable: Boolean(row.is_available), isActive: Boolean(row.is_active), villas: villas.map((villa) => ({ id: String(villa.id), name: villa.name, location: villa.location, nightlyPrice: Number(villa.nightly_price || 0), status: villa.status, availabilityStatus: villa.availability_status })),
    menuItems: menuItems.map((item) => ({ id: String(item.id), name: item.name, description: item.description, imageUrl: item.image_url, price: Number(item.price || 0), quantity: Number(item.quantity || 1), category: item.category_name, isActive: Boolean(item.is_active), isAvailable: Boolean(item.is_available) })),
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

export async function listPackages({ activeOnly = false } = {}) {
  const db = database();
  const query = packageQuery(db);
  if (activeOnly) query.where({ is_active: true, is_available: true });
  return Promise.all((await query).map((row) => hydrate(db, row)));
}

export async function createPackage(input) {
  const db = database();
  const [id] = await db.transaction(async (trx) => {
    const [packageId] = await trx('packages').insert({ name: input.name, slug: input.slug, description: input.description, image_url: input.imageUrl || null, price: input.price, is_available: input.isAvailable, is_active: input.isActive });
    await trx('package_villas').insert(input.villaIds.map((villaId) => ({ package_id: packageId, villa_id: villaId })));
    await trx('package_menu_items').insert(input.menuItems.map((item) => ({ package_id: packageId, menu_item_id: item.menuItemId, quantity: item.quantity })));
    return [packageId];
  });
  return hydrate(db, await db('packages').where({ id }).first());
}

export async function updatePackage(id, input) {
  const db = database();
  await db.transaction(async (trx) => {
    if (!(await trx('packages').where({ id }).update({ name: input.name, slug: input.slug, description: input.description, image_url: input.imageUrl || null, price: input.price, is_available: input.isAvailable, is_active: input.isActive }))) throw new ApiError(404, 'Package not found');
    await trx('package_villas').where({ package_id: id }).del();
    await trx('package_menu_items').where({ package_id: id }).del();
    await trx('package_villas').insert(input.villaIds.map((villaId) => ({ package_id: id, villa_id: villaId })));
    await trx('package_menu_items').insert(input.menuItems.map((item) => ({ package_id: id, menu_item_id: item.menuItemId, quantity: item.quantity })));
  });
  return hydrate(db, await db('packages').where({ id }).first());
}

export async function deletePackage(id) { if (!(await database()('packages').where({ id }).del())) throw new ApiError(404, 'Package not found'); }
export async function updatePackageMedia(id, media) { const db = database(); if (!(await db('packages').where({ id }).update({ image_url: media.url, media_type: media.mediaType }))) throw new ApiError(404, 'Package not found'); return hydrate(db, await db('packages').where({ id }).first()); }