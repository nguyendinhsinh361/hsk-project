import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri_mongodb: process.env.URL_MONGODB,
}));
