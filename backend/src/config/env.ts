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
  EMAIL_MODE: 'disabled' | 'log' | 'smtp';
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_APP_PASSWORD: string;
  EMAIL_FROM: string;
  SUPPORT_EMAIL: string;
};

const require = createRequire(import.meta.url);

export const env = require('../../config/env.cjs').env as Environment;
