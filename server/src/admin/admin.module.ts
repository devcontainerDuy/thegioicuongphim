import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Movie } from '../movies/entities/movie.entity';
import { User } from '../users/entities/user.entity';
import { ViewLog } from '../view-logs/entities/view-log.entity';
import { Episode } from '../movies/entities/episode.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { Rating } from '../ratings/entities/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      User,
      ViewLog,
      Episode,
      Role,
      Permission,
      Rating,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
