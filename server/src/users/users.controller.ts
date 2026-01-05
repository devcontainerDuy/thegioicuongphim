import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from './users.service';

// Define the shape of our JWT user payload
interface JwtUser {
    userId: number;
    email: string;
    role: string;
}

interface AuthenticatedRequest extends Request {
    user: JwtUser;
}

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    getProfile(@Req() req: AuthenticatedRequest) {
        return this.usersService.getProfile(req.user.userId);
    }

    @Post('profile')
    updateProfile(@Req() req: AuthenticatedRequest, @Body() data: { name?: string; avatar?: string }) {
        return this.usersService.updateProfile(req.user.userId, data);
    }

    @Post('password')
    changePassword(@Req() req: AuthenticatedRequest, @Body() data: { currentPassword: string; newPassword: string }) {
        return this.usersService.changePassword(req.user.userId, data);
    }

    // ===== WATCH HISTORY =====
    @Get('history')
    getWatchHistory(
        @Req() req: AuthenticatedRequest,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.usersService.getWatchHistory(
            req.user.userId,
            Number(page) || 1,
            Number(limit) || 20
        );
    }

    @Post('history')
    saveWatchProgress(
        @Req() req: AuthenticatedRequest,
        @Body() data: {
            movieId: number | string;
            episodeId?: number | string;
            progress?: number;
            movieData?: any;
            episodeData?: any;
        }
    ) {
        return this.usersService.saveWatchProgress(
            req.user.userId,
            data.movieId,
            data.episodeId,
            data.progress || 0,
            data.movieData,
            data.episodeData
        );
    }

    // ===== FAVORITES =====
    @Get('favorites')
    getFavorites(
        @Req() req: AuthenticatedRequest,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.usersService.getFavorites(
            req.user.userId,
            Number(page) || 1,
            Number(limit) || 20
        );
    }

    @Get('favorites/:movieId')
    isFavorite(@Req() req: AuthenticatedRequest, @Param('movieId') movieId: string) {
        return this.usersService.isFavorite(req.user.userId, movieId);
    }

    @Post('favorites/:movieId')
    addFavorite(@Req() req: AuthenticatedRequest, @Param('movieId') movieId: string, @Body() body?: any) {
        return this.usersService.addFavorite(req.user.userId, movieId, body);
    }

    @Delete('favorites/:movieId')
    removeFavorite(@Req() req: AuthenticatedRequest, @Param('movieId') movieId: string) {
        return this.usersService.removeFavorite(req.user.userId, movieId);
    }
}
