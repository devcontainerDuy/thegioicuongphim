import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
  ) {}

  // Get similar movies based on type and year
  async getSimilar(movieId: number, limit = 10) {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) return [];

    const similar = await this.movieRepository.find({
      where: [
        { id: Not(movieId), status: 'active', type: movie.type },
        { id: Not(movieId), status: 'active', year: movie.year },
      ], // OR condition: (type=X OR year=Y) AND id!=ID AND status=active
      // TypeORM 'where' array is OR of objects. Each object must have all conditions.
      take: limit,
      order: { views: 'DESC' },
    });

    return this.attachRatingToMovies(similar);
  }

  // Get trending movies by views
  async getTrending(limit = 10) {
    const movies = await this.movieRepository.find({
      where: { status: 'active' },
      take: limit,
      order: { views: 'DESC' },
    });
    return this.attachRatingToMovies(movies);
  }

  // Get latest/new releases
  async getLatest(limit = 10) {
    const movies = await this.movieRepository.find({
      where: { status: 'active' },
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return this.attachRatingToMovies(movies);
  }

  // Get personalized recommendations based on watch history
  async getForYou(userId: number, limit = 10) {
    // Get user's watch history to find preferred types
    const history = await this.watchHistoryRepository.find({
      where: { userId },
      relations: ['movie'],
      order: { watchedAt: 'DESC' },
      take: 20,
    });

    if (!history.length) {
      // If no history, return trending
      return this.getTrending(limit);
    }

    // Find most watched type
    const typeCounts = history.reduce(
      (acc, h) => {
        if (h.movie?.type) {
          acc[h.movie.type] = (acc[h.movie.type] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const preferredType =
      Object.keys(typeCounts).sort(
        (a, b) => typeCounts[b] - typeCounts[a],
      )[0] || 'series';

    // Get watched movie IDs to exclude
    const watchedIds = history.map((h) => h.movieId);

    const recommendations = await this.movieRepository.find({
      where: {
        id: Not(In(watchedIds.length > 0 ? watchedIds : [-1])), // exclude watched
        status: 'active',
        type: preferredType,
      },
      take: limit,
      order: { views: 'DESC' },
    });

    return this.attachRatingToMovies(recommendations);
  }

  private async attachRatingToMovies(movies: Movie[]) {
    const movieIds = movies.map((m) => m.id);
    if (movieIds.length === 0) return [];

    const ratingsData = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.movieId', 'movieId')
      .addSelect('AVG(rating.score)', 'averageScore')
      .addSelect('COUNT(rating.score)', 'totalRatings')
      .where('rating.movieId IN (:...movieIds)', { movieIds })
      .groupBy('rating.movieId')
      .getRawMany();

    const ratingMap = ratingsData.reduce(
      (acc, curr) => {
        acc[curr.movieId] = {
          averageScore: curr.averageScore
            ? Number(Number(curr.averageScore).toFixed(1))
            : 0,
          totalRatings: Number(curr.totalRatings),
        };
        return acc;
      },
      {} as Record<number, { averageScore: number; totalRatings: number }>,
    );

    return movies.map((movie) => ({
      ...movie,
      averageScore: ratingMap[movie.id]?.averageScore || 0,
      totalRatings: ratingMap[movie.id]?.totalRatings || 0,
    }));
  }
}
