import apiClient, { backendApiClient } from '../config/apiClient';

const movieService = {
    // Get list of films (category, latest, etc.)
    getFilms: async (endpoint, page = 1) => {
        try {
            const response = await apiClient.get(`/films/${endpoint}?page=${page}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching films:', error);
            throw error;
        }
    },

    // Get details of a specific film
    getFilmDetail: async (slug) => {
        try {
            const response = await apiClient.get(`/film/${slug}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching film detail:', error);
            throw error;
        }
    },

    // Search films
    searchFilms: async (keyword, page = 1, filters = {}) => {
        try {
            const { type, genre, year, country } = filters;
            let url = `/movies/search?keyword=${keyword}&page=${page}`;
            if (type) url += `&type=${type}`;
            if (genre) url += `&genre=${encodeURIComponent(genre)}`;
            if (year) url += `&year=${year}`;
            if (country) url += `&country=${encodeURIComponent(country)}`;

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error searching films:", error);
            throw error;
        }
    },

    // Recommendations
    getSimilarMovies: async (movieId, limit = 10) => {
        try {
            const response = await apiClient.get(`/recommendations/similar/${movieId}?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching similar movies:", error);
            return [];
        }
    },

    getTrendingMovies: async (limit = 10) => {
        try {
            const response = await apiClient.get(`/recommendations/trending?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching trending movies:", error);
            return [];
        }
    },

    getForYouMovies: async (limit = 10) => {
        try {
            const response = await apiClient.get(`/recommendations/for-you?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching personal recommendations:", error);
            return [];
        }
    },

    // ===== WATCHLIST =====
    getWatchlist: async () => {
        try {
            const response = await backendApiClient.get('/movies/watchlist');
            return response.data;
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            throw error;
        }
    },

    toggleWatchlist: async (movieId) => {
        try {
            const response = await backendApiClient.post(`/movies/${movieId}/watchlist`);
            return response.data;
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            throw error;
        }
    }
};

export default movieService;
