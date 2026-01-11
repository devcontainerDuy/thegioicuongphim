import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Stats
  async getDashboardStats() {
    // ... (existing code remains as fallback/overview)
    const [totalMovies, totalUsers, totalViews, recentMovies, recentUsers] =
      await Promise.all([
        this.prisma.movie.count(),
        this.prisma.user.count(),
        this.prisma.movie.aggregate({ _sum: { views: true } }),
        this.prisma.movie.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            thumbUrl: true,
            createdAt: true,
          },
        }),
        this.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      stats: {
        totalMovies,
        totalUsers,
        totalViews: totalViews._sum.views || 0,
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

    const [dailyStats, weeklyStats, monthlyStats, topMovies, chartDaily] =
      await Promise.all([
        // Daily Total
        this.prisma.viewLog.aggregate({
          where: { date: today },
          _sum: { views: true },
        }),
        // Last 7 Days Total
        this.prisma.viewLog.aggregate({
          where: { date: { gte: last7Days } },
          _sum: { views: true },
        }),
        // Last 30 Days Total
        this.prisma.viewLog.aggregate({
          where: { date: { gte: last30Days } },
          _sum: { views: true },
        }),
        // Top 10 Movies in last 30 days
        this.prisma.viewLog.groupBy({
          by: ['movieId'],
          where: { date: { gte: last30Days } },
          _sum: { views: true },
          orderBy: { _sum: { views: 'desc' } },
          take: 10,
        }),
        // Daily breakdown for chart (30 days)
        this.prisma.viewLog.groupBy({
          by: ['date'],
          where: { date: { gte: last30Days } },
          _sum: { views: true },
          orderBy: { date: 'asc' },
        }),
      ]);

    // Get movie names for top movies
    const topMoviesWithNames = await Promise.all(
      topMovies.map(async (item) => {
        const movie = await this.prisma.movie.findUnique({
          where: { id: item.movieId },
          select: { name: true, slug: true },
        });
        return {
          id: item.movieId,
          name: movie?.name || 'Unknown',
          slug: movie?.slug,
          views: item._sum.views || 0,
        };
      }),
    );

    // Format chart data
    const chartData = chartDaily.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      views: item._sum.views || 0,
    }));

    return {
      daily: dailyStats._sum.views || 0,
      weekly: weeklyStats._sum.views || 0,
      monthly: monthlyStats._sum.views || 0,
      topMovies: topMoviesWithNames,
      chartData,
    };
  }

  // Movies CRUD
  async getMovies(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] }
      : {};

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { episodes: true, favorites: true } } },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items: movies,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async getMovieById(id: number) {
    return this.prisma.movie.findUnique({
      where: { id },
      include: { episodes: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async createMovie(data: any) {
    return this.prisma.movie.create({ data });
  }

  async updateMovie(id: number, data: any) {
    return this.prisma.movie.update({ where: { id }, data });
  }

  async deleteMovie(id: number) {
    return this.prisma.movie.delete({ where: { id } });
  }

  // Users Management
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [{ email: { contains: search } }, { name: { contains: search } }],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          _count: { select: { favorites: true, watchHistory: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async updateUserRole(id: number, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: { connect: { name: role } } },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // Episodes
  async createEpisode(movieId: number, data: any) {
    const count = await this.prisma.episode.count({ where: { movieId } });
    return this.prisma.episode.create({
      data: { ...data, movieId, sortOrder: count + 1 },
    });
  }

  async updateEpisode(id: number, data: any) {
    return this.prisma.episode.update({ where: { id }, data });
  }

  async deleteEpisode(id: number) {
    return this.prisma.episode.delete({ where: { id } });
  }

  // Roles & Permissions Management
  async getRoles() {
    return this.prisma.role.findMany({
      include: { permissions: true, _count: { select: { users: true } } },
    });
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }) {
    const { name, description, permissions } = data;
    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions
          ? {
              connect: permissions.map((slug) => ({ slug })),
            }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async updateRole(
    id: number,
    data: { name?: string; description?: string; permissions?: string[] },
  ) {
    const { name, description, permissions } = data;

    // Prepare update data
    const updateData: any = { name, description };

    if (permissions) {
      updateData.permissions = {
        set: [],
        connect: permissions.map((slug) => ({ slug })),
      };
    }

    return this.prisma.role.update({
      where: { id },
      data: updateData,
      include: { permissions: true },
    });
  }

  async deleteRole(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (role && role.name === 'Admin') {
      throw new Error('Cannot delete Admin role');
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async getPermissions() {
    return this.prisma.permission.findMany();
  }

  async createPermission(data: { slug: string; description?: string }) {
    return this.prisma.permission.create({ data });
  }

  async deletePermission(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }

  // Reviews Moderation
  async getReviews(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      content: { not: null }, // Only fetch ratings that have review content
    };

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { user: { name: { contains: search } } },
        { movie: { name: { contains: search } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true, email: true } },
          movie: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.rating.count({ where }),
    ]);

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
    return this.prisma.rating.delete({ where: { id } });
  }
}
