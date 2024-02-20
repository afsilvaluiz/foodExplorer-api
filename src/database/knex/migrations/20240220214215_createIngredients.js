exports.up = (knex) => knex.schema.createTable('ingredients', (table) => {
  table.increments('id');
  table.text('name').notNullable();
  table.text('image').defaultTo(null);

  table.integer('meals_id').references('id').inTable('meals').onDelete('CASCADE');

  table.integer('created_by').references('id').inTable('users');

  table.timestamp('created_at').defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('ingredients');
