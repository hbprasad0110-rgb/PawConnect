exports.up = async function up(knex) {
  await knex.raw(`
    ALTER TABLE adoption_applications
    MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'withdrawn', 'completed')
    NOT NULL DEFAULT 'pending'
  `);
};

exports.down = async function down(knex) {
  await knex('adoption_applications').where({ status: 'withdrawn' }).update({ status: 'rejected' });
  await knex.raw(`
    ALTER TABLE adoption_applications
    MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed')
    NOT NULL DEFAULT 'pending'
  `);
};
