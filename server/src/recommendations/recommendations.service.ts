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

        return this.attachRatingToMovies(similar);
    }

    // Get trending movies by views
    async getTrending(limit = 10) {
        const movies = await this.prisma.movie.findMany({
            where: { status: 'active' },
            take: limit,
            orderBy: { views: 'desc' }
        });
        return this.attachRatingToMovies(movies);
    }

    // Get latest/new releases
    async getLatest(limit = 10) {
        const movies = await this.prisma.movie.findMany({
            where: { status: 'active' },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        return this.attachRatingToMovies(movies);
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

        return this.attachRatingToMovies(recommendations);
    }

    private async attachRatingToMovies(movies: any[]) {
        const movieIds = movies.map(m => m.id);
        const ratingsData = await this.prisma.rating.groupBy({
            by: ['movieId'],
            where: { movieId: { in: movieIds } },
            _avg: { score: true },
            _count: { score: true }
        });

        const ratingMap: Record<number, { averageScore: number; totalRatings: number }> = ratingsData.reduce((acc, curr) => {
            acc[curr.movieId] = {
                averageScore: curr._avg.score ? Number(curr._avg.score.toFixed(1)) : 0,
                totalRatings: curr._count.score
            };
            return acc;
        }, {} as Record<number, { averageScore: number; totalRatings: number }>);

        return movies.map(movie => ({
            ...movie,
            averageScore: ratingMap[movie.id]?.averageScore || 0,
            totalRatings: ratingMap[movie.id]?.totalRatings || 0
        }));
    }
}
