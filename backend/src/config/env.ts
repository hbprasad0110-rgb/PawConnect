import { createRequire } from 'node:module';

type Environment = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  CLIENT_ORIGIN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: 'pawconnect';
  DB_NAME_TEST: 'pawconnect_test';
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  DEMO_ADOPTER_EMAIL: string;
  DEMO_ADOPTER_PASSWORD: string;
};

const require = createRequire(import.meta.url);

export const env = require('../../config/env.cjs').env as Environment;
