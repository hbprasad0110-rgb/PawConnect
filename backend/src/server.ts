import { app } from './app.ts';
import { appConfig } from './config/constants.ts';
import { env } from './config/env.ts';
import { db } from './db/connection.ts';

async function start() {
  await db.raw('SELECT 1');
  app.listen(env.PORT, () => {
    console.log(`${appConfig.name} API listening at http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error(`${appConfig.name} API failed to start. Check the MySQL service and root .env settings.`);
  console.error(error);
  process.exit(1);
});
