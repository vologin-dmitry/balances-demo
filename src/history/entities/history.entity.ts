import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HistoryAction } from '../enums/history-action.entity';

@Entity({ name: 'history' })
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.history, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: HistoryAction,
  })
  action: HistoryAction;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  ts: Date;
}
