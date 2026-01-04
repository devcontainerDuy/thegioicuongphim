import apiClient from '../config/apiClient';

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
    searchFilms: async (keyword, limit = 10) => {
        try {
            const response = await apiClient.get(`/films/search?keyword=${keyword}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error searching films:", error);
            throw error;
        }
    },

    // Future: Get Trending, Get Recommendations...
};

export default movieService;
