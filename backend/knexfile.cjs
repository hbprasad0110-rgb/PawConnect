const { env } = require('./config/env.cjs');

const shared = {
  client: 'mysql2',
  migrations: { directory: './database/migrations', extension: 'cjs' },
  seeds: { directory: './database/seeds', extension: 'cjs' },
  pool: { min: 0, max: 10 }
};

const connection = (database) => ({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database
});

module.exports = {
  development: {
    ...shared,
    connection: connection(env.DB_NAME)
  },
  test: {
    ...shared,
    connection: connection(env.DB_NAME_TEST)
  }
};
