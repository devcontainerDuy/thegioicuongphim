import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Movie } from '@/movies/entities/movie.entity';

@Entity('watchlist')
@Index(['userId', 'movieId'], { unique: true })
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.watchlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.watchlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @CreateDateColumn()
  createdAt: Date;
}
