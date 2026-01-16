import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MoviesService } from '../movies/movies.service';
import { User } from './entities/user.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Episode } from '../movies/entities/episode.entity';
import type {
  MovieSyncData,
  EpisodeSyncData,
} from '../movies/dto/sync-data.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WatchHistory)
    private watchHistoryRepository: Repository<WatchHistory>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    private moviesService: MoviesService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'], // Assuming you might want role details. If strictly select, use query builder or select: [...]
    });

    if (!user) throw new NotFoundException('User không tồn tại');

    // TypeORM doesn't natively support Prisma's _count in findOne easily without loading relations or using QB.
    // We can do separate counts or use loadRelationCountAndMap if we want to mimic it exactly,
    // or just fetch counts separately.
    const favoritesCount = await this.favoriteRepository.count({
      where: { userId },
    });
    const watchHistoryCount = await this.watchHistoryRepository.count({
      where: { userId },
    });

    // Return object matching the shape expected by frontend (User & {_count: ...})
    // NOTE: If frontend strictly expects `_count`, we construct it manually.
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      _count: {
        favorites: favoritesCount,
        watchHistory: watchHistoryCount,
      },
    };
  }

  async updateProfile(
    userId: number,
    data: { name?: string; avatar?: string },
  ) {
    await this.userRepository.update(userId, data);
    return this.getProfile(userId);
  }

  async changePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'], // select password specifically if it's hidden by default? In TypeORM Column({select: false}) hides it. Assuming it's visible or we select it.
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
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ===== WATCH HISTORY =====
  async getWatchHistory(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.watchHistoryRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { watchedAt: 'DESC' },
      relations: ['movie', 'episode'],
      // Selects: TypeORM returns full objects by default.
      // If we want specific fields for relation, we could use a query builder,
      // but finding and counting with relations is simpler for migration.
    });

    // Transform items to match expected output structure if needed, or leave as is.
    // Prisma `include: { movie: { select: ... } }` returned structure:
    // { ...history, movie: { ...selectedFields }, episode: { ...selectedFields } }
    // TypeORM returns:
    // { ...history, movie: { ...allFields }, episode: { ...allFields } }
    // This should be compatible unless sensitive fields exist.

    const formattedItems = items.map((item) => ({
      ...item,
      movie: item.movie
        ? {
            id: item.movie.id,
            slug: item.movie.slug,
            name: item.movie.name,
            thumbUrl: item.movie.thumbUrl,
            currentEpisode: item.movie.currentEpisode,
          }
        : null,
      episode: item.episode
        ? {
            id: item.episode.id,
            slug: item.episode.slug,
            name: item.episode.name,
          }
        : null,
    }));

    return {
      items: formattedItems,
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

      // 2. Sync Episode if needed
      const localEpisodeId = await this.syncEpisode(
        localMovieId,
        episodeId,
        episodeData,
      );

      // 3. Save History
      const existing = await this.watchHistoryRepository.findOne({
        where: {
          userId,
          movieId: localMovieId,
          ...(localEpisodeId ? { episodeId: localEpisodeId } : {}),
        },
      });

      if (existing) {
        await this.watchHistoryRepository.update(existing.id, {
          progress,
          watchedAt: new Date(),
        });
        return { ...existing, progress, watchedAt: new Date() }; // basic return
      }

      const newItem = this.watchHistoryRepository.create({
        userId,
        movieId: localMovieId,
        episodeId: localEpisodeId || null,
        progress,
      });
      return await this.watchHistoryRepository.save(newItem);
    } catch (err) {
      const error = err as Error;
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

    let episode = await this.episodeRepository.findOne({
      where: {
        movieId: localMovieId,
        slug: slug,
      },
    });

    if (!episode && data) {
      episode = this.episodeRepository.create({
        movieId: localMovieId,
        name: data.name,
        slug: data.slug,
        embedUrl: data.embed,
        m3u8Url: data.m3u8,
        sortOrder: 0,
      });
      episode = await this.episodeRepository.save(episode);
    }

    return episode ? episode.id : null;
  }

  // ===== FAVORITES =====
  async getFavorites(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['movie'],
    });

    // Project fields like in Prisma select
    const formattedMovies = items.map((fav) => {
      if (!fav.movie) return null;
      return {
        id: fav.movie.id,
        slug: fav.movie.slug,
        name: fav.movie.name,
        thumbUrl: fav.movie.thumbUrl,
        quality: fav.movie.quality,
        currentEpisode: fav.movie.currentEpisode,
        year: fav.movie.year,
      };
    });

    return {
      items: formattedMovies.filter(Boolean),
      paginate: {
        current_page: page,
        total_page: Math.ceil(total / limit),
        total_items: total,
      },
    };
  }

  async addFavorite(
    userId: number,
    movieId: number | string,
    movieData?: MovieSyncData,
  ) {
    // Auto-sync movie to database first
    const localMovieId = await this.moviesService.syncMovie(movieId, movieData);

    const existing = await this.favoriteRepository.findOne({
      where: { userId, movieId: localMovieId },
    });

    if (existing) {
      return { message: 'Phim đã có trong danh sách yêu thích' };
    }

    const newFav = this.favoriteRepository.create({
      userId,
      movieId: localMovieId,
    });
    await this.favoriteRepository.save(newFav);

    return { message: 'Đã thêm vào danh sách yêu thích' };
  }

  async removeFavorite(userId: number, movieId: number | string) {
    // Resolve movie ID (might be string/hex)
    const localMovieId = await this.moviesService.resolveMovieId(
      movieId,
      false,
    );
    if (!localMovieId) throw new NotFoundException('Phim không tồn tại');

    const result = await this.favoriteRepository.delete({
      userId,
      movieId: localMovieId,
    });

    if (result.affected === 0)
      throw new NotFoundException('Phim không có trong danh sách yêu thích');

    return { message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  async isFavorite(userId: number, movieId: number | string) {
    // Resolve movie ID (might be string/hex)
    const localMovieId = await this.moviesService.resolveMovieId(
      movieId,
      false,
    );
    if (!localMovieId) return { isFavorite: false };

    const existing = await this.favoriteRepository.findOne({
      where: { userId, movieId: localMovieId },
    });
    return { isFavorite: !!existing };
  }
}
