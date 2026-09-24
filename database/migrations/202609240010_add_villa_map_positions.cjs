exports.up = async function up(knex) {
  await knex.schema.alterTable('villas', (table) => {
    table.decimal('map_x', 5, 2).nullable();
    table.decimal('map_y', 5, 2).nullable();
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villas', (table) => {
    table.dropColumn('map_x');
    table.dropColumn('map_y');
  });
};