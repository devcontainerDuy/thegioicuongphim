"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
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
        if (!user)
            throw new common_1.NotFoundException('User không tồn tại');
        return user;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, name: true, avatar: true, role: true }
        });
    }
    async getWatchHistory(userId, page = 1, limit = 20) {
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
    async saveWatchProgress(userId, movieId, episodeId, progress = 0) {
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
    async getFavorites(userId, page = 1, limit = 20) {
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
    async addFavorite(userId, movieId) {
        const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
        if (!movie)
            throw new common_1.NotFoundException('Phim không tồn tại');
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
    async removeFavorite(userId, movieId) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_movieId: { userId, movieId } }
        });
        if (!existing)
            throw new common_1.NotFoundException('Phim không có trong danh sách yêu thích');
        await this.prisma.favorite.delete({
            where: { userId_movieId: { userId, movieId } }
        });
        return { message: 'Đã xóa khỏi danh sách yêu thích' };
    }
    async isFavorite(userId, movieId) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_movieId: { userId, movieId } }
        });
        return { isFavorite: !!existing };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map