import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { History } from './entities/history.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([History]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
