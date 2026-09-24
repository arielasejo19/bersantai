exports.up = async function up(knex) {
  if (!(await knex.schema.hasColumn('villa_pricing_rules', 'villa_type_id'))) {
    await knex.schema.alterTable('villa_pricing_rules', (table) => {
      table.bigInteger('villa_type_id').unsigned().nullable().after('villa_id');
      table.foreign('villa_type_id').references('id').inTable('villa_types').onDelete('CASCADE');
    });
  }
  const [indexes] = await knex.raw("SHOW INDEX FROM villa_pricing_rules WHERE Key_name = 'pricing_rules_type_dates_idx'");
  if (!indexes.length) await knex.schema.alterTable('villa_pricing_rules', (table) => table.index(['villa_type_id', 'rule_type', 'starts_on', 'ends_on'], 'pricing_rules_type_dates_idx'));
  await knex.schema.alterTable('villa_pricing_rules', (table) => {
    table.bigInteger('villa_id').unsigned().nullable().alter();
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villa_pricing_rules', (table) => {
    table.dropForeign(['villa_type_id']);
    table.dropIndex(['villa_type_id', 'rule_type', 'starts_on', 'ends_on'], 'pricing_rules_type_dates_idx');
    table.dropColumn('villa_type_id');
  });
  await knex.schema.alterTable('villa_pricing_rules', (table) => {
    table.bigInteger('villa_id').unsigned().notNullable().alter();
  });
};