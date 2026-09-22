exports.up = async function up(knex) {
  await knex.schema.alterTable('villas', (table) => {
    table.string('stay_type', 20).notNullable().defaultTo('both').after('availability_status');
    table.index(['stay_type']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villas', (table) => {
    table.dropIndex(['stay_type']);
    table.dropColumn('stay_type');
  });
};
