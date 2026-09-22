exports.up = async function up(knex) {
  await knex.schema.createTable('villa_types', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 120).notNullable().unique();
    table.string('slug', 150).notNullable().unique();
    table.text('description').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex('villa_types').insert([
    { name: 'Sulawesi', slug: 'sulawesi' },
    { name: 'Java', slug: 'java' },
    { name: 'Sumatra', slug: 'sumatra' }
  ]);

  await knex.schema.alterTable('villas', (table) => {
    table.bigInteger('villa_type_id').unsigned().nullable().after('location');
    table.foreign('villa_type_id').references('id').inTable('villa_types').onDelete('SET NULL');
    table.index(['villa_type_id']);
  });

  await knex.schema.alterTable('reservations', (table) => {
    table.bigInteger('villa_type_id').unsigned().nullable().after('villa_id');
    table.foreign('villa_type_id').references('id').inTable('villa_types').onDelete('SET NULL');
    table.index(['villa_type_id', 'check_in', 'check_out']);
    table.bigInteger('villa_id').unsigned().nullable().alter();
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropForeign(['villa_type_id']);
    table.dropIndex(['villa_type_id', 'check_in', 'check_out']);
    table.dropColumn('villa_type_id');
    table.bigInteger('villa_id').unsigned().notNullable().alter();
  });
  await knex.schema.alterTable('villas', (table) => {
    table.dropForeign(['villa_type_id']);
    table.dropIndex(['villa_type_id']);
    table.dropColumn('villa_type_id');
  });
  await knex.schema.dropTableIfExists('villa_types');
};
