const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
    // ===== PROFILE =====
    getProfile: async () => {
        const response = await fetch(`${API_URL}/api/user/profile`, {
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Failed to get profile');
        return response.json();
    },

    updateProfile: async (data) => {
        const response = await fetch(`${API_URL}/api/user/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // ===== FAVORITES =====
    getFavorites: async (page = 1, limit = 20) => {
        const response = await fetch(`${API_URL}/api/user/favorites?page=${page}&limit=${limit}`, {
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Failed to get favorites');
        return response.json();
    },

    isFavorite: async (movieId) => {
        const response = await fetch(`${API_URL}/api/user/favorites/${movieId}`, {
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) return { isFavorite: false };
        return response.json();
    },

    addFavorite: async (movieId) => {
        const response = await fetch(`${API_URL}/api/user/favorites/${movieId}`, {
            method: 'POST',
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Failed to add favorite');
        return response.json();
    },

    removeFavorite: async (movieId) => {
        const response = await fetch(`${API_URL}/api/user/favorites/${movieId}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Failed to remove favorite');
        return response.json();
    },

    // ===== WATCH HISTORY =====
    getWatchHistory: async (page = 1, limit = 20) => {
        const response = await fetch(`${API_URL}/api/user/history?page=${page}&limit=${limit}`, {
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Failed to get history');
        return response.json();
    },

    saveWatchProgress: async (movieId, episodeId, progress) => {
        const response = await fetch(`${API_URL}/api/user/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ movieId, episodeId, progress })
        });
        if (!response.ok) throw new Error('Failed to save progress');
        return response.json();
    }
};

export default userService;
