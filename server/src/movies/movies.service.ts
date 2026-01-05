import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { MovieSyncData } from './dto/sync-data.dto';

@Injectable()
export class MoviesService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 24, filters: { type?: string; genre?: string; year?: number; country?: string } = {}) {
        const skip = (page - 1) * limit;

        const where: any = { status: 'active' };
        if (filters.type) where.type = filters.type;
        if (filters.year) where.year = Number(filters.year);
        if (filters.genre) {
            where.genres = {
                path: '$',
                array_contains: filters.genre
            };
        }
        if (filters.country) {
            where.countries = {
                path: '$',
                array_contains: filters.country
            };
        }

        const [movies, total] = await Promise.all([
            this.prisma.movie.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { episodes: true } }
                }
            }),
            this.prisma.movie.count({ where })
        ]);

        return {
            items: movies,
            paginate: {
                current_page: page,
                total_page: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        };
    }

    async findBySlug(slug: string) {
        const movie = await this.prisma.movie.findUnique({
            where: { slug },
            include: {
                episodes: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!movie) {
            throw new NotFoundException('Phim không tồn tại');
        }

        // Increment view count
        await this.prisma.movie.update({
            where: { id: movie.id },
            data: { views: { increment: 1 } }
        });

        return movie;
    }

    async create(createMovieDto: CreateMovieDto) {
        return this.prisma.movie.create({
            data: createMovieDto
        });
    }

    async update(slug: string, updateMovieDto: UpdateMovieDto) {
        const movie = await this.prisma.movie.findUnique({ where: { slug } });

        if (!movie) {
            throw new NotFoundException('Phim không tồn tại');
        }

        return this.prisma.movie.update({
            where: { slug },
            data: updateMovieDto
        });
    }

    async remove(slug: string) {
        const movie = await this.prisma.movie.findUnique({ where: { slug } });

        if (!movie) {
            throw new NotFoundException('Phim không tồn tại');
        }

        return this.prisma.movie.delete({ where: { slug } });
    }

    async search(keyword: string, page = 1, limit = 10, filters: { type?: string; genre?: string; year?: number; country?: string } = {}) {
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'active',
            OR: [
                { name: { contains: keyword } },
                { originalName: { contains: keyword } },
                { description: { contains: keyword } }
            ]
        };

        if (filters.type) where.type = filters.type;
        if (filters.year) where.year = Number(filters.year);
        if (filters.genre) {
            where.genres = {
                path: '$',
                array_contains: filters.genre
            };
        }
        if (filters.country) {
            where.countries = {
                path: '$',
                array_contains: filters.country
            };
        }

        const [movies, total] = await Promise.all([
            this.prisma.movie.findMany({
                where,
                skip,
                take: limit,
                orderBy: { views: 'desc' }
            }),
            this.prisma.movie.count({ where })
        ]);

        return {
            items: movies,
            paginate: {
                current_page: page,
                total_page: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        };
    }

    // ===== HELPERS & SYNC =====

    /**
     * Resolve a movie ID from either a number (local ID) or a string (slug).
     * If it's a slug and not found locally, it will return the existing ID or throw.
     * Note: This does NOT auto-create. Use syncMovie for that.
     */
    async resolveMovieId(idOrSlug: number | string): Promise<number> {
        console.log('[MoviesService] Resolving movie ID for:', idOrSlug);

        let movie: { id: number } | null = null;

        if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
            const id = Number(idOrSlug);
            movie = await this.prisma.movie.findUnique({
                where: { id },
                select: { id: true }
            });
        } else {
            const slug = idOrSlug.toString();
            movie = await this.prisma.movie.findUnique({
                where: { slug },
                select: { id: true }
            });
        }

        if (!movie) {
            console.warn('[MoviesService] Movie not found for identifier:', idOrSlug);
            throw new NotFoundException('Phim không tồn tại trong hệ thống');
        }

        return movie.id;
    }

    /**
     * Find or Create a movie from external data.
     * Centralized logic moved from UsersService.
     */
    async syncMovie(idOrSlug: number | string, data?: MovieSyncData): Promise<number> {
        if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
            return Number(idOrSlug);
        }

        const slug = data?.slug || idOrSlug.toString();
        let movie = await this.prisma.movie.findUnique({ where: { slug } });

        if (!movie && data) {
            console.log('[MoviesService] Syncing new movie:', data.slug);
            // Parse Category Data
            const catType = data.category?.['1']?.list?.[0]?.name || 'Phim bộ';
            const type = catType === 'Phim lẻ' ? 'movie' : 'series';

            // Extract lists
            const genres = data.category?.['2']?.list?.map(i => i.name) || [];
            const countries = data.category?.['4']?.list?.map(i => i.name) || [];
            const yearStr = data.category?.['3']?.list?.[0]?.name;
            const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

            // Parse Casts "A, B, C" -> ["A", "B", "C"]
            let casts: string[] = [];
            if (data.casts) {
                casts = data.casts.split(',').map(c => c.trim()).filter(c => c);
            }

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
                    year,
                    type,
                    time: data.time,
                    currentEpisode: data.current_episode,
                    totalEpisodes: data.total_episodes || 1,
                    director: data.director,
                    casts: casts.length > 0 ? casts : undefined,
                    genres: genres.length > 0 ? genres : undefined,
                    countries: countries.length > 0 ? countries : undefined,
                }
            });
        }

        if (!movie) throw new NotFoundException('Phim chưa được đồng bộ và không có dữ liệu để tạo mới');
        return movie.id;
    }

    // ===== RATINGS =====
    async getMovieRating(movieId: number, userId?: number) {
        if (!movieId) {
            console.error('[MoviesService] getMovieRating called with invalid movieId:', movieId);
            throw new BadRequestException('ID phim không hợp lệ');
        }

        const [aggregate, userRating] = await Promise.all([
            this.prisma.rating.aggregate({
                where: { movieId: Number(movieId) },
                _avg: { score: true },
                _count: { score: true },
            }),
            userId ? this.prisma.rating.findFirst({
                where: { movieId: Number(movieId), userId }
            }) : null
        ]);

        return {
            averageScore: aggregate._avg.score || 0,
            totalRatings: aggregate._count.score,
            userRating: userRating?.score || null,
            userReview: userRating?.content || null
        };
    }

    async upsertRating(userId: number, movieId: number, score: number, content?: string) {
        if (score < 1 || score > 5) throw new Error('Score must be between 1 and 5');

        const existing = await this.prisma.rating.findFirst({
            where: { userId, movieId }
        });

        if (existing) {
            return this.prisma.rating.update({
                where: { id: existing.id },
                data: { score, content }
            });
        }

        return this.prisma.rating.create({
            data: { userId, movieId, score, content }
        });
    }

    async getReviews(movieId: number) {
        if (!movieId) {
            throw new BadRequestException('ID phim không hợp lệ');
        }

        return this.prisma.rating.findMany({
            where: {
                movieId: Number(movieId),
                content: { not: null }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
    }

    // ===== COMMENTS =====
    async getComments(movieId: number) {
        if (!movieId) {
            console.error('[MoviesService] getComments called with invalid movieId:', movieId);
            throw new BadRequestException('ID phim không hợp lệ');
        }

        return this.prisma.comment.findMany({
            where: { movieId: Number(movieId) },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
    }

    async createComment(userId: number, movieId: number, content: string) {
        if (!userId) {
            throw new BadRequestException('User ID is required for commenting');
        }
        console.log(`[MoviesService] Creating comment by user ${userId} for movie ${movieId}`);
        return this.prisma.comment.create({
            data: {
                content,
                userId,
                movieId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async updateComment(userId: number, commentId: number, content: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) throw new NotFoundException('Bình luận không tồn tại');
        if (comment.userId !== userId) throw new ForbiddenException('Bạn không có quyền sửa bình luận này');

        return this.prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
    }

    async deleteComment(userId: number, commentId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) throw new NotFoundException('Bình luận không tồn tại');
        if (comment.userId !== userId) throw new ForbiddenException('Bạn không có quyền xóa bình luận này');

        await this.prisma.comment.delete({
            where: { id: commentId }
        });

        return { message: 'Đã xóa bình luận' };
    }
}
