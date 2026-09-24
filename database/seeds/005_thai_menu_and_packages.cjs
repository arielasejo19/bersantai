const categories = [
  ['Main Course', 'main-course'],
  ['Drinks', 'drinks'],
  ['Appetizer', 'appetizer']
];

const foods = [
  { name: 'Khao Tom Gai', slug: 'khao-tom-gai', category: 'main-course', meal_of_day: 'breakfast', description: 'Comforting jasmine rice soup with tender chicken, ginger, scallions, and fried garlic.', price: 260, image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Pad Thai Goong', slug: 'pad-thai-goong', category: 'main-course', meal_of_day: 'lunch', description: 'Wok-tossed rice noodles with prawns, egg, bean sprouts, peanuts, and tamarind sauce.', price: 420, image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Som Tam Thai', slug: 'som-tam-thai', category: 'appetizer', meal_of_day: 'lunch', description: 'Green papaya salad with long beans, cherry tomatoes, peanuts, lime, and a bright chilli dressing.', price: 280, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Tom Yum Goong', slug: 'tom-yum-goong', category: 'main-course', meal_of_day: 'dinner', description: 'A fragrant hot-and-sour prawn broth with lemongrass, galangal, kaffir lime, and mushrooms.', price: 480, image_url: 'https://images.unsplash.com/photo-1547592180-83b7d1c9b7e5?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Green Curry Chicken', slug: 'green-curry-chicken', category: 'main-course', meal_of_day: 'dinner', description: 'Silky coconut green curry with chicken, Thai basil, aubergine, and steamed jasmine rice.', price: 460, image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Massaman Beef Curry', slug: 'massaman-beef-curry', category: 'main-course', meal_of_day: 'dinner', description: 'Slow-cooked beef in a gently spiced coconut curry with potatoes, peanuts, and crispy shallots.', price: 540, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Mango Sticky Rice', slug: 'mango-sticky-rice', category: 'appetizer', meal_of_day: null, description: 'Sweet coconut sticky rice with ripe Nam Dok Mai mango and toasted mung beans.', price: 240, image_url: 'https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Thai Spring Rolls', slug: 'thai-spring-rolls', category: 'appetizer', meal_of_day: null, description: 'Crisp vegetable spring rolls served with a sweet chilli dipping sauce.', price: 220, image_url: 'https://images.unsplash.com/photo-1548507200-fc7c7a1d4f7b?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Thai Iced Tea', slug: 'thai-iced-tea', category: 'drinks', meal_of_day: null, description: 'Strong Thai tea poured over ice with sweetened condensed milk and evaporated milk.', price: 180, image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1000&q=85' }
];

const packages = [
  {
    name: 'Highland Thai Welcome', slug: 'highland-thai-welcome', description: 'A gentle first evening above the clouds with a private villa and a table of Thai favourites.', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85', price: 980,
    villas: ['java-101'], menu: [{ slug: 'pad-thai-goong', quantity: 1 }, { slug: 'thai-iced-tea', quantity: 2 }, { slug: 'mango-sticky-rice', quantity: 1 }]
  },
  {
    name: 'Taste of the North', slug: 'taste-of-the-north', description: 'A two-night mountain escape paired with a generous Thai dinner for slow, shared evenings.', image_url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=85', price: 1280,
    villas: ['sulawesi-101'], menu: [{ slug: 'massaman-beef-curry', quantity: 1 }, { slug: 'green-curry-chicken', quantity: 1 }, { slug: 'thai-spring-rolls', quantity: 1 }, { slug: 'thai-iced-tea', quantity: 2 }]
  },
  {
    name: 'Bersantai Table for Two', slug: 'bersantai-table-for-two', description: 'A private villa day with bright salads, fragrant soup, and something sweet to finish.', image_url: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85', price: 1050,
    villas: ['sumatra-101', 'dining-pavilion'], menu: [{ slug: 'som-tam-thai', quantity: 1 }, { slug: 'tom-yum-goong', quantity: 1 }, { slug: 'mango-sticky-rice', quantity: 2 }]
  }
];

exports.seed = async function seed(knex) {
  await knex('menu_categories').whereIn('slug', ['breakfast', 'lunch', 'dinner', 'snacks']).update({ is_active: false });
  for (const [name, slug] of categories) {
    await knex('menu_categories').insert({ name, slug, is_active: true }).onConflict('slug').merge({ name, is_active: true });
  }

  const categoryRows = await knex('menu_categories').whereIn('slug', categories.map(([, slug]) => slug));
  const categoryIds = Object.fromEntries(categoryRows.map((category) => [category.slug, category.id]));
  for (const food of foods) {
    const { category, ...foodValues } = food;
    await knex('menu_items').insert({ ...foodValues, category_id: categoryIds[category], is_available: true, is_active: true }).onConflict('slug').merge({ ...foodValues, category_id: categoryIds[category], is_available: true, is_active: true });
  }

  for (const item of packages) {
    await knex('packages').insert({ name: item.name, slug: item.slug, description: item.description, image_url: item.image_url, price: item.price, is_available: true, is_active: true }).onConflict('slug').merge({ name: item.name, description: item.description, image_url: item.image_url, price: item.price, is_available: true, is_active: true });
    const packageRow = await knex('packages').where({ slug: item.slug }).first();
    const villaRows = await knex('villas').whereIn('slug', item.villas).select('id');
    const foodRows = await knex('menu_items').whereIn('slug', item.menu.map((food) => food.slug)).select('id', 'slug');
    await knex('package_villas').where({ package_id: packageRow.id }).del();
    await knex('package_menu_items').where({ package_id: packageRow.id }).del();
    if (villaRows.length) await knex('package_villas').insert(villaRows.map((villa) => ({ package_id: packageRow.id, villa_id: villa.id })));
    if (foodRows.length) await knex('package_menu_items').insert(foodRows.map((food) => ({ package_id: packageRow.id, menu_item_id: food.id, quantity: item.menu.find((entry) => entry.slug === food.slug).quantity })));
  }
};