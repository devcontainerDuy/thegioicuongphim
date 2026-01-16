import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Movie } from './movie.entity';
import { WatchHistory } from '../../watch-history/entities/watch-history.entity';

@Entity('episode')
@Index(['movieId', 'slug'], { unique: true })
export class Episode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.episodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column()
  name: string; // "Tập 1", "FULL"

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  embedUrl: string;

  @Column({ type: 'text', nullable: true })
  m3u8Url: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WatchHistory, (watchHistory) => watchHistory.episode)
  watchHistory: WatchHistory[];
}
