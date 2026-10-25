import knex, { type Knex } from 'knex';
import { appConfig } from '../config/constants.ts';
import { env } from '../config/env.ts';

const database = env.NODE_ENV === 'test' ? env.DB_NAME_TEST : env.DB_NAME;

export const db: Knex = knex({
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    timezone: 'Z'
  },
  pool: { min: appConfig.database.poolMin, max: appConfig.database.poolMax }
});
