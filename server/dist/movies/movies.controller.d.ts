import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
export declare class MoviesController {
    private readonly moviesService;
    constructor(moviesService: MoviesService);
    findAll(page?: string, limit?: string, type?: string): Promise<{
        items: ({
            _count: {
                episodes: number;
            };
        } & {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            year: number | null;
            slug: string;
            originalName: string | null;
            description: string | null;
            thumbUrl: string | null;
            posterUrl: string | null;
            quality: string | null;
            language: string | null;
            type: string;
            totalEpisodes: number;
            currentEpisode: string | null;
            time: string | null;
            views: number;
            status: string;
        })[];
        paginate: {
            current_page: number;
            total_page: number;
            total_items: number;
            items_per_page: number;
        };
    }>;
    search(keyword: string, page?: string, limit?: string): Promise<{
        items: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            year: number | null;
            slug: string;
            originalName: string | null;
            description: string | null;
            thumbUrl: string | null;
            posterUrl: string | null;
            quality: string | null;
            language: string | null;
            type: string;
            totalEpisodes: number;
            currentEpisode: string | null;
            time: string | null;
            views: number;
            status: string;
        }[];
        paginate: {
            current_page: number;
            total_page: number;
            total_items: number;
            items_per_page: number;
        };
    }>;
    findOne(slug: string): Promise<{
        episodes: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            sortOrder: number;
            movieId: number;
            embedUrl: string | null;
            m3u8Url: string | null;
        }[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        year: number | null;
        slug: string;
        originalName: string | null;
        description: string | null;
        thumbUrl: string | null;
        posterUrl: string | null;
        quality: string | null;
        language: string | null;
        type: string;
        totalEpisodes: number;
        currentEpisode: string | null;
        time: string | null;
        views: number;
        status: string;
    }>;
    create(createMovieDto: CreateMovieDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        year: number | null;
        slug: string;
        originalName: string | null;
        description: string | null;
        thumbUrl: string | null;
        posterUrl: string | null;
        quality: string | null;
        language: string | null;
        type: string;
        totalEpisodes: number;
        currentEpisode: string | null;
        time: string | null;
        views: number;
        status: string;
    }>;
    update(slug: string, updateMovieDto: UpdateMovieDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        year: number | null;
        slug: string;
        originalName: string | null;
        description: string | null;
        thumbUrl: string | null;
        posterUrl: string | null;
        quality: string | null;
        language: string | null;
        type: string;
        totalEpisodes: number;
        currentEpisode: string | null;
        time: string | null;
        views: number;
        status: string;
    }>;
    remove(slug: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        year: number | null;
        slug: string;
        originalName: string | null;
        description: string | null;
        thumbUrl: string | null;
        posterUrl: string | null;
        quality: string | null;
        language: string | null;
        type: string;
        totalEpisodes: number;
        currentEpisode: string | null;
        time: string | null;
        views: number;
        status: string;
    }>;
}
