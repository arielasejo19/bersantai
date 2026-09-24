exports.up = async function up(knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.text('guest_note').nullable();
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropColumn('guest_note');
  });
};