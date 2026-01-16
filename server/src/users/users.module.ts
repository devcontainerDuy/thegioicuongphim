import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MoviesModule } from '../movies/movies.module';
import { User } from './entities/user.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Episode } from '../movies/entities/episode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WatchHistory, Favorite, Episode]),
    MoviesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
