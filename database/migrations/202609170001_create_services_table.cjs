exports.up = async function up(knex) {
  await knex.schema.createTable('services', (table) => {
    table.bigIncrements('id').primary();
    table.string('title', 180).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('description').notNullable();
    table.string('image_url', 1000).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.integer('sort_order').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('services');
};
