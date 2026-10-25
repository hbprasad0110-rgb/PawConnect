const path = require('node:path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive(),
  CLIENT_ORIGIN: z.string().url(),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.literal('pawconnect'),
  DB_NAME_TEST: z.literal('pawconnect_test'),
  JWT_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  DEMO_ADOPTER_EMAIL: z.string().email(),
  DEMO_ADOPTER_PASSWORD: z.string().min(8),
  EMAIL_MODE: z.enum(['disabled', 'log', 'smtp']).default('disabled'),
  SMTP_HOST: z.string().min(1).default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  SMTP_USER: z.union([z.string().email(), z.literal('')]).default(''),
  SMTP_APP_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().min(1).default('PawConnect Support <supportpawconnect@gmail.com>'),
  SUPPORT_EMAIL: z.string().email().default('supportpawconnect@gmail.com'),
}).superRefine((value, context) => {
  if (value.EMAIL_MODE === 'smtp' && (!value.SMTP_USER || !value.SMTP_APP_PASSWORD)) {
    context.addIssue({
      code: 'custom',
      path: ['SMTP_APP_PASSWORD'],
      message: 'SMTP_USER and SMTP_APP_PASSWORD are required when EMAIL_MODE is smtp.',
    });
  }
});

const env = schema.parse(process.env);

module.exports = { env };
