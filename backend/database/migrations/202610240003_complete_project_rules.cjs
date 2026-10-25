exports.up = async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.specificType('admin_guard', "TINYINT GENERATED ALWAYS AS (CASE WHEN role = 'admin' THEN 1 ELSE NULL END) STORED");
    table.unique(['admin_guard'], { indexName: 'users_single_admin' });
  });

  await knex.schema.alterTable('appointments', (table) => {
    table.string('purpose', 160).notNullable().defaultTo('Meet and greet');
    table.unique(['user_id', 'starts_at', 'is_active'], { indexName: 'appointments_unique_active_user_slot' });
  });

  await knex.schema.alterTable('medical_records', (table) => {
    table.string('vaccination', 160).nullable();
    table.string('health_status', 160).nullable();
    table.text('treatment').nullable();
  });

  await knex.schema.alterTable('animal_status_history', (table) => {
    table.text('notes').nullable();
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable('animal_status_history', (table) => {
    table.dropColumn('notes');
  });

  await knex.schema.alterTable('medical_records', (table) => {
    table.dropColumn('treatment');
    table.dropColumn('health_status');
    table.dropColumn('vaccination');
  });

  await knex.schema.alterTable('appointments', (table) => {
    table.dropUnique(['user_id', 'starts_at', 'is_active'], 'appointments_unique_active_user_slot');
    table.dropColumn('purpose');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['admin_guard'], 'users_single_admin');
    table.dropColumn('admin_guard');
  });
};
