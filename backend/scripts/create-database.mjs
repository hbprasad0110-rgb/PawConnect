import { createRequire } from 'node:module';
import mysql from 'mysql2/promise';

const require = createRequire(import.meta.url);
const { env } = require('../config/env.cjs');
const databaseName = env.NODE_ENV === 'test' ? env.DB_NAME_TEST : env.DB_NAME;

if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error(`Invalid database name: ${databaseName}`);
}

const connection = await mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD
});

await connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
);
console.log(`Database ready: ${databaseName}`);
await connection.end();
