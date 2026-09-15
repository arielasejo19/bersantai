exports.up = async function up(knex) {
  if (!(await knex.schema.hasTable('roles'))) {
    await knex.schema.createTable('roles', (table) => {
      table.string('key', 50).primary();
      table.string('label', 100).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  await knex('roles').insert([
    { key: 'guest', label: 'Guest' },
    { key: 'admin', label: 'Admin' },
    { key: 'host', label: 'Host' },
    { key: 'receptionist', label: 'Receptionist' }
  ]).onConflict('key').ignore();

  const [roleConstraints] = await knex.raw("SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'users_role_foreign'");
  if (!roleConstraints.length) {
    const [roleIndexes] = await knex.raw("SHOW INDEX FROM users WHERE Key_name = 'users_role_index'");
    await knex.schema.alterTable('users', (table) => {
      if (!roleIndexes.length) table.index(['role']);
      table.foreign('role').references('key').inTable('roles');
    });
  }

  await knex.schema.createTable('villas', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 180).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.string('location', 255).notNullable();
    table.text('description');
    table.decimal('nightly_price', 10, 2).notNullable().defaultTo(0);
    table.integer('capacity').unsigned().notNullable().defaultTo(1);
    table.integer('bedroom_count').unsigned().notNullable().defaultTo(1);
    table.string('status', 50).notNullable().defaultTo('draft');
    table.string('availability_status', 50).notNullable().defaultTo('available');
    table.bigInteger('owner_user_id').unsigned().nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.foreign('owner_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['owner_user_id']);
    table.index(['status', 'availability_status']);
  });

  await knex.schema.createTable('villa_amenities', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.string('name', 120).notNullable();
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.unique(['villa_id', 'name']);
  });

  await knex.schema.createTable('villa_photos', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.string('url', 1000).notNullable();
    table.string('alt_text', 255);
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.index(['villa_id', 'sort_order']);
  });

  await knex.schema.createTable('villa_receptionist_assignments', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.bigInteger('user_id').unsigned().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['villa_id', 'user_id']);
    table.index(['user_id']);
  });

  await knex.schema.createTable('reservations', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.bigInteger('guest_user_id').unsigned().nullable();
    table.string('guest_name', 180).notNullable();
    table.string('guest_email', 255).notNullable();
    table.date('check_in').notNullable();
    table.date('check_out').notNullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.string('booking_status', 50).notNullable().defaultTo('confirmed');
    table.timestamp('checked_in_at').nullable();
    table.timestamp('checked_out_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.foreign('guest_user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['villa_id', 'check_in', 'check_out']);
    table.index(['status', 'booking_status']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('reservations');
  await knex.schema.dropTableIfExists('villa_receptionist_assignments');
  await knex.schema.dropTableIfExists('villa_photos');
  await knex.schema.dropTableIfExists('villa_amenities');
  await knex.schema.dropTableIfExists('villas');
  await knex.schema.alterTable('users', (table) => {
    table.dropForeign(['role']);
  });
  await knex.schema.dropTableIfExists('roles');
};