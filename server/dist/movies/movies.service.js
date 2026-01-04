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
exports.MoviesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MoviesService = class MoviesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 24, type) {
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
    async findBySlug(slug) {
        const movie = await this.prisma.movie.findUnique({
            where: { slug },
            include: {
                episodes: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });
        if (!movie) {
            throw new common_1.NotFoundException('Phim không tồn tại');
        }
        await this.prisma.movie.update({
            where: { id: movie.id },
            data: { views: { increment: 1 } }
        });
        return movie;
    }
    async create(createMovieDto) {
        return this.prisma.movie.create({
            data: createMovieDto
        });
    }
    async update(slug, updateMovieDto) {
        const movie = await this.prisma.movie.findUnique({ where: { slug } });
        if (!movie) {
            throw new common_1.NotFoundException('Phim không tồn tại');
        }
        return this.prisma.movie.update({
            where: { slug },
            data: updateMovieDto
        });
    }
    async remove(slug) {
        const movie = await this.prisma.movie.findUnique({ where: { slug } });
        if (!movie) {
            throw new common_1.NotFoundException('Phim không tồn tại');
        }
        return this.prisma.movie.delete({ where: { slug } });
    }
    async search(keyword, page = 1, limit = 10) {
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
};
exports.MoviesService = MoviesService;
exports.MoviesService = MoviesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MoviesService);
//# sourceMappingURL=movies.service.js.map