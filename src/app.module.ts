import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CacheModule } from './cache/cache.module';
import { HistoryModule } from './history/history.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseType } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const entities = configService
          .get<string>('TYPEORM_ENTITIES')
          ?.split(',')
          ?.map((e) => e.trim());

        const migrations = configService
          .get<string>('TYPEORM_MIGRATIONS')
          ?.split(',')
          ?.map((e) => e.trim());

        return {
          type:
            configService.get<DatabaseType>('TYPEORM_CONNECTION') ||
            ('postgres' as DatabaseType),
          host: configService.get<string>('TYPEORM_HOST') || 'localhost',
          port: Number(configService.get<number>('TYPEORM_PORT') || 5432),
          username: configService.get<string>('TYPEORM_USERNAME') || 'postgres',
          password: configService.get<string>('TYPEORM_PASSWORD') || 'postgres',
          database: configService.get<string>('TYPEORM_DATABASE') || 'postgres',
          synchronize: configService.get('TYPEORM_SYNCHRONIZE') === 'true',
          logging: configService.get('TYPEORM_LOGGING') === 'true',
          entities: entities ? entities : ['dist/**/*.entity.js'],
          migrations: migrations ? migrations : ['dist/migrations/*.js'],
        } as TypeOrmModuleOptions;
      },
    }),
    CacheModule,
    HistoryModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
