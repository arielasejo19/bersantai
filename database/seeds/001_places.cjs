exports.seed = async function seed(knex) {
  await knex('places').del();
  await knex('places').insert([
    {
      name: 'Bersantai Demo Place',
      slug: 'bersantai-demo-place',
      description: 'A development seed place for validating the initial database foundation.',
      status: 'draft'
    }
  ]);
};
