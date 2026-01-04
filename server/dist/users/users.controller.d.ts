import { Request } from 'express';
import { UsersService } from './users.service';
interface JwtUser {
    userId: number;
    email: string;
    role: string;
}
interface AuthenticatedRequest extends Request {
    user: JwtUser;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<{
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
    updateProfile(req: AuthenticatedRequest, data: {
        name?: string;
        avatar?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string | null;
        avatar: string | null;
        role: string;
    }>;
    changePassword(req: AuthenticatedRequest, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getWatchHistory(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
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
    saveWatchProgress(req: AuthenticatedRequest, data: {
        movieId: number | string;
        episodeId?: number | string;
        progress?: number;
        movieData?: any;
        episodeData?: any;
    }): Promise<{
        id: number;
        updatedAt: Date;
        userId: number;
        movieId: number;
        episodeId: number | null;
        progress: number;
        watchedAt: Date;
    }>;
    getFavorites(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
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
    isFavorite(req: AuthenticatedRequest, movieId: string): Promise<{
        isFavorite: boolean;
    }>;
    addFavorite(req: AuthenticatedRequest, movieId: string): Promise<{
        message: string;
    }>;
    removeFavorite(req: AuthenticatedRequest, movieId: string): Promise<{
        message: string;
    }>;
}
export {};
