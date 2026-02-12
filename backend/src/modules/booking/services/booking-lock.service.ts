import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class BookingLockService {
  private readonly logger = new Logger(BookingLockService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password', '') || undefined,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 1000, 30000),
    });
  }

  async acquire(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.redis.set(
      `lock:${key}`,
      Date.now().toString(),
      'PX',
      ttlMs,
      'NX',
    );
    const acquired = result === 'OK';

    if (acquired) {
      this.logger.debug(`Lock acquired: ${key}`);
    } else {
      this.logger.debug(`Lock denied: ${key}`);
    }

    return acquired;
  }

  async release(key: string): Promise<void> {
    await this.redis.del(`lock:${key}`);
    this.logger.debug(`Lock released: ${key}`);
  }
}
