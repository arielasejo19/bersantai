exports.up = async function up(knex) {
  const additions = [
    ['villa_types', 'default_media_type'],
    ['services', 'media_type'],
    ['menu_items', 'media_type'],
    ['packages', 'media_type']
  ];
  for (const [tableName, columnName] of additions) {
    if (!(await knex.schema.hasColumn(tableName, columnName))) {
      await knex.schema.alterTable(tableName, (table) => {
        table.string(columnName, 20).notNullable().defaultTo('image');
      });
    }
  }
};

exports.down = async function down(knex) {
  for (const [tableName, columnName] of [['packages', 'media_type'], ['menu_items', 'media_type'], ['services', 'media_type'], ['villa_types', 'default_media_type']]) {
    if (await knex.schema.hasColumn(tableName, columnName)) {
      await knex.schema.alterTable(tableName, (table) => table.dropColumn(columnName));
    }
  }
};