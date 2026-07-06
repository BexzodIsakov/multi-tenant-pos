import { createClient } from 'redis';

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.error('Redis client error', err));

export async function connectRedis(): Promise<void> {
  await redisClient.connect();
  console.log('Redis connected');
}
