import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { History } from '../history/entities/history.entity';
import { HistoryAction } from '../history/enums/history-action.entity';
import { CacheService } from '../cache/cache.service';

export const CACHE_KEYS = {
  USERS_ALL: 'users:all',
  USER_BY_ID: (id: string | number) => `user:${id}`,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async createUser(name: string, balance = 0) {
    const savedUser = await this.dataSource.manager.transaction(
      async (manager) => {
        const user = manager.create(User, {
          name,
          balance: balance.toFixed(2),
        });
        const saved = await manager.save(User, user);

        await manager.insert(History, {
          userId: saved.id,
          action: HistoryAction.DEPOSIT,
          amount: balance.toFixed(2),
        });

        return saved;
      },
    );

    const cacheKey = CACHE_KEYS.USER_BY_ID(savedUser.id);
    await this.cacheService.set(cacheKey, savedUser);

    return savedUser;
  }

  async getAllUsers() {
    const cacheKey = CACHE_KEYS.USERS_ALL;

    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const users = await this.userRepository.find();

    await this.cacheService.set(cacheKey, users);

    return users;
  }

  async getUser(id: number) {
    const cacheKey = CACHE_KEYS.USER_BY_ID(id);
    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheService.set(cacheKey, user);
    return user;
  }

  async deleteUser(userId: number) {
    return this.dataSource.manager
      .transaction(async (manager) => {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          throw new NotFoundException('User not found');
        }

        await manager.delete(History, { userId: userId });

        await manager.delete(User, { id: userId });

        return { success: true, deletedUserId: userId };
      })
      .then(async (result) => {
        await this.cacheService.delete(
          CACHE_KEYS.USER_BY_ID(result.deletedUserId),
        );
        await this.cacheService.delete(CACHE_KEYS.USERS_ALL);
        return result;
      });
  }

  async processAction(userId: number, amount: number, action: HistoryAction) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const result = await this.dataSource.manager.transaction(
      async (manager) => {
        const userRow = await manager
          .createQueryBuilder(User, 'u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: userId })
          .getOne();

        if (!userRow) {
          throw new NotFoundException('User not found');
        }

        const changeAmount = (
          action === HistoryAction.DEPOSIT ? amount : -amount
        ).toFixed(2);

        await manager.insert(History, {
          userId: userId,
          action,
          amount: changeAmount,
        });

        const raw: { sum: string }[] = await manager.query(
          'SELECT COALESCE(SUM(amount)::numeric(18,2), 0) as sum FROM history WHERE "userId" = $1',
          [userId],
        );
        const sum = raw[0]?.sum ?? '0.00';

        await manager.update(User, { id: userId }, { balance: sum });

        return { userId, newBalance: sum };
      },
    );

    await this.cacheService.delete(CACHE_KEYS.USERS_ALL);
    await this.cacheService.set(CACHE_KEYS.USER_BY_ID(userId), result);

    return result;
  }
}
