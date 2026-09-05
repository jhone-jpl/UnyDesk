import { Redis } from 'ioredis';
import { config } from '../config.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
});

export async function ensureRedis() {
  try {
    if (redis.status === 'wait' || redis.status === 'end') {
      await redis.connect();
    }
  } catch {
    // Redis optional for MVP; heartbeat still works via Postgres
  }
}
