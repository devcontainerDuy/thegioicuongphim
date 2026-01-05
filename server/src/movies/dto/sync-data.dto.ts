export interface MovieSyncData {
    slug: string;
    name: string;
    original_name?: string;
    description?: string;
    thumb_url?: string;
    poster_url?: string;
    quality?: string;
    language?: string;
    category?: {
        [key: string]: {
            list: Array<{ name: string }>;
        };
    };
    time?: string;
    director?: string;
    casts?: string;
    current_episode?: string;
    total_episodes?: number;
}

export interface EpisodeSyncData {
    slug: string;
    name: string;
    embed?: string;
    m3u8?: string;
    server_name?: string;
}
