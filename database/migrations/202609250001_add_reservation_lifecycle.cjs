exports.up = async function up(knex) {
  const reservationColumns = await knex('reservations').columnInfo();
  const missing = [
    ['guests', (table) => table.integer('guests').unsigned().notNullable().defaultTo(1)],
    ['booking_mode', (table) => table.string('booking_mode', 20).notNullable().defaultTo('airbnb')],
    ['confirmed_at', (table) => table.timestamp('confirmed_at').nullable()],
    ['confirmed_by_user_id', (table) => table.bigInteger('confirmed_by_user_id').unsigned().nullable()],
    ['assigned_at', (table) => table.timestamp('assigned_at').nullable()],
    ['assigned_by_user_id', (table) => table.bigInteger('assigned_by_user_id').unsigned().nullable()],
    ['checked_in_by_user_id', (table) => table.bigInteger('checked_in_by_user_id').unsigned().nullable()],
    ['check_in_remarks', (table) => table.text('check_in_remarks').nullable()],
    ['checked_out_by_user_id', (table) => table.bigInteger('checked_out_by_user_id').unsigned().nullable()],
    ['check_out_remarks', (table) => table.text('check_out_remarks').nullable()]
  ].filter(([name]) => !reservationColumns[name]);

  if (missing.length) {
    await knex.schema.alterTable('reservations', (table) => {
      missing.forEach(([, addColumn]) => addColumn(table));
      for (const [name] of missing) {
        if (name.endsWith('_by_user_id')) table.foreign(name).references('id').inTable('users').onDelete('SET NULL');
      }
      table.index(['booking_mode', 'booking_status'], 'reservations_mode_status_idx');
    });
  }

  const villaColumns = await knex('villas').columnInfo();
  if (!villaColumns.occupancy_status) {
    await knex.schema.alterTable('villas', (table) => {
      table.string('occupancy_status', 20).notNullable().defaultTo('available');
      table.index(['occupancy_status']);
    });
  }
  await knex('villas')
    .whereIn('id', knex('reservations').where({ booking_status: 'checked_in' }).whereNotNull('villa_id').select('villa_id'))
    .update({ occupancy_status: 'occupied' });

  await knex('reservations').whereNull('booking_mode').update({ booking_mode: 'airbnb' });
  await knex('reservations').whereNull('villa_id').whereNotNull('villa_type_id').update({ booking_mode: 'hotel' });
  await knex.raw("UPDATE reservations SET confirmed_at = created_at WHERE booking_status = 'confirmed' AND confirmed_at IS NULL");

  if (!(await knex.schema.hasTable('reservation_activity'))) {
    await knex.schema.createTable('reservation_activity', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('reservation_id').unsigned().notNullable();
      table.bigInteger('guest_user_id').unsigned().nullable();
      table.bigInteger('villa_id').unsigned().nullable();
      table.bigInteger('staff_user_id').unsigned().nullable();
      table.string('action', 50).notNullable();
      table.text('remarks').nullable();
      table.text('metadata_json').nullable();
      table.timestamp('occurred_at').notNullable().defaultTo(knex.fn.now());
      table.foreign('reservation_id').references('id').inTable('reservations').onDelete('CASCADE');
      table.foreign('guest_user_id').references('id').inTable('users').onDelete('SET NULL');
      table.foreign('villa_id').references('id').inTable('villas').onDelete('SET NULL');
      table.foreign('staff_user_id').references('id').inTable('users').onDelete('SET NULL');
      table.index(['reservation_id', 'occurred_at'], 'reservation_activity_timeline_idx');
    });
  }

  if (await knex.schema.hasTable('reservation_emails')) {
    const emailColumns = await knex('reservation_emails').columnInfo();
    await knex.schema.alterTable('reservation_emails', (table) => {
      if (!emailColumns.attempted_at) table.timestamp('attempted_at').notNullable().defaultTo(knex.fn.now());
      if (!emailColumns.error_message) table.text('error_message').nullable();
      if (emailColumns.sent_at?.nullable === false || emailColumns.sent_at?.nullable === 'NO') table.timestamp('sent_at').nullable().alter();
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('reservation_activity');
  if (await knex.schema.hasTable('reservation_emails')) {
    const columns = await knex('reservation_emails').columnInfo();
    if (columns.attempted_at) await knex.schema.alterTable('reservation_emails', (table) => table.dropColumn('attempted_at'));
    if (columns.error_message) await knex.schema.alterTable('reservation_emails', (table) => table.dropColumn('error_message'));
  }
  const villaColumns = await knex('villas').columnInfo();
  if (villaColumns.occupancy_status) await knex.schema.alterTable('villas', (table) => { table.dropIndex(['occupancy_status']); table.dropColumn('occupancy_status'); });
  const reservationColumns = await knex('reservations').columnInfo();
  const lifecycleColumns = ['guests', 'booking_mode', 'confirmed_at', 'confirmed_by_user_id', 'assigned_at', 'assigned_by_user_id', 'checked_in_by_user_id', 'check_in_remarks', 'checked_out_by_user_id', 'check_out_remarks'];
  await knex.schema.alterTable('reservations', (table) => {
    if (reservationColumns.booking_mode) table.dropIndex(['booking_mode', 'booking_status'], 'reservations_mode_status_idx');
    for (const name of lifecycleColumns.filter((column) => reservationColumns[column])) {
      if (name.endsWith('_by_user_id')) table.dropForeign(name);
      table.dropColumn(name);
    }
  });
};
