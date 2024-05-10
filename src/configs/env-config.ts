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
