import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '@/roles/entities/role.entity'; // Will be created later
import { WatchHistory } from '@/watch-history/entities/watch-history.entity';
import { Favorite } from '@/favorites/entities/favorite.entity';
import { Rating } from '@/ratings/entities/rating.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { PersonalAccessToken } from '@/auth/entities/personal-access-token.entity';
import { Session } from '@/auth/entities/session.entity';
import { Watchlist } from '@/watchlist/entities/watchlist.entity';
import { Notification } from '@/notifications/entities/notification.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isRoot: boolean;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  rememberToken: string | null;

  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WatchHistory, (watchHistory) => watchHistory.user)
  watchHistory: WatchHistory[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => PersonalAccessToken, (token) => token.user)
  tokens: PersonalAccessToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlist: Watchlist[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
