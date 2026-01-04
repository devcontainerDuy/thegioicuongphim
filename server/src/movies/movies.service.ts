import { Injectable, NotFoundException } from '@nestjs/common';
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
}
