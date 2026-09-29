import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const envConfig = {
  baseUrl: process.env.BASE_URL!,
  env: process.env.ENV!,
  isHeadless: process.env.HEADLESS !== 'false',
  isDebug: process.env.DEBUG === 'true',
  testUserEmail: process.env.TEST_USER_EMAIL!,
  testUserPassword: process.env.TEST_USER_PASSWORD!,
};
