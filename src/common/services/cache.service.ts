import { createClient } from 'redis';

class CacheService {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.log('Redis Client Error', err));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async get(key: string) {
    await this.connect();
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600) {
    await this.connect();
    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds
    });
  }

  async del(key: string) {
    await this.connect();
    await this.client.del(key);
  }
}

export const cacheService = new CacheService();
