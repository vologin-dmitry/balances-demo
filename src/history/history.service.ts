import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoryQueryDto } from './dto/history-query.dto';
import { History } from './entities/history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History) private historyRepository: Repository<History>,
    @InjectRepository(History) private userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}
  async getHistory(query?: HistoryQueryDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const userId = query?.userId;

    const cacheKey = `history:${userId ?? 'all'}:${page}:${limit}:${query?.action ?? ''}:${query?.from ?? ''}:${query?.to ?? ''}`;

    const cached = await this.cacheService.get<History>(cacheKey);
    if (cached) {
      return cached;
    }

    const qb = this.historyRepository
      .createQueryBuilder('h')
      .orderBy('h.ts', 'DESC');

    if (query?.userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      qb.andWhere('h.userId = :userId', { userId });
    }

    if (query?.action) {
      qb.andWhere('h.action = :action', { action: query.action });
    }
    if (query?.from) {
      qb.andWhere('h.ts >= :from', { from: query.from });
    }
    if (query?.to) {
      qb.andWhere('h.ts <= :to', { to: query.to });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const result = {
      data: items,
      additionalInfo: {
        total,
        page,
        limit,
      },
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }
}
