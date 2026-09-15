exports.up = async function up(knex) {
  await knex.schema.createTable('system_settings', (table) => {
    table.string('key', 100).primary();
    table.string('value', 255).notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });

  await knex('system_settings').insert({ key: 'operating_mode', value: 'airbnb' });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('system_settings');
};