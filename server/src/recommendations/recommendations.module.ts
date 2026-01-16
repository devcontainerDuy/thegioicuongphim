import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { Movie } from '../movies/entities/movie.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Rating, WatchHistory])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
