const services = [
  {
    title: 'Airport Transfer: Davao to Bersantai',
    slug: 'airport-transfer-davao-to-bersantai',
    description: 'Private one-way transfer from Davao International Airport to Bersantai, with a comfortable vehicle and a local driver.',
    price: 1800,
    category: 'transport',
    image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: false,
    sort_order: 10
  },
  {
    title: 'Airport Transfer: Bersantai to Davao',
    slug: 'airport-transfer-bersantai-to-davao',
    description: 'Private one-way transfer from Bersantai to Davao International Airport, scheduled around your departure time.',
    price: 1800,
    category: 'transport',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: false,
    sort_order: 20
  },
  {
    title: 'Massage Spa',
    slug: 'massage-spa',
    description: 'A restorative in-villa massage using warm oils and slow, grounding techniques from a local wellness practitioner.',
    price: 1500,
    category: 'wellness',
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: false,
    sort_order: 30
  },
  {
    title: 'Davao City Tour',
    slug: 'davao-city-tour',
    description: 'A private guided day tour through Davao City, including local landmarks, food stops, and time to explore at your own pace.',
    price: 3200,
    category: 'tour',
    image_url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: true,
    sort_order: 40
  },
  {
    title: 'Highland Nature Tour',
    slug: 'highland-nature-tour',
    description: 'Discover nearby viewpoints, forest paths, and quiet highland villages with a private local guide.',
    price: 2800,
    category: 'tour',
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: true,
    sort_order: 50
  },
  {
    title: 'Sunrise Trek and Breakfast',
    slug: 'sunrise-trek-and-breakfast',
    description: 'Start before dawn for a gentle guided trek and return to a fresh breakfast served at the villa.',
    price: 2200,
    category: 'experience',
    image_url: 'https://images.unsplash.com/photo-1500534623283-312aede485b7?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: true,
    sort_order: 60
  },
  {
    title: 'Private Dinner Setup',
    slug: 'private-dinner-setup',
    description: 'A beautifully prepared private dinner setting with table styling, candles, and a chef-curated local menu.',
    price: 2500,
    category: 'dining',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: false,
    sort_order: 70
  },
  {
    title: 'Villa Celebration Setup',
    slug: 'villa-celebration-setup',
    description: 'A thoughtful in-villa setup for birthdays, anniversaries, proposals, and other memorable stays.',
    price: 1800,
    category: 'special-occasion',
    image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    day_tour_only: false,
    sort_order: 80
  }
];

exports.seed = async function seed(knex) {
  for (const service of services) {
    await knex('services').insert({ ...service, is_active: true }).onConflict('slug').merge({ ...service, is_active: true });
  }
};