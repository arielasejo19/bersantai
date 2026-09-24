exports.up = async function up(knex) {
  for (const tableName of ['villas', 'villa_types']) {
    const hasCheckIn = await knex.schema.hasColumn(tableName, 'standard_check_in');
    if (!hasCheckIn) {
      await knex.schema.alterTable(tableName, (table) => {
        table.string('standard_check_in', 5).notNullable().defaultTo('15:00');
        table.string('standard_check_out', 5).notNullable().defaultTo('11:00');
        table.index(['standard_check_in', 'standard_check_out']);
      });
    }
  }
};

exports.down = async function down(knex) {
  for (const tableName of ['villa_types', 'villas']) {
    if (await knex.schema.hasColumn(tableName, 'standard_check_in')) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropIndex(['standard_check_in', 'standard_check_out']);
        table.dropColumn('standard_check_in');
        table.dropColumn('standard_check_out');
      });
    }
  }
};