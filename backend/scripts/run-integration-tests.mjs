import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import knexFactory from 'knex';
import mysql from 'mysql2/promise';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');
const projectRoot = path.resolve(backendRoot, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });
process.env.NODE_ENV = 'test';

const require = createRequire(import.meta.url);
const knexConfig = require('../knexfile.cjs').test;
const databaseName = process.env.DB_NAME_TEST;
if (databaseName !== 'pawconnect_test') throw new Error('Integration tests may only recreate pawconnect_test.');

let root;
try {
  root = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
  });
} catch (error) {
  throw new Error(`Cannot connect to MySQL on ${process.env.DB_HOST}:${process.env.DB_PORT}. Start Docker Desktop and run npm run db:up before integration tests.`, { cause: error });
}

try {
  await root.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
  await root.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  const account = `${root.escape(process.env.DB_USER)}@'%'`;
  await root.query(`CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${root.escape(process.env.DB_PASSWORD)}`);
  await root.query(`GRANT ALL PRIVILEGES ON \`${databaseName}\`.* TO ${account}`);
} finally {
  await root.end();
}

const testDb = knexFactory(knexConfig);
try {
  await testDb.migrate.latest();
  await testDb.seed.run();
} finally {
  await testDb.destroy();
}

const child = spawn(process.execPath, ['--import', 'tsx', '--test', 'tests/api.integration.test.ts'], {
  cwd: backendRoot,
  env: { ...process.env, NODE_ENV: 'test', EMAIL_MODE: 'log' },
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
