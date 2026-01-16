import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Episode } from './entities/episode.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { ReviewVote } from '../ratings/entities/review-vote.entity';
import { Comment } from '../comments/entities/comment.entity';
import { ViewLog } from '../view-logs/entities/view-log.entity';
import { Watchlist } from '../watchlist/entities/watchlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Episode,
      Rating,
      ReviewVote,
      Comment,
      ViewLog,
      Watchlist,
    ]),
    NotificationsModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
