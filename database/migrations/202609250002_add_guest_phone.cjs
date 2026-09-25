exports.up = async function up(knex) {
  const columns = await knex('reservations').columnInfo();
  if (!columns.guest_phone) {
    await knex.schema.alterTable('reservations', (table) => {
      table.string('guest_phone', 32).nullable().after('guest_email');
    });
  }
};

exports.down = async function down(knex) {
  const columns = await knex('reservations').columnInfo();
  if (columns.guest_phone) {
    await knex.schema.alterTable('reservations', (table) => table.dropColumn('guest_phone'));
  }
};
