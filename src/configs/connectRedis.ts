import { createClient } from 'redis';
import { redis } from './env-config';

export const client = createClient({
  password: redis.password,
  socket: {
    host: redis.host,
    port: redis.port
  }
});

export const connectRedis = async (): Promise<void> => {
  await client.connect();
};
