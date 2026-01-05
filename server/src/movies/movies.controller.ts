import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Put } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import type { MovieSyncData } from './dto/sync-data.dto';

import { OptionalJwtAuthGuard } from '../auth/guards';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('genre') genre?: string,
        @Query('year') year?: string,
        @Query('country') country?: string
    ) {
        return this.moviesService.findAll(
            Number(page) || 1,
            Number(limit) || 24,
            { type, genre, year: year ? Number(year) : undefined, country }
        );
    }

    // List static routes before dynamic ones to avoid shadowing
    @UseGuards(AuthGuard('jwt'))
    @Get('watchlist')
    async getWatchlist(@Req() req: any) {
        const userId = req.user.id || req.user.userId;
        return this.moviesService.getWatchlist(userId);
    }

    @Get('search')
    search(
        @Query('keyword') keyword: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('genre') genre?: string,
        @Query('year') year?: string,
        @Query('country') country?: string
    ) {
        return this.moviesService.search(
            keyword,
            Number(page) || 1,
            Number(limit) || 10,
            { type, genre, year: year ? Number(year) : undefined, country }
        );
    }

    @Post('sync')
    async syncMovie(@Body() data: MovieSyncData) {
        const movieId = await this.moviesService.syncMovie(data.slug, data);
        return { movieId };
    }

    // ===== RATINGS & REVIEWS =====
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/rating')
    async getRating(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id || req.user?.userId;
        const movieId = await this.moviesService.resolveMovieId(id, false);
        return this.moviesService.getMovieRating(movieId as number, userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/reviews')
    async getReviews(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id || req.user?.userId;
        const movieId = await this.moviesService.resolveMovieId(id, false);
        return this.moviesService.getReviews(movieId as number, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('reviews/:id/vote')
    async voteReview(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id || req.user.userId;
        return this.moviesService.voteReview(userId, Number(id));
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/rating')
    async upsertRating(
        @Param('id') id: string,
        @Body('score') score: number,
        @Body('content') content: string,
        @Req() req: any
    ) {
        const movieId = await this.moviesService.resolveMovieId(id);
        const userId = req.user.id || req.user.userId;
        return this.moviesService.upsertRating(userId, movieId as number, score, content);
    }

    // ===== COMMENTS =====
    @Get(':id/comments')
    async getComments(@Param('id') id: string) {
        const movieId = await this.moviesService.resolveMovieId(id, false);
        return this.moviesService.getComments(movieId as number);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/comments')
    async createComment(
        @Param('id') id: string,
        @Body('content') content: string,
        @Body('parentId') parentId: number,
        @Req() req: any
    ) {
        const movieId = await this.moviesService.resolveMovieId(id);
        const userId = req.user.id || req.user.userId;
        return this.moviesService.createComment(userId, movieId as number, content, parentId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('comments/:id')
    updateComment(@Param('id') id: string, @Req() req: any, @Body('content') content: string) {
        const userId = req.user.id || req.user.userId;
        return this.moviesService.updateComment(userId, Number(id), content);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('comments/:id')
    deleteComment(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id || req.user.userId;
        return this.moviesService.deleteComment(userId, Number(id));
    }

    // ===== WATCHLIST ACTIONS =====
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/watchlist')
    async checkInWatchlist(@Param('id') id: string, @Req() req: any) {
        const movieId = await this.moviesService.resolveMovieId(id); // Throws if not found
        const userId = req.user.id || req.user.userId;
        return this.moviesService.checkInWatchlist(userId, movieId as number);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/watchlist')
    async toggleWatchlist(@Param('id') id: string, @Req() req: any) {
        const movieId = await this.moviesService.resolveMovieId(id);
        const userId = req.user.id || req.user.userId;
        return this.moviesService.toggleWatchlist(userId, movieId as number);
    }

    // ===== VIEW LOGGING =====
    @Post(':id/view')
    async logView(@Param('id') id: string, @Body() body: any) {
        const movieId = await this.moviesService.syncMovie(id, body);
        return this.moviesService.logView(movieId);
    }

    // ===== GENERIC SLUG ROUTE (Should be near bottom) =====
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.moviesService.findBySlug(slug);
    }

    // ===== ADMIN / CRUD =====
    @Post()
    // @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Add admin guard
    create(@Body() createMovieDto: CreateMovieDto) {
        return this.moviesService.create(createMovieDto);
    }

    @Patch(':slug')
    // @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Add admin guard
    update(@Param('slug') slug: string, @Body() updateMovieDto: UpdateMovieDto) {
        return this.moviesService.update(slug, updateMovieDto);
    }

    @Delete(':slug')
    // @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Add admin guard
    remove(@Param('slug') slug: string) {
        return this.moviesService.remove(slug);
    }
}
