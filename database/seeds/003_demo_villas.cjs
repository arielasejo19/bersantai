const demoVillas = [
  ['Sulawesi 101', 'sulawesi-101', 'Sulawesi', 2, 1],
  ['Sulawesi 102', 'sulawesi-102', 'Sulawesi', 2, 1],
  ['Java 101', 'java-101', 'Java', 2, 1],
  ['Java 102', 'java-102', 'Java', 2, 1],
  ['Sumatra 101', 'sumatra-101', 'Sumatra', 2, 1],
  ['Sumatra 102', 'sumatra-102', 'Sumatra', 2, 1]
];

exports.seed = async function seed(knex) {
  const defaultImages = {
    Sulawesi: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90',
    Java: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=90',
    Sumatra: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=90'
  };
  for (const [typeName, defaultImageUrl] of Object.entries(defaultImages)) await knex('villa_types').where({ name: typeName }).update({ default_image_url: defaultImageUrl });
  for (const [name, slug, typeName, capacity, bedroomCount] of demoVillas) {
    const villaType = await knex('villa_types').where({ name: typeName }).first();
    if (!villaType) continue;
    const existing = await knex('villas').where({ slug }).first();
    const values = {
      name,
      slug,
      location: `${typeName}, Bali`,
      villa_type_id: villaType.id,
      description: `A private ${typeName} villa prepared for a considered island stay.`,
      nightly_price: 240,
      capacity,
      bedroom_count: bedroomCount,
      status: 'active',
      availability_status: 'available'
    };
    if (existing) await knex('villas').where({ id: existing.id }).update(values);
    else await knex('villas').insert(values);
  }
};
