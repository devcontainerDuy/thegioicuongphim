const STORAGE_KEY = 'cw_history';

export const saveWatchHistory = (film, episode, progress = 0) => {
    try {
        const history = getWatchHistory();
        const existingIndex = history.findIndex(item => item.film_slug === film.slug);

        const newItem = {
            film_name: film.name,
            film_slug: film.slug,
            film_thumb: film.thumb_url || film.poster_url,
            episode_slug: episode.slug,
            episode_name: episode.name,
            progress: progress, // percentage or timestamp
            updated_at: Date.now()
        };

        if (existingIndex > -1) {
            history[existingIndex] = newItem;
        } else {
            history.unshift(newItem);
        }

        // Limit to 20 items
        if (history.length > 20) history.pop();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Error saving watch history:", error);
    }
};

export const getWatchHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading watch history:", error);
        return [];
    }
};
