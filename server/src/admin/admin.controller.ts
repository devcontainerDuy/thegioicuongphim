import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Dashboard
    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboardStats();
    }

    // Movies
    @Get('movies')
    getMovies(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string
    ) {
        return this.adminService.getMovies(Number(page) || 1, Number(limit) || 20, search);
    }

    @Get('movies/:id')
    getMovie(@Param('id') id: string) {
        return this.adminService.getMovieById(Number(id));
    }

    @Post('movies')
    createMovie(@Body() data: any) {
        return this.adminService.createMovie(data);
    }

    @Put('movies/:id')
    updateMovie(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateMovie(Number(id), data);
    }

    @Delete('movies/:id')
    deleteMovie(@Param('id') id: string) {
        return this.adminService.deleteMovie(Number(id));
    }

    // Users
    @Get('users')
    getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string
    ) {
        return this.adminService.getUsers(Number(page) || 1, Number(limit) || 20, search);
    }

    @Put('users/:id/role')
    updateUserRole(@Param('id') id: string, @Body('role') role: string) {
        return this.adminService.updateUserRole(Number(id), role);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(Number(id));
    }

    // Episodes
    @Post('movies/:movieId/episodes')
    createEpisode(@Param('movieId') movieId: string, @Body() data: any) {
        return this.adminService.createEpisode(Number(movieId), data);
    }

    @Put('episodes/:id')
    updateEpisode(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateEpisode(Number(id), data);
    }

    @Delete('episodes/:id')
    deleteEpisode(@Param('id') id: string) {
        return this.adminService.deleteEpisode(Number(id));
    }
}
