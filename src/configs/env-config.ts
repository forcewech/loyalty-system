import { config } from 'dotenv';

config();

export const application = {
  environment: process.env.ENVIRONMENT || 'local',
  urlPrefix: process.env.URL_PREFIX || '/api',
  serverPort: +process.env.SERVER_PORT || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000/'
};

export const postgresql = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'anhyeuem',
  database: process.env.POSTGRES_DATABASE || 'final-project'
};

export const token = {
  expireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME || '30d',
  secretKey: process.env.ACCESS_TOKEN_SECRET_KEY || '5239955f-4e01-4873-aca9-5183816ae4a9',
  rfExpireTime: process.env.REFRESH_TOKEN_EXPIRE_TIME || '90d',
  rfSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY || 'f23e4ace-dd6b-419f-8e29-2419504e14c5'
};

export const redis = {
  host: process.env.REDIS_HOST || 'redis-16228.c299.asia-northeast1-1.gce.cloud.redislabs.com',
  port: +process.env.REDIS_PORT || 16228,
  password: process.env.REDIS_PASSWORD || 'hvs2GvCEZHKKP7daZMsBtz09WEwKainm'
};

export const emailSender = {
  email: process.env.MAIL_USER || 'dungnttn02@gmail.com',
  password: process.env.MAIL_PASSWORD || 'mvfx zqqi ajkc tpwv',
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  from: process.env.MAIL_HOST || 'dungnttn02@gmail.com'
};

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUD_NAME || 'deajpt0zz',
  api_key: process.env.API_KEY || '587164376164896',
  api_secret: process.env.API_SECRET || 'EXxw1VN0vw4mFWAtig2FojqVnuQ'
};
