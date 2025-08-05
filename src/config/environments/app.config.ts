import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  project_name: process.env.PROJECT_NAME,
  domain: process.env.DOMAIN,
  googlePlayPublicKey: process.env.GOOGLE_PLAY_PUBLIC_KEY,
  appStorePass: process.env.APP_STORE_PASS,
  supportAdminKey: process.env.SUPPORT_ADMIN_KEY,
  hsk_jwt_token_secret: process.env.HSK_TOKEN_SECRET,
  hsk_jwt_token_expried: process.env.HSK_TOKEN_EXPRIED,
  banking_key_active: process.env.BANKING_KEY_ACTIVE,
}));
