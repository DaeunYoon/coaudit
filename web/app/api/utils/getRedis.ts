import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.REDIS_URL;
const REDIS_TOKEN = process.env.REDIS_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN) {
  throw new Error('REDIS_URL and REDIS_TOKEN must be set');
}

let redis: Redis;

export default function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    });
  }
  return redis;
}
