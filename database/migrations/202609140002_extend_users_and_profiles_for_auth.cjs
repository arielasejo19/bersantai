exports.up = async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('account_status', 50).notNullable().defaultTo('active').after('role');
    table.timestamp('last_login_at').nullable().after('account_status');
    table.index(['account_status']);
  });

  await knex.schema.alterTable('profiles', (table) => {
    table.text('bio').nullable().after('display_name');
    table.string('avatar_url', 500).nullable().after('bio');
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('profiles', (table) => {
    table.dropColumn('avatar_url');
    table.dropColumn('bio');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropIndex(['account_status']);
    table.dropColumn('last_login_at');
    table.dropColumn('account_status');
  });
};
