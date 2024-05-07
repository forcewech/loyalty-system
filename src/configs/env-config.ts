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
