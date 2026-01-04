import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // Dashboard Stats
    async getDashboardStats() {
        const [totalMovies, totalUsers, totalViews, recentMovies, recentUsers] = await Promise.all([
            this.prisma.movie.count(),
            this.prisma.user.count(),
            this.prisma.movie.aggregate({ _sum: { views: true } }),
            this.prisma.movie.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, slug: true, thumbUrl: true, createdAt: true }
            }),
            this.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, email: true, name: true, role: true, createdAt: true }
            })
        ]);

        return {
            stats: {
                totalMovies,
                totalUsers,
                totalViews: totalViews._sum.views || 0,
            },
            recentMovies,
            recentUsers
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
                include: { _count: { select: { episodes: true, favorites: true } } }
            }),
            this.prisma.movie.count({ where })
        ]);

        return {
            items: movies,
            paginate: { current_page: page, total_page: Math.ceil(total / limit), total_items: total }
        };
    }

    async getMovieById(id: number) {
        return this.prisma.movie.findUnique({
            where: { id },
            include: { episodes: { orderBy: { sortOrder: 'asc' } } }
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
            ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, email: true, name: true, avatar: true, role: true, createdAt: true,
                    _count: { select: { favorites: true, watchHistory: true } }
                }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            items: users,
            paginate: { current_page: page, total_page: Math.ceil(total / limit), total_items: total }
        };
    }

    async updateUserRole(id: number, role: string) {
        return this.prisma.user.update({
            where: { id },
            data: { role: { connect: { name: role } } },
            select: { id: true, email: true, name: true, role: true }
        });
    }

    async deleteUser(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }

    // Episodes
    async createEpisode(movieId: number, data: any) {
        const count = await this.prisma.episode.count({ where: { movieId } });
        return this.prisma.episode.create({
            data: { ...data, movieId, sortOrder: count + 1 }
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
            include: { permissions: true, _count: { select: { users: true } } }
        });
    }

    async createRole(data: { name: string; description?: string; permissions?: string[] }) {
        const { name, description, permissions } = data;
        return this.prisma.role.create({
            data: {
                name,
                description,
                permissions: permissions ? {
                    connect: permissions.map(slug => ({ slug }))
                } : undefined
            },
            include: { permissions: true }
        });
    }

    async updateRole(id: number, data: { name?: string; description?: string; permissions?: string[] }) {
        const { name, description, permissions } = data;

        // Prepare update data
        const updateData: any = { name, description };

        if (permissions) {
            updateData.permissions = {
                set: [],
                connect: permissions.map(slug => ({ slug }))
            };
        }

        return this.prisma.role.update({
            where: { id },
            data: updateData,
            include: { permissions: true }
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
}

