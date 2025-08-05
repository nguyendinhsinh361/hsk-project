import appConfig from '../environments/app.config';
import chatGPTConfig from '../environments/chatGPT.config';
import jwtConfig from '../environments/jwt.config';
import mongooseConfig from '../environments/mongoose.config';
import mysqlConfig from '../environments/mysql.config';
import rabitmqConfig from '../environments/rabitmq.config';
import redisConfig from '../environments/redis.config';

export const ConfigGlobal = {
  isGlobal: true,
  load: [
    jwtConfig,
    redisConfig,
    appConfig,
    rabitmqConfig,
    mongooseConfig,
    mysqlConfig,
    chatGPTConfig
  ],
  validationOptions: {},
  envFilePath: '.env',
};
