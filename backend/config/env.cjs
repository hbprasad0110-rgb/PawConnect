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
});

const env = schema.parse(process.env);

module.exports = { env };
