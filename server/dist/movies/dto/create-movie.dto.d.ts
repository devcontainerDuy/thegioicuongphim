export declare enum MovieType {
    MOVIE = "movie",
    SERIES = "series"
}
export declare class CreateMovieDto {
    slug: string;
    name: string;
    originalName?: string;
    description?: string;
    thumbUrl?: string;
    posterUrl?: string;
    quality?: string;
    language?: string;
    year?: number;
    type?: MovieType;
    totalEpisodes?: number;
    currentEpisode?: string;
    time?: string;
}
