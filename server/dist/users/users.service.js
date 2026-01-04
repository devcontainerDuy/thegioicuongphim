"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
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
    async changePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user)
            throw new common_1.NotFoundException('User không tồn tại');
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Mật khẩu hiện tại không đúng');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { message: 'Đổi mật khẩu thành công' };
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
    async saveWatchProgress(userId, movieId, episodeId, progress = 0, movieData, episodeData) {
        try {
            const localMovieId = await this.syncMovie(movieId, movieData);
            const localEpisodeId = await this.syncEpisode(localMovieId, episodeId, episodeData);
            const existing = await this.prisma.watchHistory.findFirst({
                where: { userId, movieId: localMovieId, episodeId: localEpisodeId }
            });
            if (existing) {
                return await this.prisma.watchHistory.update({
                    where: { id: existing.id },
                    data: { progress, watchedAt: new Date() }
                });
            }
            return await this.prisma.watchHistory.create({
                data: { userId, movieId: localMovieId, episodeId: localEpisodeId, progress }
            });
        }
        catch (error) {
            console.error('Error in saveWatchProgress:', error);
            throw new common_1.BadRequestException(`Failed to save progress: ${error.message}`);
        }
    }
    async syncMovie(idOrSlug, data) {
        if (typeof idOrSlug === 'number')
            return idOrSlug;
        const slug = data?.slug || idOrSlug.toString();
        let movie = await this.prisma.movie.findUnique({ where: { slug } });
        if (!movie && data) {
            console.log('Creating new movie from external data:', data.slug);
            movie = await this.prisma.movie.create({
                data: {
                    slug: data.slug,
                    name: data.name,
                    originalName: data.original_name,
                    description: data.description,
                    thumbUrl: data.thumb_url,
                    posterUrl: data.poster_url,
                    quality: data.quality,
                    language: data.language,
                    year: data.category?.['3']?.list?.[0]?.name ? parseInt(data.category['3'].list[0].name) : 2024,
                    time: data.time,
                    currentEpisode: data.current_episode,
                    totalEpisodes: data.total_episodes || 1
                }
            });
        }
        if (!movie)
            throw new common_1.NotFoundException('Movie not found and could not be synced');
        return movie.id;
    }
    async syncEpisode(localMovieId, idOrSlug, data) {
        if (!data && !idOrSlug)
            return null;
        if (typeof idOrSlug === 'number')
            return idOrSlug;
        const slug = data?.slug || idOrSlug?.toString();
        if (!slug)
            return null;
        let episode = await this.prisma.episode.findUnique({
            where: {
                movieId_slug: {
                    movieId: localMovieId,
                    slug: slug
                }
            }
        });
        if (!episode && data) {
            episode = await this.prisma.episode.create({
                data: {
                    movieId: localMovieId,
                    name: data.name,
                    slug: data.slug,
                    embedUrl: data.embed,
                    m3u8Url: data.m3u8,
                    sortOrder: 0
                }
            });
        }
        return episode ? episode.id : null;
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