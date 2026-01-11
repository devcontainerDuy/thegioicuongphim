import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MoviesService } from '../movies/movies.service';
import type {
  MovieSyncData,
  EpisodeSyncData,
} from '../movies/dto/sync-data.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private moviesService: MoviesService,
  ) {}

  async getProfile(userId: number) {
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
            watchHistory: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async updateProfile(
    userId: number,
    data: { name?: string; avatar?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });
  }

  async changePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User không tồn tại');

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ===== WATCH HISTORY =====
  async getWatchHistory(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { watchedAt: 'desc' },
        include: {
          movie: {
            select: {
              id: true,
              slug: true,
              name: true,
              thumbUrl: true,
              currentEpisode: true,
            },
          },
          episode: {
            select: { id: true, slug: true, name: true },
          },
        },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);

    return {
      items,
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async saveWatchProgress(
    userId: number,
    movieId: number | string,
    episodeId?: number | string,
    progress = 0,
    movieData?: MovieSyncData,
    episodeData?: EpisodeSyncData,
  ) {
    try {
      // 1. Sync Movie if needed - Delegated to MoviesService
      const localMovieId = await this.moviesService.syncMovie(
        movieId,
        movieData,
      );

      // 2. Sync Episode if needed - Since syncEpisode is localized to users historically,
      // but we want consistency, we'll keep it here but we could also move it to MoviesService.
      // For now, let's just use a simplified version here.
      const localEpisodeId = await this.syncEpisode(
        localMovieId,
        episodeId,
        episodeData,
      );

      // 3. Save History
      const existing = await this.prisma.watchHistory.findFirst({
        where: { userId, movieId: localMovieId, episodeId: localEpisodeId },
      });

      if (existing) {
        return await this.prisma.watchHistory.update({
          where: { id: existing.id },
          data: { progress, watchedAt: new Date() },
        });
      }

      return await this.prisma.watchHistory.create({
        data: {
          userId,
          movieId: localMovieId,
          episodeId: localEpisodeId,
          progress,
        },
      });
    } catch (error) {
      console.error('Error in saveWatchProgress:', error);
      throw new BadRequestException(
        `Failed to save progress: ${error.message} `,
      );
    }
  }

  // Helper: Sync Episode (Find or Create)
  private async syncEpisode(
    localMovieId: number,
    idOrSlug: number | string | undefined,
    data?: EpisodeSyncData,
  ): Promise<number | null> {
    if (!data && !idOrSlug) return null;

    // If passed a number and no data, assume local ID
    if (typeof idOrSlug === 'number' || (idOrSlug && !isNaN(Number(idOrSlug))))
      return Number(idOrSlug);

    const slug = data?.slug || idOrSlug?.toString();
    if (!slug) return null;

    let episode = await this.prisma.episode.findUnique({
      where: {
        movieId_slug: {
          movieId: localMovieId,
          slug: slug,
        },
      },
    });

    if (!episode && data) {
      episode = await this.prisma.episode.create({
        data: {
          movieId: localMovieId,
          name: data.name,
          slug: data.slug,
          embedUrl: data.embed,
          m3u8Url: data.m3u8,
          sortOrder: 0,
        },
      });
    }

    return episode ? episode.id : null;
  }

  // ===== FAVORITES =====
  async getFavorites(userId: number, page = 1, limit = 20) {
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
              id: true,
              slug: true,
              name: true,
              thumbUrl: true,
              quality: true,
              currentEpisode: true,
              year: true,
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map((fav) => fav.movie),
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async addFavorite(userId: number, movieId: number | string, movieData?: any) {
    // Auto-sync movie to database first
    const localMovieId = await this.moviesService.syncMovie(movieId, movieData);

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_movieId: { userId, movieId: localMovieId } },
    });

    if (existing) {
      return { message: 'Phim đã có trong danh sách yêu thích' };
    }

    await this.prisma.favorite.create({
      data: { userId, movieId: localMovieId },
    });

    return { message: 'Đã thêm vào danh sách yêu thích' };
  }

  async removeFavorite(userId: number, movieId: number | string) {
    // Resolve movie ID (might be string/hex)
    const localMovieId = await this.moviesService.resolveMovieId(
      movieId,
      false,
    );
    if (!localMovieId) throw new NotFoundException('Phim không tồn tại');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_movieId: { userId, movieId: localMovieId } },
    });

    if (!existing)
      throw new NotFoundException('Phim không có trong danh sách yêu thích');

    await this.prisma.favorite.delete({
      where: { userId_movieId: { userId, movieId: localMovieId } },
    });

    return { message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  async isFavorite(userId: number, movieId: number | string) {
    // Resolve movie ID (might be string/hex)
    const localMovieId = await this.moviesService.resolveMovieId(
      movieId,
      false,
    );
    if (!localMovieId) return { isFavorite: false };

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_movieId: { userId, movieId: localMovieId } },
    });
    return { isFavorite: !!existing };
  }
}
