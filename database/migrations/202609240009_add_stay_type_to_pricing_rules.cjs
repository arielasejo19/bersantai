exports.up = async function up(knex) {
  await knex.schema.alterTable('villa_pricing_rules', (table) => {
    table.string('stay_type', 20).notNullable().defaultTo('both').after('name');
    table.index(['stay_type']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villa_pricing_rules', (table) => {
    table.dropIndex(['stay_type']);
    table.dropColumn('stay_type');
  });
};