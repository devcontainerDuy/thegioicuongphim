import { backendApiClient } from '@/config/apiClient';

const userService = {
    // ===== PROFILE =====
    getProfile: async () => {
        const response = await backendApiClient.get('/user/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await backendApiClient.post('/user/profile', data);
        return response.data;
    },

    changePassword: async (data) => {
        try {
            const response = await backendApiClient.post('/user/password', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to change password');
        }
    },

    // ===== FAVORITES =====
    getFavorites: async (page = 1, limit = 20) => {
        const response = await backendApiClient.get(`/user/favorites?page=${page}&limit=${limit}`);
        return response.data;
    },

    isFavorite: async (movieId) => {
        try {
            const response = await backendApiClient.get(`/user/favorites/${movieId}`);
            return response.data;
        } catch (error) {
            return { isFavorite: false };
        }
    },

    addFavorite: async (movieId) => {
        const response = await backendApiClient.post(`/user/favorites/${movieId}`);
        return response.data;
    },

    removeFavorite: async (movieId) => {
        const response = await backendApiClient.delete(`/user/favorites/${movieId}`);
        return response.data;
    },

    // ===== WATCH HISTORY =====
    getWatchHistory: async (page = 1, limit = 20) => {
        const response = await backendApiClient.get(`/user/history?page=${page}&limit=${limit}`);
        return response.data;
    },

    saveWatchProgress: async (movieId, episodeId, progress, movieData = null, episodeData = null) => {
        const response = await backendApiClient.post('/user/history', {
            movieId,
            episodeId,
            progress,
            movieData,
            episodeData
        });
        return response.data;
    }
};

export default userService;
