exports.up = async function up(knex) {
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 64).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id', 'created_at']);
    table.index('expires_at');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('password_reset_tokens');
};
