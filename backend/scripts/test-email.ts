import { env } from '../src/config/env.ts';
import { sendEmailTest, verifyEmailTransport } from '../src/services/emailService.ts';

await verifyEmailTransport();
await sendEmailTest();
console.log(`Email test delivered to ${env.SUPPORT_EMAIL}.`);
