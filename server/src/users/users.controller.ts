import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { UsersService } from './users.service';
import { MovieSyncData, EpisodeSyncData } from '@/movies/dto/sync-data.dto';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @Post('profile')
  updateProfile(
    @Req() req: RequestWithUser,
    @Body() data: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Post('password')
  changePassword(
    @Req() req: RequestWithUser,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(req.user.id, data);
  }

  // ===== WATCH HISTORY =====
  @Get('history')
  getWatchHistory(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getWatchHistory(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post('history')
  saveWatchProgress(
    @Req() req: RequestWithUser,
    @Body()
    data: {
      movieId: number | string;
      episodeId?: number | string;
      progress?: number;
      movieData?: MovieSyncData;
      episodeData?: EpisodeSyncData;
    },
  ) {
    return this.usersService.saveWatchProgress(
      req.user.id,
      data.movieId,
      data.episodeId,
      data.progress || 0,
      data.movieData,
      data.episodeData,
    );
  }

  // ===== FAVORITES =====
  @Get('favorites')
  getFavorites(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getFavorites(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('favorites/:movieId')
  isFavorite(@Req() req: RequestWithUser, @Param('movieId') movieId: string) {
    return this.usersService.isFavorite(req.user.id, movieId);
  }

  @Post('favorites/:movieId')
  addFavorite(
    @Req() req: RequestWithUser,
    @Param('movieId') movieId: string,
    @Body() body?: { movieData?: any },
  ) {
    return this.usersService.addFavorite(req.user.id, movieId, body?.movieData);
  }

  @Delete('favorites/:movieId')
  removeFavorite(
    @Req() req: RequestWithUser,
    @Param('movieId') movieId: string,
  ) {
    return this.usersService.removeFavorite(req.user.id, movieId);
  }
}
