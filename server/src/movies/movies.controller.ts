import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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
