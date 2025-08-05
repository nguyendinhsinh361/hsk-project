import { registerAs } from '@nestjs/config';

export default registerAs('rabitmq', () => ({
  rb_url: process.env.RABBITMQ_URL,
  auth_queue: process.env.RABBITMQ_AUTH_QUEUE,
  file_queue: process.env.RABBITMQ_FILE_QUEUE,
}));
