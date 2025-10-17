import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const TTL_BASE = 5; // seconds
export const RedisClientProvider = Symbol('RedisClientProvider');

@Injectable()
export class CacheService {
  constructor(@Inject(RedisClientProvider) private readonly client: Redis) {}

  async set(key: string, value: any, seconds?: number): Promise<void> {
    try {
      const ttlSeconds = seconds ? seconds : TTL_BASE;
      const data = JSON.stringify(value);
      await this.client.set(key, data, 'EX', ttlSeconds);
    } catch (e) {
      throw new Error(`Error while trying to save cache: ${e}`);
    }

  }

  async get<T>(key: string): Promise<T | T[] | null> {
    const data = await this.client.get(key);
    if (!data) return null;

    try {
      const parsed: unknown = JSON.parse(data);

      if (Array.isArray(parsed)) {
        return parsed as T[];
      }

      return parsed as T;
    } catch (err) {
      throw new Error(`Error while parsing key ${key}:`, err);
    }
  }

  getByPattern(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  delete(...keys: string[]): Promise<number> {
    return this.client.del(keys);
  }
}
