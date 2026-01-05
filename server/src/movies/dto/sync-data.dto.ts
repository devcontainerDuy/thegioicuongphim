export interface MovieSyncData {
    slug: string;
    name: string;
    original_name?: string;
    originalName?: string; // Camelcase variant
    description?: string;
    thumb_url?: string;
    thumbUrl?: string; // Camelcase variant
    poster_url?: string;
    posterUrl?: string; // Camelcase variant
    quality?: string;
    language?: string;
    category?: {
        [key: string]: {
            list: Array<{ name: string }>;
        };
    };
    time?: string;
    director?: string;
    casts?: string | string[]; // Can be string or array
    current_episode?: string;
    currentEpisode?: string; // Camelcase variant
    total_episodes?: number | string;
    totalEpisodes?: number | string; // Camelcase variant
    genres?: string[];
    countries?: string[];
    year?: number | string;
    type?: string;
}

export interface EpisodeSyncData {
    slug: string;
    name: string;
    embed?: string;
    m3u8?: string;
    server_name?: string;
}
