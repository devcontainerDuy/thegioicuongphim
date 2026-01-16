import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AdminService } from './admin.service';
import {
  CreateMovieDto,
  UpdateMovieDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
} from '@/movies/dto';
import { CreateRoleDto } from '@/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/roles/dto/update-role.dto';
import { CreatePermissionDto } from '@/roles/dto/create-permission.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Roles('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  @Permissions('report.view')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  @Permissions('report.view')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Movies
  @Get('movies')
  @Permissions('movie.view')
  getMovies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getMovies(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('movies/:id')
  @Permissions('movie.view')
  getMovie(@Param('id') id: string) {
    return this.adminService.getMovieById(Number(id));
  }

  @Post('movies')
  @Permissions('movie.create')
  createMovie(@Body() data: CreateMovieDto) {
    return this.adminService.createMovie(data);
  }

  @Put('movies/:id')
  @Permissions('movie.update')
  updateMovie(@Param('id') id: string, @Body() data: UpdateMovieDto) {
    return this.adminService.updateMovie(Number(id), data);
  }

  @Delete('movies/:id')
  @Permissions('movie.delete')
  deleteMovie(@Param('id') id: string) {
    return this.adminService.deleteMovie(Number(id));
  }

  // Users
  @Get('users')
  @Permissions('user.read')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Put('users/:id/role')
  @Permissions('user.update')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(Number(id), role);
  }

  @Delete('users/:id')
  @Permissions('user.delete')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(Number(id));
  }

  // Episodes
  @Post('movies/:movieId/episodes')
  @Permissions('episode.create')
  createEpisode(
    @Param('movieId') movieId: string,
    @Body() data: CreateEpisodeDto,
  ) {
    return this.adminService.createEpisode(Number(movieId), data);
  }

  @Put('episodes/:id')
  @Permissions('episode.update')
  updateEpisode(@Param('id') id: string, @Body() data: UpdateEpisodeDto) {
    return this.adminService.updateEpisode(Number(id), data);
  }

  @Delete('episodes/:id') // Missing decorator in original code, assumed Delete based on name
  @Permissions('episode.delete')
  deleteEpisode(@Param('id') id: string) {
    return this.adminService.deleteEpisode(Number(id));
  }

  // Role & Permission Endpoints
  @Get('roles')
  @Permissions('role.view')
  getRoles() {
    return this.adminService.getRoles();
  }

  @Post('roles')
  @Permissions('role.create')
  createRole(@Body() data: CreateRoleDto) {
    return this.adminService.createRole(data);
  }

  @Put('roles/:id')
  @Permissions('role.update')
  updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.adminService.updateRole(Number(id), data);
  }

  @Delete('roles/:id')
  @Permissions('role.delete')
  deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(Number(id));
  }

  @Get('permissions')
  @Permissions('permission.view')
  getPermissions() {
    return this.adminService.getPermissions();
  }

  @Post('permissions')
  @Permissions('permission.create')
  createPermission(@Body() data: CreatePermissionDto) {
    return this.adminService.createPermission(data);
  }

  @Delete('permissions/:id')
  @Permissions('permission.delete')
  deletePermission(@Param('id') id: string) {
    return this.adminService.deletePermission(Number(id));
  }

  // Reviews
  @Get('reviews')
  @Permissions('rating.view')
  getReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getReviews(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Delete('reviews/:id')
  @Permissions('rating.delete')
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(Number(id));
  }
}
