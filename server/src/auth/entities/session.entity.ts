import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { PersonalAccessToken } from './personal-access-token.entity';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tokenId: number;

  @ManyToOne(() => PersonalAccessToken, (token) => token.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tokenId' })
  token: PersonalAccessToken;

  @Column({ nullable: true, length: 45 })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
