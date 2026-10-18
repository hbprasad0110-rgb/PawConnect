exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('first_name', 80).notNullable();
    table.string('last_name', 80).notNullable();
    table.string('email', 160).notNullable().unique();
    table.string('phone', 30).notNullable();
    table.string('address', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['adopter', 'admin']).notNullable().defaultTo('adopter');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('animals', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 80).notNullable();
    table.enum('type', ['dog', 'cat']).notNullable();
    table.string('breed', 100).notNullable();
    table.integer('age_months').unsigned().notNullable();
    table.enum('gender', ['male', 'female']).notNullable();
    table.text('description').notNullable();
    table.string('photo_url', 500).nullable();
    table.string('weight', 40).nullable();
    table.string('color', 80).nullable();
    table.boolean('vaccinated').notNullable().defaultTo(false);
    table.boolean('neutered').notNullable().defaultTo(false);
    table.boolean('microchipped').notNullable().defaultTo(false);
    table.text('health_summary').nullable();
    table.date('arrival_date').nullable();
    table.string('intake_reason', 255).nullable();
    table.enum('status', ['available', 'application_pending', 'approved', 'fostered', 'adopted']).notNullable().defaultTo('available');
    table.timestamps(true, true);
    table.index(['type', 'status']);
    table.index('name');
  });

  await knex.schema.createTable('medical_records', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('animal_id').unsigned().notNullable().references('id').inTable('animals').onDelete('CASCADE');
    table.string('record_type', 100).notNullable();
    table.text('description').notNullable();
    table.date('administered_on').notNullable();
    table.string('vet_name', 120).nullable();
    table.text('notes').nullable();
    table.bigInteger('created_by').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('adoption_applications', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users');
    table.bigInteger('animal_id').unsigned().notNullable().references('id').inTable('animals');
    table.enum('status', ['pending', 'approved', 'rejected', 'completed']).notNullable().defaultTo('pending');
    table.text('reason').notNullable();
    table.text('experience').notNullable();
    table.string('living_arrangement', 255).notNullable();
    table.boolean('has_yard').notNullable().defaultTo(false);
    table.boolean('has_other_pets').notNullable().defaultTo(false);
    table.text('other_pets_description').nullable();
    table.string('employment_status', 120).notNullable();
    table.text('references_text').notNullable();
    table.text('decision_note').nullable();
    table.bigInteger('decided_by').unsigned().nullable().references('id').inTable('users');
    table.timestamp('decided_at').nullable();
    table.timestamps(true, true);
    table.index(['user_id', 'animal_id']);
    table.index(['animal_id', 'status']);
  });

  await knex.schema.createTable('appointments', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('application_id').unsigned().notNullable().references('id').inTable('adoption_applications');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users');
    table.bigInteger('animal_id').unsigned().notNullable().references('id').inTable('animals');
    table.dateTime('starts_at').notNullable();
    table.enum('status', ['requested', 'confirmed', 'completed', 'cancelled']).notNullable().defaultTo('requested');
    table.text('notes').nullable();
    table.specificType('is_active', "TINYINT GENERATED ALWAYS AS (CASE WHEN status IN ('requested','confirmed') THEN 1 ELSE NULL END) STORED");
    table.timestamps(true, true);
    table.unique(['animal_id', 'starts_at', 'is_active'], { indexName: 'appointments_unique_active_slot' });
  });

  await knex.schema.createTable('adoptions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('application_id').unsigned().notNullable().unique().references('id').inTable('adoption_applications');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users');
    table.bigInteger('animal_id').unsigned().notNullable().unique().references('id').inTable('animals');
    table.date('adopted_on').notNullable();
    table.text('notes').nullable();
    table.bigInteger('completed_by').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('animal_status_history', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('animal_id').unsigned().notNullable().references('id').inTable('animals').onDelete('CASCADE');
    table.enum('from_status', ['available', 'application_pending', 'approved', 'fostered', 'adopted']).notNullable();
    table.enum('to_status', ['available', 'application_pending', 'approved', 'fostered', 'adopted']).notNullable();
    table.string('event', 80).notNullable();
    table.bigInteger('actor_user_id').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['animal_id', 'created_at']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('animal_status_history');
  await knex.schema.dropTableIfExists('adoptions');
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('adoption_applications');
  await knex.schema.dropTableIfExists('medical_records');
  await knex.schema.dropTableIfExists('animals');
  await knex.schema.dropTableIfExists('users');
};
