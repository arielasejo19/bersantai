exports.up = async function up(knex) {
  await knex.schema.createTable('menu_categories', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 120).notNullable().unique();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.index(['is_active', 'name']);
  });
  await knex.schema.createTable('menu_items', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('category_id').unsigned().nullable();
    table.string('name', 180).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('description');
    table.string('image_url', 1000);
    table.decimal('price', 10, 2).notNullable().defaultTo(0);
    table.boolean('is_available').notNullable().defaultTo(true);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.foreign('category_id').references('id').inTable('menu_categories').onDelete('SET NULL');
    table.index(['category_id', 'is_active', 'is_available']);
  });
  await knex.schema.createTable('packages', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 180).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('description');
    table.string('image_url', 1000);
    table.decimal('price', 10, 2).notNullable().defaultTo(0);
    table.boolean('is_available').notNullable().defaultTo(true);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.index(['is_active', 'is_available']);
  });
  await knex.schema.createTable('package_villas', (table) => {
    table.bigInteger('package_id').unsigned().notNullable();
    table.bigInteger('villa_id').unsigned().notNullable();
    table.primary(['package_id', 'villa_id']);
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE');
    table.foreign('villa_id').references('id').inTable('villas').onDelete('CASCADE');
    table.index(['villa_id']);
  });
  await knex.schema.createTable('package_menu_items', (table) => {
    table.bigInteger('package_id').unsigned().notNullable();
    table.bigInteger('menu_item_id').unsigned().notNullable();
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.primary(['package_id', 'menu_item_id']);
    table.foreign('package_id').references('id').inTable('packages').onDelete('CASCADE');
    table.foreign('menu_item_id').references('id').inTable('menu_items').onDelete('CASCADE');
    table.index(['menu_item_id']);
  });
};
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('package_menu_items');
  await knex.schema.dropTableIfExists('package_villas');
  await knex.schema.dropTableIfExists('packages');
  await knex.schema.dropTableIfExists('menu_items');
  await knex.schema.dropTableIfExists('menu_categories');
};