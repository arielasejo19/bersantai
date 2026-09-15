exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('guest');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });

  await knex.schema.createTable('profiles', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable();
    table.string('display_name', 150).notNullable();
    table.string('phone_number', 40);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['user_id']);
  });

  await knex.schema.createTable('places', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 180).notNullable();
    table.string('slug', 200).notNullable().unique();
    table.text('description');
    table.string('status', 50).notNullable().defaultTo('draft');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.index(['status']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('places');
  await knex.schema.dropTableIfExists('profiles');
  await knex.schema.dropTableIfExists('users');
};
