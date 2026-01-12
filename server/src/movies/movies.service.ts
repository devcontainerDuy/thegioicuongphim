import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { MovieSyncData } from './dto/sync-data.dto';

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
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

    const where: any = { status: 'active' };
    if (filters.type) where.type = filters.type;
    if (filters.year) where.year = Number(filters.year);
    if (filters.genre) {
      where.genres = {
        path: '$',
        array_contains: filters.genre,
      };
    }
    if (filters.country) {
      where.countries = {
        path: '$',
        array_contains: filters.country,
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { episodes: true } },
        },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items: movies,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        episodes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    // Increment view count
    await this.prisma.movie.update({
      where: { id: movie.id },
      data: { views: { increment: 1 } },
    });

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: createMovieDto,
    });
  }

  async update(slug: string, updateMovieDto: UpdateMovieDto) {
    const movie = await this.prisma.movie.findUnique({ where: { slug } });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    return this.prisma.movie.update({
      where: { slug },
      data: updateMovieDto,
    });
  }

  async remove(slug: string) {
    const movie = await this.prisma.movie.findUnique({ where: { slug } });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    return this.prisma.movie.delete({ where: { slug } });
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

    const where: any = {
      status: 'active',
      OR: [
        { name: { contains: keyword } },
        { originalName: { contains: keyword } },
        { description: { contains: keyword } },
        { director: { contains: keyword } },
        { casts: { path: '$', array_contains: keyword } },
      ],
    };

    if (filters.type) where.type = filters.type;
    if (filters.year) where.year = Number(filters.year);
    if (filters.genre) {
      where.genres = {
        path: '$',
        array_contains: filters.genre,
      };
    }
    if (filters.country) {
      where.countries = {
        path: '$',
        array_contains: filters.country,
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { views: 'desc' },
      }),
      this.prisma.movie.count({ where }),
    ]);

    const moviesWithRatings = await this.attachRatingToMovies(movies);

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

  private async attachRatingToMovies(movies: any[]) {
    const movieIds = movies.map((m) => m.id);
    const ratingsData = await this.prisma.rating.groupBy({
      by: ['movieId'],
      where: { movieId: { in: movieIds } },
      _avg: { score: true },
      _count: { score: true },
    });

    const ratingMap: Record<
      number,
      { averageScore: number; totalRatings: number }
    > = ratingsData.reduce(
      (acc, curr) => {
        acc[curr.movieId] = {
          averageScore: curr._avg.score
            ? Number(curr._avg.score.toFixed(1))
            : 0,
          totalRatings: curr._count.score,
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
      movie = await this.prisma.movie.findUnique({
        where: { id },
        select: { id: true },
      });
    } else {
      const slug = idOrSlug.toString();
      movie = await this.prisma.movie.findUnique({
        where: { slug },
        select: { id: true },
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
    let movie = await this.prisma.movie.findUnique({ where: { slug } });

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

        movie = await this.prisma.movie.create({
          data: {
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
            totalEpisodes:
              Number(data.total_episodes || data.totalEpisodes) || 1,
            director: data.director,
            casts: casts.length > 0 ? casts : undefined,
            genres: genres.length > 0 ? genres : undefined,
            countries: countries.length > 0 ? countries : undefined,
          },
        });
        console.log(
          '[MoviesService] Successfully synced movie:',
          movie.slug,
          'ID:',
          movie.id,
        );
      } catch (err) {
        const error = err as Error;
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

    const [aggregate, userRating] = await Promise.all([
      this.prisma.rating.aggregate({
        where: { movieId: Number(movieId) },
        _avg: { score: true },
        _count: { score: true },
      }),
      userId
        ? this.prisma.rating.findFirst({
            where: { movieId: Number(movieId), userId },
          })
        : null,
    ]);

    return {
      averageScore: aggregate._avg.score || 0,
      totalRatings: aggregate._count.score,
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

    const existing = await this.prisma.rating.findFirst({
      where: { userId, movieId },
    });

    if (existing) {
      return this.prisma.rating.update({
        where: { id: existing.id },
        data: { score, content },
      });
    }

    return this.prisma.rating.create({
      data: { userId, movieId, score, content },
    });
  }

  async getReviews(movieId: number, currentUserId?: number) {
    if (!movieId) {
      return [];
    }

    const reviews = await this.prisma.rating.findMany({
      where: {
        movieId: Number(movieId),
        content: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    // If currentUserId provided, check if voted
    if (currentUserId) {
      const votes = await this.prisma.reviewVote.findMany({
        where: {
          userId: currentUserId,
          ratingId: { in: reviews.map((r) => r.id) },
        },
      });
      const votedIds = new Set(votes.map((v) => v.ratingId));
      return reviews.map((r) => ({
        ...r,
        isVoted: votedIds.has(r.id),
      }));
    }

    return reviews;
  }

  async voteReview(userId: number, ratingId: number) {
    const existing = await this.prisma.reviewVote.findUnique({
      where: { ratingId_userId: { ratingId, userId } },
    });

    if (existing) {
      await this.prisma.reviewVote.delete({
        where: { id: existing.id },
      });
      return { voted: false };
    }

    await this.prisma.reviewVote.create({
      data: { ratingId, userId },
    });
    return { voted: true };
  }

  // ===== COMMENTS =====
  async getComments(movieId: number) {
    if (!movieId) {
      return [];
    }

    // Fetch all comments for the movie
    const comments = await this.prisma.comment.findMany({
      where: { movieId: Number(movieId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Group into tree (Parent -> Replies)
    const parentComments = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    return parentComments.map((p) => ({
      ...p,
      replies: replies
        .filter((r) => r.parentId === p.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()), // Replies chronological
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

    const comment = await this.prisma.comment.create({
      data: {
        content,
        userId,
        movieId,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        movie: {
          select: { name: true, slug: true },
        },
      },
    });

    // Trigger Notification if it's a reply
    if (parentId) {
      try {
        const parentComment = await this.prisma.comment.findUnique({
          where: { id: Number(parentId) },
          select: { userId: true },
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
        const error = err as Error;
        console.error(
          '[MoviesService] Failed to create reply notification:',
          error,
        );
      }
    }

    return comment;
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  }

  async logView(movieId: number) {
    console.log('[MoviesService] Logging view for movieId:', movieId);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalized to day start

    try {
      return await this.prisma.viewLog.upsert({
        where: {
          movieId_date: {
            movieId,
            date: today,
          },
        },
        update: {
          views: { increment: 1 },
        },
        create: {
          movieId,
          date: today,
          views: 1,
        },
      });
    } catch (err) {
      const error = err as any; // Prisma error has code property
      // Handle race condition where two requests try to create the same log at once
      if (error.code === 'P2002') {
        console.log(
          '[MoviesService] Race condition in logView, waiting and retrying...',
        );
        // Wait for the other request to finish creating the record
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Find the existing record
        const existing = await this.prisma.viewLog.findFirst({
          where: { movieId, date: today },
        });

        if (existing) {
          // Update by ID
          return this.prisma.viewLog.update({
            where: { id: existing.id },
            data: { views: { increment: 1 } },
          });
        } else {
          // Still not found? Just ignore to avoid crashing UX
          console.warn(
            '[MoviesService] View log not found after retry, ignoring',
          );
          return null;
        }
      }
      console.error('[MoviesService] logView failed:', error);
      throw error;
    }
  }

  // ===== WATCHLIST =====
  async toggleWatchlist(userId: number, movieId: number) {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    if (existing) {
      await this.prisma.watchlist.delete({
        where: { id: existing.id },
      });
      return { added: false };
    }

    await this.prisma.watchlist.create({
      data: { userId, movieId },
    });
    return { added: true };
  }

  async getWatchlist(userId: number) {
    const watchlist = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return watchlist.map((item) => item.movie);
  }

  async checkInWatchlist(userId: number, movieId: number) {
    const item = await this.prisma.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });
    return { inWatchlist: !!item };
  }
}
