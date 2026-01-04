import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';

@Injectable()
export class MoviesService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 24, type?: string) {
        const skip = (page - 1) * limit;

        const where = type ? { type, status: 'active' } : { status: 'active' };

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

    async search(keyword: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const where = {
            status: 'active',
            OR: [
                { name: { contains: keyword } },
                { originalName: { contains: keyword } },
                { description: { contains: keyword } }
            ]
        };

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

    // ===== RATINGS =====
    async getMovieRating(movieId: number, userId?: number) {
        const [aggregate, userRating] = await Promise.all([
            this.prisma.rating.aggregate({
                where: { movieId },
                _avg: { score: true },
                _count: { score: true },
            }),
            userId ? this.prisma.rating.findFirst({
                where: { movieId, userId }
            }) : null
        ]);

        return {
            averageScore: aggregate._avg.score || 0,
            totalRatings: aggregate._count.score,
            userRating: userRating?.score || null
        };
    }

    async upsertRating(userId: number, movieId: number, score: number) {
        if (score < 1 || score > 5) throw new Error('Score must be between 1 and 5');

        const existing = await this.prisma.rating.findFirst({
            where: { userId, movieId }
        });

        if (existing) {
            return this.prisma.rating.update({
                where: { id: existing.id },
                data: { score }
            });
        }

        return this.prisma.rating.create({
            data: { userId, movieId, score }
        });
    }

    // ===== COMMENTS =====
    async getComments(movieId: number) {
        return this.prisma.comment.findMany({
            where: { movieId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });
    }

    async createComment(userId: number, movieId: number, content: string) {
        return this.prisma.comment.create({
            data: { userId, movieId, content },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
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
