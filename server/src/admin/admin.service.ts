import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { User } from '../users/entities/user.entity';
import { ViewLog } from '../view-logs/entities/view-log.entity';
import { Episode } from '../movies/entities/episode.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { Rating } from '../ratings/entities/rating.entity';
import {
  CreateMovieDto,
  UpdateMovieDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
} from '@/movies/dto';
import { CreateRoleDto } from '@/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/roles/dto/update-role.dto';
import { CreatePermissionDto } from '@/roles/dto/create-permission.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ViewLog)
    private viewLogRepository: Repository<ViewLog>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  // Dashboard Stats
  async getDashboardStats() {
    const totalMovies = await this.movieRepository.count();
    const totalUsers = await this.userRepository.count();

    // Sum views
    const viewsResult = await this.movieRepository
      .createQueryBuilder('movie')
      .select('SUM(movie.views)', 'totalViews')
      .getRawOne<{ totalViews: string }>();
    const totalViews = viewsResult ? Number(viewsResult.totalViews) : 0;

    const recentMovies = await this.movieRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'slug', 'thumbUrl', 'createdAt'],
    });

    const recentUsers = await this.userRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['role'],
      select: ['id', 'email', 'name', 'createdAt'], // role is included via relations
    });

    return {
      stats: {
        totalMovies,
        totalUsers,
        totalViews,
      },
      recentMovies,
      recentUsers,
    };
  }

  async getAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    // Use QueryBuilder for aggregations
    // Daily Total
    const dailyStats = await this.viewLogRepository
      .createQueryBuilder('viewLog')
      .select('SUM(viewLog.views)', 'views')
      .where('viewLog.date >= :today', {
        today: today.toISOString().split('T')[0],
      })
      // Note: date column is string YYYY-MM-DD
      .getRawOne<{ views: string }>();

    // Last 7 Days Total
    const weeklyStats = await this.viewLogRepository
      .createQueryBuilder('viewLog')
      .select('SUM(viewLog.views)', 'views')
      .where('viewLog.date >= :last7Days', {
        last7Days: last7Days.toISOString().split('T')[0],
      })
      .getRawOne<{ views: string }>();

    // Last 30 Days Total
    const monthlyStats = await this.viewLogRepository
      .createQueryBuilder('viewLog')
      .select('SUM(viewLog.views)', 'views')
      .where('viewLog.date >= :last30Days', {
        last30Days: last30Days.toISOString().split('T')[0],
      })
      .getRawOne<{ views: string }>();

    // Top 10 Movies in last 30 days
    const topMovies = await this.viewLogRepository
      .createQueryBuilder('viewLog')
      .select('viewLog.movieId', 'movieId')
      .addSelect('SUM(viewLog.views)', 'views')
      .where('viewLog.date >= :last30Days', {
        last30Days: last30Days.toISOString().split('T')[0],
      })
      .groupBy('viewLog.movieId')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany<{ movieId: number; views: string }>();

    // Daily breakdown for chart (30 days)
    const chartDaily = await this.viewLogRepository
      .createQueryBuilder('viewLog')
      .select('viewLog.date', 'date')
      .addSelect('SUM(viewLog.views)', 'views')
      .where('viewLog.date >= :last30Days', {
        last30Days: last30Days.toISOString().split('T')[0],
      })
      .groupBy('viewLog.date')
      .orderBy('viewLog.date', 'ASC')
      .getRawMany<{ date: string | Date; views: string }>();

    // Get movie names for top movies
    const topMoviesWithNames = await Promise.all(
      topMovies.map(async (item) => {
        const movie = await this.movieRepository.findOne({
          where: { id: item.movieId },
          select: ['name', 'slug'],
        });
        return {
          id: item.movieId,
          name: movie?.name || 'Unknown',
          slug: movie?.slug,
          views: Number(item.views) || 0,
        };
      }),
    );

    // Format chart data
    const chartData = chartDaily.map((item) => ({
      date:
        typeof item.date === 'string'
          ? item.date
          : item.date.toISOString().split('T')[0],
      views: Number(item.views) || 0,
    }));

    return {
      daily: Number(dailyStats?.views) || 0,
      weekly: Number(weeklyStats?.views) || 0,
      monthly: Number(monthlyStats?.views) || 0,
      topMovies: topMoviesWithNames,
      chartData,
    };
  }

  // Movies CRUD
  async getMovies(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    // For search with OR condition:
    const findOptions: FindOptionsWhere<Movie> | FindOptionsWhere<Movie>[] =
      search
        ? [{ name: Like(`%${search}%`) }, { slug: Like(`%${search}%`) }]
        : {};

    // Complexity: pagination with OR + relations + count relations.
    // findAndCount supports taking array for WHERE (OR logic).

    const [movies, total] = await this.movieRepository.findAndCount({
      where: findOptions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['episodes', 'favorites'],
      // Note: TypeORM doesn't have a simple _count relation.
      // We can use loadRelationCountAndMap or just map length if not huge (episodes and favorites count might be heavy if loaded).
      // Better: use query builder if we just want counts. Or just load them for now as migration step.
    });

    const items = movies.map((m) => ({
      ...m,
      _count: {
        episodes: m.episodes?.length || 0,
        favorites: m.favorites?.length || 0,
      },
      // Remove heavy arrays if needed
    }));

    return {
      items,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async getMovieById(id: number) {
    return this.movieRepository.findOne({
      where: { id },
      relations: ['episodes'],
      order: {
        // Nested relation sort might be ignored by TypeORM but valid TS
        episodes: { sortOrder: 'ASC' as const },
      },
      // Actually TypeORM find options doesn't support relation order easily in v0.3 plain object.
      // We might need to sort in JS or use QB.
      // Or relations: { episodes: true } doesn't support sort.
      // Workaround: Load regular and sort in mapped object or use QB.
    });
    // Actually, simple way: fetch movie, then fetch episodes sorted. Or use QB.
  }

  async createMovie(data: CreateMovieDto) {
    const movie = this.movieRepository.create(data);
    return this.movieRepository.save(movie);
  }

  async updateMovie(id: number, data: UpdateMovieDto) {
    await this.movieRepository.update(id, data);
    return this.movieRepository.findOne({ where: { id } });
  }

  async deleteMovie(id: number) {
    return this.movieRepository.delete(id);
  }

  // Users Management
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const findOptions = search
      ? [{ email: Like(`%${search}%`) }, { name: Like(`%${search}%`) }]
      : {};

    const [users, total] = await this.userRepository.findAndCount({
      where: findOptions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['role', 'favorites', 'watchHistory'],
    });

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      _count: {
        favorites: user.favorites?.length || 0,
        watchHistory: user.watchHistory?.length || 0,
      },
    }));

    return {
      items,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async updateUserRole(id: number, roleName: string) {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) throw new Error('Role not found');

    await this.userRepository.update(id, { role });
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.role = role;
      return this.userRepository.save(user);
    }
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }

  // ...

  async createEpisode(movieId: number, data: CreateEpisodeDto) {
    const count = await this.episodeRepository.count({ where: { movieId } });
    const episode = this.episodeRepository.create({
      ...data,
      movieId,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : count + 1,
    });
    return this.episodeRepository.save(episode);
  }

  async updateEpisode(id: number, data: UpdateEpisodeDto) {
    await this.episodeRepository.update(id, data);
    return this.episodeRepository.findOne({ where: { id } });
  }

  async deleteEpisode(id: number) {
    return this.episodeRepository.delete(id);
  }

  // Roles & Permissions Management
  async getRoles() {
    const roles = await this.roleRepository.find({
      relations: ['permissions', 'users'],
    });

    return roles.map((role) => ({
      ...role,
      _count: { users: role.users?.length || 0 },
      users: undefined, // remove heavy user list
    }));
  }

  // ...

  async createRole(data: CreateRoleDto) {
    const { name, description, permissions } = data;

    // permissions is array of slugs. Need to find them.
    let permissionEntities: Permission[] = [];
    if (permissions && permissions.length > 0) {
      permissionEntities = await this.permissionRepository.find({
        where: { slug: In(permissions) },
      });
    }

    const role = this.roleRepository.create({
      name,
      description,
      permissions: permissionEntities,
    });
    return this.roleRepository.save(role);
  }

  async updateRole(id: number, data: UpdateRoleDto) {
    const { name, description, permissions } = data;

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) throw new Error('Role not found');

    if (name) role.name = name;
    if (description !== undefined) role.description = description; // Allow clearing? DTO should handle optional

    if (permissions) {
      const permissionEntities = await this.permissionRepository.find({
        where: { slug: In(permissions) },
      });
      role.permissions = permissionEntities;
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (role && role.name === 'Admin') {
      throw new Error('Cannot delete Admin role');
    }
    return this.roleRepository.delete(id);
  }

  async getPermissions() {
    return this.permissionRepository.find();
  }

  // ...

  async createPermission(data: CreatePermissionDto) {
    const permission = this.permissionRepository.create(data);
    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: number) {
    return this.permissionRepository.delete(id);
  }

  // Reviews Moderation
  async getReviews(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    // Search is complex here (OR conditions across relations).
    // Using QueryBuilder is safer/easier for complex ORs with relations.

    const qb = this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.movie', 'movie')
      .where('rating.content IS NOT NULL');

    if (search) {
      qb.andWhere(
        '(rating.content LIKE :search OR user.name LIKE :search OR movie.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('rating.createdAt', 'DESC').skip(skip).take(limit);

    const [reviews, total] = await qb.getManyAndCount();

    return {
      items: reviews,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async deleteReview(id: number) {
    return this.ratingRepository.delete(id);
  }
}

// End of file
