import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { History } from '../../history/entities/history.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balance: string;

  @OneToMany(() => History, (h) => h.user)
  history: History[];
}
