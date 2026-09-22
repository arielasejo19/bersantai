exports.up = async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('email_verified').notNullable().defaultTo(false).after('account_status');
  });

  await knex.schema.createTable('email_verification_challenges', (table) => {
    table.bigIncrements('id').primary();
    table.string('email', 255).notNullable();
    table.string('code_hash', 255).notNullable();
    table.string('verification_token', 128).nullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('verified_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['email', 'created_at']);
  });

  await knex.schema.createTable('social_identities', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable();
    table.string('provider', 30).notNullable();
    table.string('provider_user_id', 255).notNullable();
    table.string('email', 255).notNullable();
    table.timestamps(true, true);
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['provider', 'provider_user_id']);
    table.unique(['provider', 'email']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('social_identities');
  await knex.schema.dropTableIfExists('email_verification_challenges');
  await knex.schema.alterTable('users', (table) => table.dropColumn('email_verified'));
};
