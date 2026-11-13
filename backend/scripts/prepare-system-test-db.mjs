import { createRequire } from 'node:module';
import path from 'node:path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import knexFactory from 'knex';

const backendRoot = path.resolve(new URL('.', import.meta.url).pathname, '..');
const projectRoot = path.resolve(backendRoot, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });
process.env.NODE_ENV = 'test';

const require = createRequire(import.meta.url);
const env = require('../config/env.cjs').env;
const knexConfig = require('../knexfile.cjs').test;

if (env.DB_NAME_TEST !== 'pawconnect_test') {
  throw new Error(`Refusing to reset non-dedicated database: ${env.DB_NAME_TEST}`);
}

const root = await mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
});

try {
  await root.query(`DROP DATABASE IF EXISTS \`${env.DB_NAME_TEST}\``);
  await root.query(`CREATE DATABASE \`${env.DB_NAME_TEST}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  const account = `${root.escape(env.DB_USER)}@'%'`;
  await root.query(`CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${root.escape(env.DB_PASSWORD)}`);
  await root.query(`GRANT ALL PRIVILEGES ON \`${env.DB_NAME_TEST}\`.* TO ${account}`);
} finally {
  await root.end();
}

const db = knexFactory(knexConfig);
try {
  await db.migrate.latest();
  await db.seed.run();
  const [userCount] = await db('users').count({ count: '*' });
  const [animalCount] = await db('animals').count({ count: '*' });
  console.log(JSON.stringify({ database: env.DB_NAME_TEST, users: Number(userCount.count), animals: Number(animalCount.count) }));
} finally {
  await db.destroy();
}
