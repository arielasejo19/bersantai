exports.up = async function up(knex) {
  if (!(await knex.schema.hasColumn('menu_items', 'meal_of_day'))) {
    await knex.schema.alterTable('menu_items', (table) => {
      table.string('meal_of_day', 40).nullable().after('category_id');
      table.index(['meal_of_day', 'is_active', 'is_available']);
    });
  }
};

exports.down = async function down(knex) {
  if (await knex.schema.hasColumn('menu_items', 'meal_of_day')) {
    await knex.schema.alterTable('menu_items', (table) => {
      table.dropIndex(['meal_of_day', 'is_active', 'is_available']);
      table.dropColumn('meal_of_day');
    });
  }
};