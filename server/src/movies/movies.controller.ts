import { Controller, Get, Post, Put, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string
    ) {
        return this.moviesService.findAll(
            Number(page) || 1,
            Number(limit) || 24,
            type
        );
    }

    @Get('search')
    search(
        @Query('keyword') keyword: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.moviesService.search(
            keyword,
            Number(page) || 1,
            Number(limit) || 10
        );
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.moviesService.findBySlug(slug);
    }

    // ===== RATINGS =====
    @Get(':id/rating')
    getRating(@Param('id') id: string, @Req() req: any) {
        // Optional userId from token if exists
        const userId = req.user?.userId;
        return this.moviesService.getMovieRating(Number(id), userId);
    }

    @Post(':id/rating')
    @UseGuards(AuthGuard('jwt'))
    upsertRating(@Param('id') id: string, @Req() req: any, @Body('score') score: number) {
        return this.moviesService.upsertRating(req.user.userId, Number(id), score);
    }

    // ===== COMMENTS =====
    @Get(':id/comments')
    getComments(@Param('id') id: string) {
        return this.moviesService.getComments(Number(id));
    }

    @Post(':id/comments')
    @UseGuards(AuthGuard('jwt'))
    createComment(@Param('id') id: string, @Req() req: any, @Body('content') content: string) {
        return this.moviesService.createComment(req.user.userId, Number(id), content);
    }

    @Put('comments/:id')
    @UseGuards(AuthGuard('jwt'))
    updateComment(@Param('id') id: string, @Req() req: any, @Body('content') content: string) {
        return this.moviesService.updateComment(req.user.userId, Number(id), content);
    }

    @Delete('comments/:id')
    @UseGuards(AuthGuard('jwt'))
    deleteComment(@Param('id') id: string, @Req() req: any) {
        return this.moviesService.deleteComment(req.user.userId, Number(id));
    }

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
