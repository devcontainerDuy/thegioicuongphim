import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Episode } from './episode.entity';
import { WatchHistory } from '@/watch-history/entities/watch-history.entity';
import { Favorite } from '@/favorites/entities/favorite.entity';
import { Rating } from '@/ratings/entities/rating.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { Watchlist } from '@/watchlist/entities/watchlist.entity';
import { ViewLog } from '@/view-logs/entities/view-log.entity';

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbUrl: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ nullable: true })
  quality: string; // "HD", "FHD", "CAM"

  @Column({ nullable: true })
  language: string; // "Vietsub", "Lồng Tiếng"

  @Column({ nullable: true })
  year: number;

  @Column({ default: 'series' })
  type: string; // "movie" | "series"

  @Column({ type: 'json', nullable: true })
  genres: string[];

  @Column({ type: 'json', nullable: true })
  countries: string[];

  @Column({ type: 'json', nullable: true })
  category: any;

  @Column({ default: 1 })
  totalEpisodes: number;

  @Column({ nullable: true })
  currentEpisode: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  director: string;

  @Column({ type: 'json', nullable: true })
  casts: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Episode, (episode) => episode.movie)
  episodes: Episode[];

  @OneToMany(() => WatchHistory, (watchHistory) => watchHistory.movie)
  watchHistory: WatchHistory[];

  @OneToMany(() => Favorite, (favorite) => favorite.movie)
  favorites: Favorite[];

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];

  @OneToMany(() => Comment, (comment) => comment.movie)
  comments: Comment[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.movie)
  watchlists: Watchlist[];

  @OneToMany(() => ViewLog, (viewLog) => viewLog.movie)
  viewLogs: ViewLog[];
}
