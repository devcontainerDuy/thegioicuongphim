import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        email: string;
        name: string | null;
        id: number;
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
        email: string;
        name: string | null;
        id: number;
        avatar: string | null;
        role: string;
    }>;
    getWatchHistory(userId: number, page?: number, limit?: number): Promise<{
        items: ({
            movie: {
                name: string;
                id: number;
                slug: string;
                thumbUrl: string | null;
                currentEpisode: string | null;
            };
            episode: {
                name: string;
                id: number;
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
    saveWatchProgress(userId: number, movieId: number, episodeId?: number, progress?: number): Promise<{
        id: number;
        updatedAt: Date;
        userId: number;
        movieId: number;
        episodeId: number | null;
        progress: number;
        watchedAt: Date;
    }>;
    getFavorites(userId: number, page?: number, limit?: number): Promise<{
        items: {
            name: string;
            id: number;
            year: number | null;
            slug: string;
            thumbUrl: string | null;
            quality: string | null;
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
