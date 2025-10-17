import { Module } from '@nestjs/common';
import { CacheService, RedisClientProvider } from './cache.service';
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      inject: [ConfigService],
      provide: RedisClientProvider,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: Number(configService.get<number>('REDIS_PORT') || 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        });
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
