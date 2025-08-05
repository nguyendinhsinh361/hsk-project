import { registerAs } from '@nestjs/config';

export default registerAs('auth2', () => ({
  client_id_facebook: process.env.CLIENT_ID_FACEBOOK,
  client_secret_facebook: +process.env.CLIENT_SECRET_FACEBOOK,
  client_id_google: process.env.CLIENT_ID_GOOGLE,
  client_secret_google: +process.env.CLIENT_SECRET_GOOGLE,
}));
