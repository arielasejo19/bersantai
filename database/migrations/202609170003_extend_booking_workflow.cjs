exports.up = async function up(knex) {
  await knex.schema.alterTable('villa_types', (table) => {
    table.boolean('day_tour_only').notNullable().defaultTo(false).after('is_active');
    table.string('default_image_url', 1000).nullable().after('description');
  });

  await knex.schema.alterTable('services', (table) => {
    table.decimal('price', 10, 2).notNullable().defaultTo(0).after('description');
    table.string('category', 80).notNullable().defaultTo('service').after('price');
    table.boolean('day_tour_only').notNullable().defaultTo(false).after('is_active');
  });

  await knex.schema.alterTable('reservations', (table) => {
    table.string('booking_kind', 30).notNullable().defaultTo('overnight').after('villa_type_id');
    table.string('payment_method', 40).nullable().after('booking_kind');
    table.string('payment_status', 30).notNullable().defaultTo('unpaid').after('payment_method');
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0).after('payment_status');
    table.string('reference_number', 40).nullable().unique().after('total_amount');
    table.index(['booking_kind', 'check_in']);
    table.index(['payment_status']);
  });

  await knex.schema.createTable('reservation_services', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('reservation_id').unsigned().notNullable();
    table.bigInteger('service_id').unsigned().notNullable();
    table.decimal('unit_price', 10, 2).notNullable().defaultTo(0);
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');
    table.foreign('service_id').references('id').inTable('services').onDelete('RESTRICT');
    table.unique(['reservation_id', 'service_id']);
  });

  await knex.schema.createTable('reservation_emails', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('reservation_id').unsigned().notNullable();
    table.string('recipient', 255).notNullable();
    table.string('template', 80).notNullable();
    table.string('status', 30).notNullable().defaultTo('sent');
    table.timestamp('sent_at').notNullable().defaultTo(knex.fn.now());
    table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('reservation_emails');
  await knex.schema.dropTableIfExists('reservation_services');
  await knex.schema.alterTable('reservations', (table) => {
    table.dropIndex(['payment_status']);
    table.dropIndex(['booking_kind', 'check_in']);
    table.dropColumn('reference_number');
    table.dropColumn('total_amount');
    table.dropColumn('payment_status');
    table.dropColumn('payment_method');
    table.dropColumn('booking_kind');
  });
  await knex.schema.alterTable('services', (table) => { table.dropColumn('day_tour_only'); table.dropColumn('category'); table.dropColumn('price'); });
  await knex.schema.alterTable('villa_types', (table) => { table.dropColumn('default_image_url'); table.dropColumn('day_tour_only'); });
};
