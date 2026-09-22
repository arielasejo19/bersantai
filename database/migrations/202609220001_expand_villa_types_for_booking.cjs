exports.up = async function up(knex) {
  await knex.schema.alterTable('villa_types', (table) => {
    table.decimal('nightly_price', 10, 2).notNullable().defaultTo(0).after('default_image_url');
    table.integer('capacity').unsigned().notNullable().defaultTo(2).after('nightly_price');
    table.integer('bedroom_count').unsigned().notNullable().defaultTo(1).after('capacity');
    table.string('status', 50).notNullable().defaultTo('active').after('bedroom_count');
    table.string('availability_status', 50).notNullable().defaultTo('available').after('status');
    table.text('amenities_json').nullable().after('availability_status');
    table.text('gallery_urls_json').nullable().after('amenities_json');
    table.index(['status', 'availability_status']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villa_types', (table) => {
    table.dropIndex(['status', 'availability_status']);
    table.dropColumn('gallery_urls_json');
    table.dropColumn('amenities_json');
    table.dropColumn('availability_status');
    table.dropColumn('status');
    table.dropColumn('bedroom_count');
    table.dropColumn('capacity');
    table.dropColumn('nightly_price');
  });
};
