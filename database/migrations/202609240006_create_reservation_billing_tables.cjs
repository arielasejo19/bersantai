exports.up = async function up(knex) {
  await knex.schema.createTable('reservation_charges', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('reservation_id').unsigned().notNullable();
    table.string('item_type', 30).notNullable();
    table.bigInteger('item_id').unsigned().nullable();
    table.string('description', 255).notNullable();
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable().defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0);
    table.bigInteger('created_by_user_id').unsigned().nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');
    table.foreign('created_by_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['reservation_id', 'created_at']);
  });

  await knex.schema.createTable('reservation_payments', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('reservation_id').unsigned().notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('payment_method', 40).notNullable();
    table.string('reference', 120).nullable();
    table.string('status', 30).notNullable().defaultTo('collected');
    table.bigInteger('collected_by_user_id').unsigned().nullable();
    table.timestamp('collected_at').notNullable().defaultTo(knex.fn.now());
    table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');
    table.foreign('collected_by_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['reservation_id', 'collected_at']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('reservation_payments');
  await knex.schema.dropTableIfExists('reservation_charges');
};