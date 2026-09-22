exports.seed = async function seed(knex) {
  await knex('villa_types').insert({ name: 'Dining Pavilion', slug: 'dining-pavilion', description: 'A day-use dining pavilion with an Infinity Pool.', is_active: true, day_tour_only: true, default_image_url: '/images/villas/dining-pavillion.jpg' }).onConflict('slug').merge();
  const type = await knex('villa_types').where({ slug: 'dining-pavilion' }).first();
  const existing = await knex('villas').where({ slug: 'dining-pavilion' }).first();
  const villaId = existing?.id || (await knex('villas').insert({ name: 'Dining Pavilion', slug: 'dining-pavilion', location: 'Bali', villa_type_id: type.id, description: 'Day tour dining pavilion with Infinity Pool.', nightly_price: 0, capacity: 20, bedroom_count: 0, status: 'active', availability_status: 'available' }))[0];
  await knex('villa_amenities').insert({ villa_id: villaId, name: 'Infinity Pool' }).onConflict(['villa_id', 'name']).ignore();
};
