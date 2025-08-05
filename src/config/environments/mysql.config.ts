import { registerAs } from '@nestjs/config';
export default registerAs('mysql', () => ({
  host: process.env.MYSQL_HOST,
  port: +parseInt(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  chatgpt_host: process.env.CHATGPT_HOST,
  chatgpt_port: +parseInt(process.env.CHATGPT_PORT),
  chatgpt_username: process.env.CHATGPT_USER,
  chatgpt_password: process.env.CHATGPT_PASSWORD,
  chatgpt_database: process.env.CHATGPT_DATABASE,
}));
