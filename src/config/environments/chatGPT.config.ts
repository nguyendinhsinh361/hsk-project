import { registerAs } from '@nestjs/config';

export default registerAs('chatGPT', () => ({
  key: process.env.CHATGPT_KEY,
  project_key: process.env.PROJECT_KEY,
}));
