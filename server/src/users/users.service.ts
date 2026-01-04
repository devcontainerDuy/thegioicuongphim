import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        favorites: true,
                        watchHistory: true
                    }
                }
            }
        });

        if (!user) throw new NotFoundException('User không tồn tại');
        return user;
    }

    async updateProfile(userId: number, data: { name?: string; avatar?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, name: true, avatar: true, role: true }
        });
    }

    // ===== WATCH HISTORY =====
    async getWatchHistory(userId: number, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.watchHistory.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { watchedAt: 'desc' },
                include: {
                    movie: {
                        select: { id: true, slug: true, name: true, thumbUrl: true, currentEpisode: true }
                    },
                    episode: {
                        select: { id: true, slug: true, name: true }
                    }
                }
            }),
            this.prisma.watchHistory.count({ where: { userId } })
        ]);

        return {
            items,
            paginate: {
                current_page: page,
                total_page: Math.ceil(total / limit),
                total_items: total
            }
        };
    }

    async saveWatchProgress(userId: number, movieId: number, episodeId?: number, progress = 0) {
        const existing = await this.prisma.watchHistory.findFirst({
            where: { userId, movieId, episodeId: episodeId || null }
        });

        if (existing) {
            return this.prisma.watchHistory.update({
                where: { id: existing.id },
                data: { progress, watchedAt: new Date() }
            });
        }

        return this.prisma.watchHistory.create({
            data: { userId, movieId, episodeId, progress }
        });
    }

    // ===== FAVORITES =====
    async getFavorites(userId: number, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    movie: {
                        select: {
                            id: true, slug: true, name: true, thumbUrl: true,
                            quality: true, currentEpisode: true, year: true
                        }
                    }
                }
            }),
            this.prisma.favorite.count({ where: { userId } })
        ]);

        return {
            items: items.map(fav => fav.movie),
            paginate: {
                current_page: page,
                total_page: Math.ceil(total / limit),
                total_items: total
            }
        };
    }

    async addFavorite(userId: number, movieId: number) {
        const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
        if (!movie) throw new NotFoundException('Phim không tồn tại');

        const existing = await this.prisma.favorite.findUnique({
            where: { userId_movieId: { userId, movieId } }
        });

        if (existing) {
            return { message: 'Phim đã có trong danh sách yêu thích' };
        }

        await this.prisma.favorite.create({
            data: { userId, movieId }
        });

        return { message: 'Đã thêm vào danh sách yêu thích' };
    }

    async removeFavorite(userId: number, movieId: number) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_movieId: { userId, movieId } }
        });

        if (!existing) throw new NotFoundException('Phim không có trong danh sách yêu thích');

        await this.prisma.favorite.delete({
            where: { userId_movieId: { userId, movieId } }
        });

        return { message: 'Đã xóa khỏi danh sách yêu thích' };
    }

    async isFavorite(userId: number, movieId: number) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_movieId: { userId, movieId } }
        });
        return { isFavorite: !!existing };
    }
}
