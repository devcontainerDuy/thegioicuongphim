import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Brackets, IsNull } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { MovieSyncData } from './dto/sync-data.dto';
import { Movie } from './entities/movie.entity';
import { Episode } from './entities/episode.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { ReviewVote } from '../ratings/entities/review-vote.entity';
import { Comment } from '../comments/entities/comment.entity';
import { ViewLog } from '../view-logs/entities/view-log.entity';
import { Watchlist } from '../watchlist/entities/watchlist.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(ReviewVote)
    private reviewVoteRepository: Repository<ReviewVote>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(ViewLog)
    private viewLogRepository: Repository<ViewLog>,
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(
    page = 1,
    limit = 24,
    filters: {
      type?: string;
      genre?: string;
      year?: number;
      country?: string;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.movieRepository.createQueryBuilder('movie');

    queryBuilder
      .where('movie.status = :status', { status: 'active' })
      .orderBy('movie.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .loadRelationCountAndMap('movie.episodesCount', 'movie.episodes');

    if (filters.type) {
      queryBuilder.andWhere('movie.type = :type', { type: filters.type });
    }

    if (filters.year) {
      queryBuilder.andWhere('movie.year = :year', {
        year: Number(filters.year),
      });
    }

    if (filters.genre) {
      // Assuming genres is stored as JSON array ["Action", "Comedy"]
      // MySQL JSON_CONTAINS
      queryBuilder.andWhere(`JSON_CONTAINS(movie.genres, :genre, '$')`, {
        genre: JSON.stringify(filters.genre),
      });
    }

    if (filters.country) {
      queryBuilder.andWhere(`JSON_CONTAINS(movie.countries, :country, '$')`, {
        country: JSON.stringify(filters.country),
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async findBySlug(slug: string) {
    const movie = await this.movieRepository.findOne({
      where: { slug },
      relations: ['episodes'],
      order: {
        episodes: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    // Increment view count
    await this.movieRepository.increment({ id: movie.id }, 'views', 1);

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const movie = this.movieRepository.create(createMovieDto);
    return this.movieRepository.save(movie);
  }

  async update(slug: string, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { slug } });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    await this.movieRepository.update({ slug }, updateMovieDto);
    return this.movieRepository.findOne({ where: { slug } });
  }

  async remove(slug: string) {
    const movie = await this.movieRepository.findOne({ where: { slug } });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    return this.movieRepository.delete({ slug });
  }

  async search(
    keyword: string,
    page = 1,
    limit = 10,
    filters: {
      type?: string;
      genre?: string;
      year?: number;
      country?: string;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.movieRepository.createQueryBuilder('movie');

    queryBuilder
      .where('movie.status = :status', { status: 'active' })
      .andWhere(
        new Brackets((qb) => {
          qb.where('movie.name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('movie.originalName LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('movie.description LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('movie.director LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere(`JSON_CONTAINS(movie.casts, :cast, '$')`, {
              cast: JSON.stringify(keyword),
            });
        }),
      )
      .skip(skip)
      .take(limit)
      .orderBy('movie.views', 'DESC');

    if (filters.type) {
      queryBuilder.andWhere('movie.type = :type', { type: filters.type });
    }
    if (filters.year) {
      queryBuilder.andWhere('movie.year = :year', {
        year: Number(filters.year),
      });
    }
    if (filters.genre) {
      queryBuilder.andWhere(`JSON_CONTAINS(movie.genres, :genre, '$')`, {
        genre: JSON.stringify(filters.genre),
      });
    }
    if (filters.country) {
      queryBuilder.andWhere(`JSON_CONTAINS(movie.countries, :country, '$')`, {
        country: JSON.stringify(filters.country),
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    const moviesWithRatings = await this.attachRatingToMovies(items);

    return {
      items: moviesWithRatings,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
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
      .getRawMany<{
        movieId: number;
        averageScore: string | number;
        totalRatings: string | number;
      }>();

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

  // ===== HELPERS & SYNC =====

  /**
   * Resolve a movie ID from either a number (local ID) or a string (slug).
   * If it's a slug and not found locally, it will return the existing ID or throw.
   * Note: This does NOT auto-create. Use syncMovie for that.
   */
  async resolveMovieId(
    idOrSlug: number | string,
    throwOnNotFound = true,
  ): Promise<number | null> {
    console.log('[MoviesService] Resolving movie ID for:', idOrSlug);

    let movie: { id: number } | null = null;

    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      const id = Number(idOrSlug);
      movie = await this.movieRepository.findOne({
        where: { id },
        select: ['id'],
      });
    } else {
      const slug = idOrSlug.toString();
      movie = await this.movieRepository.findOne({
        where: { slug },
        select: ['id'],
      });
    }

    if (!movie) {
      console.warn('[MoviesService] Movie not found for identifier:', idOrSlug);
      if (throwOnNotFound) {
        throw new NotFoundException('Phim không tồn tại trong hệ thống');
      }
      return null;
    }

    return movie.id;
  }

  /**
   * Find or Create a movie from external data.
   * Centralized logic moved from UsersService.
   */
  async syncMovie(
    idOrSlug: number | string,
    data?: MovieSyncData,
  ): Promise<number> {
    console.log('[MoviesService] syncMovie called for:', idOrSlug);

    if (
      typeof idOrSlug === 'number' ||
      (!isNaN(Number(idOrSlug)) && idOrSlug.toString().length < 10)
    ) {
      // Likely a local numeric ID
      return Number(idOrSlug);
    }

    // It's a slug or a hex ID
    const slug = data?.slug || idOrSlug.toString();
    let movie = await this.movieRepository.findOne({ where: { slug } });

    if (!movie && data && data.name) {
      console.log('[MoviesService] Syncing new movie:', slug);
      try {
        // Parse Category Data
        const catType = data.category?.['1']?.list?.[0]?.name || 'Phim bộ';
        const type = catType === 'Phim lẻ' ? 'movie' : 'series';

        // Extract lists
        const genres =
          data.category?.['2']?.list?.map((i) => i.name) ||
          (Array.isArray(data.genres) ? data.genres : []);
        const countries =
          data.category?.['4']?.list?.map((i) => i.name) ||
          (Array.isArray(data.countries) ? data.countries : []);
        const yearStr = data.category?.['3']?.list?.[0]?.name;
        const year = yearStr
          ? parseInt(yearStr)
          : Number(data.year) || new Date().getFullYear();

        // Parse Casts "A, B, C" vs ["A", "B", "C"]
        let casts: string[] = [];
        if (Array.isArray(data.casts)) {
          casts = data.casts;
        } else if (typeof data.casts === 'string') {
          casts = data.casts
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c);
        }

        const newMovie = this.movieRepository.create({
          slug,
          name: data.name,
          originalName: data.original_name || data.originalName,
          description: data.description,
          thumbUrl: data.thumb_url || data.thumbUrl,
          posterUrl: data.poster_url || data.posterUrl,
          quality: data.quality,
          language: data.language,
          year,
          type: data.type || type,
          time: data.time,
          currentEpisode: data.current_episode || data.currentEpisode,
          totalEpisodes: Number(data.total_episodes || data.totalEpisodes) || 1,
          director: data.director,
          casts: casts.length > 0 ? casts : undefined,
          genres: genres.length > 0 ? genres : undefined,
          countries: countries.length > 0 ? countries : undefined,
          status: 'active', // Default status?
        });

        movie = await this.movieRepository.save(newMovie);

        console.log(
          '[MoviesService] Successfully synced movie:',
          movie.slug,
          'ID:',
          movie.id,
        );
      } catch (err) {
        const error = err as any;
        console.error('[MoviesService] Error during movie sync:', error);
        throw new BadRequestException(
          'Không thể lưu thông tin phim: ' + error.message,
        );
      }
    }

    if (!movie) {
      console.error(
        '[MoviesService] Movie not found and sync failed for:',
        slug,
      );
      throw new NotFoundException(
        'Phim chưa được đồng bộ và không có đủ dữ liệu để tạo mới',
      );
    }

    return movie.id;
  }

  // ===== RATINGS =====
  async getMovieRating(movieId: number, userId?: number) {
    if (!movieId) {
      return {
        averageScore: 0,
        totalRatings: 0,
        userRating: null,
        userReview: null,
      };
    }

    const { average, count } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'average')
      .addSelect('COUNT(rating.score)', 'count')
      .where('rating.movieId = :movieId', { movieId })
      .getRawOne();

    let userRating = null;
    if (userId) {
      userRating = await this.ratingRepository.findOne({
        where: { movieId, userId },
      });
    }

    return {
      averageScore: average ? parseFloat(Number(average).toFixed(1)) : 0,
      totalRatings: Number(count),
      userRating: userRating?.score || null,
      userReview: userRating?.content || null,
    };
  }

  async upsertRating(
    userId: number,
    movieId: number,
    score: number,
    content?: string,
  ) {
    if (score < 1 || score > 5)
      throw new Error('Score must be between 1 and 5');

    let existing = await this.ratingRepository.findOne({
      where: { userId, movieId },
    });

    if (existing) {
      existing.score = score;
      if (content !== undefined) existing.content = content;
      return this.ratingRepository.save(existing);
    }

    const newRating = this.ratingRepository.create({
      userId,
      movieId,
      score,
      content,
    });
    return this.ratingRepository.save(newRating);
  }

  async getReviews(movieId: number, currentUserId?: number) {
    if (!movieId) {
      return [];
    }

    const reviews = await this.ratingRepository.find({
      where: {
        movieId: Number(movieId),
        content: Not(IsNull()), // Not null check in TypeORM? Or 'IsNull()' import needed.
        // Actually, cleaner way:
        // content: Not(IsNull()) requires IsNull import.
        // Or query builder 'rating.content IS NOT NULL'.
        // Let's use QueryBuilder or simple find restriction.
        // For simple Find: { content: Not(IsNull()) }
      },
      order: { createdAt: 'DESC' },
      relations: ['user', 'votes'], // Corrected relation name
      // We need count of votes? TypeORM relations count?
      // relationCount? No, map it.
    });

    // To get vote count, we can load relation count or map it.
    // 'reviewVotes' relation is loaded. We can just length it?
    // But for performance, maybe loadRelationCountAndMap?
    // Let's stick to simple mapping if not huge.
    // Wait, TypeORM `find` doesn't support easy count on relation without loading?
    // Accessing `reviews[i].reviewVotes.length` works if relations loaded.

    // If currentUserId provided, check if voted
    let votedIds = new Set<number>();
    if (currentUserId) {
      const votes = await this.reviewVoteRepository.find({
        where: {
          userId: currentUserId,
          ratingId: In(reviews.map((r) => r.id)),
        },
      });
      votedIds = new Set(votes.map((v) => v.ratingId));
    }

    return reviews.map((r) => ({
      ...r,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
      _count: {
        votes: r.votes ? r.votes.length : 0,
      },
      isVoted: votedIds.has(r.id),
      votes: undefined, // hidden
    }));
  }

  async voteReview(userId: number, ratingId: number) {
    const existing = await this.reviewVoteRepository.findOne({
      where: { ratingId, userId },
    });

    if (existing) {
      await this.reviewVoteRepository.remove(existing);
      return { voted: false };
    }

    const newVote = this.reviewVoteRepository.create({
      ratingId,
      userId,
    });
    await this.reviewVoteRepository.save(newVote);
    return { voted: true };
  }

  // ===== COMMENTS =====
  async getComments(movieId: number) {
    if (!movieId) {
      return [];
    }

    // Fetch all comments for the movie
    const comments = await this.commentRepository.find({
      where: { movieId: Number(movieId) },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    // Group into tree (Parent -> Replies)
    const parentComments = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    return parentComments.map((p) => ({
      ...p,
      user: {
        id: p.user.id,
        name: p.user.name,
        avatar: p.user.avatar,
      },
      replies: replies
        .filter((r) => r.parentId === p.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Replies chronological
        .map((r) => ({
          ...r,
          user: {
            id: r.user.id,
            name: r.user.name,
            avatar: r.user.avatar,
          },
        })),
    }));
  }

  async createComment(
    userId: number,
    movieId: number,
    content: string,
    parentId?: number,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required for commenting');
    }

    console.log(
      `[MoviesService] Creating comment by user ${userId} for movie ${movieId}, parent: ${parentId}`,
    );

    const newComment = this.commentRepository.create({
      content,
      userId,
      movieId,
      parentId: parentId ? Number(parentId) : null,
    }) as Comment;

    // Explicitly handle single entity save
    const savedComment = await this.commentRepository.save(newComment);

    // Default load relations manually or find again?
    // TypeORM save returns Entity, but relations might not be hydrated unless returned from DB with relations?
    // It's safer to findOne to return full structure.
    const comment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'movie'],
    });

    if (!comment) throw new Error('Failed to retrieve created comment');

    // Trigger Notification if it's a reply
    if (parentId) {
      try {
        const parentComment = await this.commentRepository.findOne({
          where: { id: Number(parentId) },
        });

        // Don't notify self
        if (parentComment && parentComment.userId !== userId) {
          await this.notificationsService.createNotification(
            parentComment.userId,
            {
              type: 'REPLY',
              title: 'Phản hồi bình luận',
              message: `${comment.user.name} đã trả lời bình luận của bạn trong phim ${comment.movie.name}`,
              metadata: {
                commentId: comment.id,
                parentId: parentId,
                movieSlug: comment.movie.slug,
              },
            },
          );
        }
      } catch (err) {
        const error = err as any;
        console.error(
          '[MoviesService] Failed to create reply notification:',
          error,
        );
      }
    }

    return comment;
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');

    comment.content = content;
    await this.commentRepository.save(comment);

    // Return with user relation
    return this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');

    await this.commentRepository.remove(comment);

    return { success: true };
  }

  async logView(movieId: number) {
    console.log('[MoviesService] Logging view for movieId:', movieId);
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      // Try to find existing
      const viewLog = await this.viewLogRepository.findOne({
        where: {
          movieId,
          date: new Date(dateStr),
        },
      });

      if (viewLog) {
        // Increment
        await this.viewLogRepository.increment({ id: viewLog.id }, 'views', 1);
        return viewLog; // Return old or new? Usually just return something.
      } else {
        // Create
        const newLog = this.viewLogRepository.create({
          movieId,
          date: new Date(dateStr),
          views: 1,
        });
        return await this.viewLogRepository.save(newLog);
      }
    } catch (err: unknown) {
      // Handle Race Condition (Duplicate Entry)
      // MySQL error code for duplicate entry is usually generic in TypeORM QueryFailedError
      // We can check message or code.
      const error = err as any;
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        // 23505 is Postgres, ER_DUP_ENTRY MySQL
        console.log(
          '[MoviesService] Race condition in logView, waiting and retrying...',
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
        // Retry update
        await this.viewLogRepository.increment(
          { movieId, date: new Date(dateStr) }, // increment allows finding by conditions too? No, mainly ID.
          'views',
          1,
        );
        return null;
      }
      console.error('[MoviesService] logView failed:', error);
      throw error;
    }
  }

  // ===== WATCHLIST =====
  async toggleWatchlist(userId: number, movieId: number) {
    const existing = await this.watchlistRepository.findOne({
      where: { userId, movieId },
    });

    if (existing) {
      await this.watchlistRepository.remove(existing);
      return { added: false };
    }

    const newItem = this.watchlistRepository.create({
      userId,
      movieId,
    });
    await this.watchlistRepository.save(newItem);
    return { added: true };
  }

  async getWatchlist(userId: number) {
    const watchlist = await this.watchlistRepository.find({
      where: { userId },
      relations: ['movie'],
      order: { createdAt: 'DESC' },
    });

    return watchlist.map((item) => item.movie);
  }

  async checkInWatchlist(userId: number, movieId: number) {
    const item = await this.watchlistRepository.findOne({
      where: { userId, movieId },
    });
    return { inWatchlist: !!item };
  }
}
