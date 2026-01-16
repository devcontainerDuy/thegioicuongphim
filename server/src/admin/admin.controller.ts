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
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Movies
  @Get('movies')
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
  getMovie(@Param('id') id: string) {
    return this.adminService.getMovieById(Number(id));
  }

  @Post('movies')
  createMovie(@Body() data: CreateMovieDto) {
    return this.adminService.createMovie(data);
  }

  @Put('movies/:id')
  updateMovie(@Param('id') id: string, @Body() data: UpdateMovieDto) {
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
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
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
  createEpisode(
    @Param('movieId') movieId: string,
    @Body() data: CreateEpisodeDto,
  ) {
    return this.adminService.createEpisode(Number(movieId), data);
  }

  @Put('episodes/:id')
  updateEpisode(@Param('id') id: string, @Body() data: UpdateEpisodeDto) {
    return this.adminService.updateEpisode(Number(id), data);
  }

  @Delete('episodes/:id') // Missing decorator in original code, assumed Delete based on name
  deleteEpisode(@Param('id') id: string) {
    return this.adminService.deleteEpisode(Number(id));
  }

  // Role & Permission Endpoints
  @Get('roles')
  @Permissions('role.manage') // Or just rely on Admin role via RolesGuard
  getRoles() {
    return this.adminService.getRoles();
  }

  @Post('roles')
  createRole(@Body() data: CreateRoleDto) {
    return this.adminService.createRole(data);
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.adminService.updateRole(Number(id), data);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(Number(id));
  }

  @Get('permissions')
  getPermissions() {
    return this.adminService.getPermissions();
  }

  @Post('permissions')
  createPermission(@Body() data: CreatePermissionDto) {
    return this.adminService.createPermission(data);
  }

  @Delete('permissions/:id')
  deletePermission(@Param('id') id: string) {
    return this.adminService.deletePermission(Number(id));
  }

  // Reviews
  @Get('reviews')
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
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(Number(id));
  }
}
