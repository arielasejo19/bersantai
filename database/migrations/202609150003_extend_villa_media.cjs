exports.up = async function up(knex) {
  await knex.schema.alterTable('villa_photos', (table) => {
    table.string('media_type', 30).notNullable().defaultTo('image').after('url');
    table.boolean('is_thumbnail').notNullable().defaultTo(false).after('alt_text');
    table.index(['villa_id', 'is_thumbnail']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('villa_photos', (table) => {
    table.dropIndex(['villa_id', 'is_thumbnail']);
    table.dropColumn('is_thumbnail');
    table.dropColumn('media_type');
  });
};