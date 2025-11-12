import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache, Milliseconds } from 'cache-manager';
import { ConnectionData } from '../chat/enums/caches.enum';

@Injectable()
export class RedisService {
  private logger = new Logger(RedisService.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCacheData(key: string, data: string | Object, ttl?: Milliseconds) {
    this.logger.log('Creating Redis Data');
    return await this.cacheManager.set(key, data, ttl);
  }

  async getCachedData(key: string): Promise<string> {
    this.logger.log('Getting Redis Data');
    return await this.cacheManager.get(key);
  }
}
