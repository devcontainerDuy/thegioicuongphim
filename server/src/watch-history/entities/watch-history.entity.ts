import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Movie } from '@/movies/entities/movie.entity';
import { Episode } from '@/movies/entities/episode.entity';

@Entity('watch_history')
@Index(['userId', 'movieId', 'episodeId'], { unique: true })
export class WatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.watchHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.watchHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ nullable: true })
  episodeId: number | null;

  @ManyToOne(() => Episode, (episode) => episode.watchHistory, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'episodeId' })
  episode: Episode;

  @Column({ default: 0 })
  progress: number; // 0-100 percentage

  @CreateDateColumn()
  watchedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
