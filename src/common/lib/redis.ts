import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});

/**
 * Cache utility functions
 */
export const cacheSet = async (key: string, value: any, ttlSeconds: number = 3600) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheDelete = async (key: string) => {
  await redis.del(key);
};

export default redis;
