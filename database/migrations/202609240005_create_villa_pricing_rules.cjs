exports.up = async function up(knex) {
  await knex.schema.createTable('villa_pricing_rules', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.string('name', 180).notNullable();
    table.string('rule_type', 30).notNullable();
    table.date('starts_on').nullable();
    table.date('ends_on').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.index(['villa_id', 'rule_type', 'starts_on', 'ends_on']);
    table.index(['is_active']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('villa_pricing_rules');
};