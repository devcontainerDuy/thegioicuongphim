import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
    constructor(private prisma: PrismaService) { }

    // Get similar movies based on type and year
    async getSimilar(movieId: number, limit = 10) {
        const movie = await this.prisma.movie.findUnique({
            where: { id: movieId }
        });

        if (!movie) return [];

        const similar = await this.prisma.movie.findMany({
            where: {
                id: { not: movieId },
                status: 'active',
                OR: [
                    { type: movie.type },
                    { year: movie.year },
                ]
            },
            take: limit,
            orderBy: { views: 'desc' }
        });

        return similar;
    }

    // Get trending movies by views
    async getTrending(limit = 10) {
        return this.prisma.movie.findMany({
            where: { status: 'active' },
            take: limit,
            orderBy: { views: 'desc' }
        });
    }

    // Get latest/new releases
    async getLatest(limit = 10) {
        return this.prisma.movie.findMany({
            where: { status: 'active' },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }

    // Get personalized recommendations based on watch history
    async getForYou(userId: number, limit = 10) {
        // Get user's watch history to find preferred types
        const history = await this.prisma.watchHistory.findMany({
            where: { userId },
            include: { movie: { select: { type: true, year: true } } },
            orderBy: { watchedAt: 'desc' },
            take: 20
        });

        if (!history.length) {
            // If no history, return trending
            return this.getTrending(limit);
        }

        // Find most watched type
        const typeCounts = history.reduce((acc, h) => {
            if (h.movie?.type) {
                acc[h.movie.type] = (acc[h.movie.type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const preferredType = Object.keys(typeCounts).sort(
            (a, b) => typeCounts[b] - typeCounts[a]
        )[0] || 'series';

        // Get watched movie IDs to exclude
        const watchedIds = history.map(h => h.movieId);

        const recommendations = await this.prisma.movie.findMany({
            where: {
                id: { notIn: watchedIds },
                status: 'active',
                type: preferredType
            },
            take: limit,
            orderBy: { views: 'desc' }
        });

        return recommendations;
    }
}
