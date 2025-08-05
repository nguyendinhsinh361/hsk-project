import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit{
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
  
  async onModuleInit(): Promise<void> {
    try {
      console.log('Resetting Redis...');
      await this.redisClient.flushdb(); // Clears all data in the Redis database
      console.log('Redis reset successfully!');
    } catch (error) {
      console.error('Failed to reset Redis:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
