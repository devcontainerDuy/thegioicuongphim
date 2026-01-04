import { PrismaService } from '../prisma/prisma.service';
import { MovieSyncData, EpisodeSyncData } from './dto/sync-data.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        avatar: string | null;
        role: string;
        createdAt: Date;
        _count: {
            watchHistory: number;
            favorites: number;
        };
    }>;
    updateProfile(userId: number, data: {
        name?: string;
        avatar?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string | null;
        avatar: string | null;
        role: string;
    }>;
    changePassword(userId: number, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getWatchHistory(userId: number, page?: number, limit?: number): Promise<{
        items: ({
            movie: {
                id: number;
                name: string;
                slug: string;
                thumbUrl: string | null;
                currentEpisode: string | null;
            };
            episode: {
                id: number;
                name: string;
                slug: string;
            } | null;
        } & {
            id: number;
            updatedAt: Date;
            userId: number;
            movieId: number;
            episodeId: number | null;
            progress: number;
            watchedAt: Date;
        })[];
        paginate: {
            current_page: number;
            total_page: number;
            total_items: number;
        };
    }>;
    saveWatchProgress(userId: number, movieId: number | string, episodeId?: number | string, progress?: number, movieData?: MovieSyncData, episodeData?: EpisodeSyncData): Promise<{
        id: number;
        updatedAt: Date;
        userId: number;
        movieId: number;
        episodeId: number | null;
        progress: number;
        watchedAt: Date;
    }>;
    private syncMovie;
    private syncEpisode;
    getFavorites(userId: number, page?: number, limit?: number): Promise<{
        items: {
            id: number;
            name: string;
            slug: string;
            thumbUrl: string | null;
            quality: string | null;
            year: number | null;
            currentEpisode: string | null;
        }[];
        paginate: {
            current_page: number;
            total_page: number;
            total_items: number;
        };
    }>;
    addFavorite(userId: number, movieId: number): Promise<{
        message: string;
    }>;
    removeFavorite(userId: number, movieId: number): Promise<{
        message: string;
    }>;
    isFavorite(userId: number, movieId: number): Promise<{
        isFavorite: boolean;
    }>;
}
