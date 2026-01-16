import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Movie } from '@/movies/entities/movie.entity';

@Entity('view_log')
@Index(['movieId', 'date'], { unique: true })
export class ViewLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.viewLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ type: 'date' })
  date: Date;
  // Actually, typeorm 'date' column maps to string in JS usually.

  @Column({ default: 1 })
  views: number;
}
