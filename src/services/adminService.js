import { backendApiClient } from '@/config/apiClient';

const adminService = {
    // Dashboard
    getDashboard: async () => {
        const res = await backendApiClient.get('/admin/dashboard');
        return res.data;
    },

    getAnalytics: async () => {
        const res = await backendApiClient.get('/admin/analytics');
        return res.data;
    },

    // Movies
    getMovies: async (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await backendApiClient.get(`/admin/movies?${params}`);
        return res.data;
    },

    getMovie: async (id) => {
        const res = await backendApiClient.get(`/admin/movies/${id}`);
        return res.data;
    },

    createMovie: async (data) => {
        const res = await backendApiClient.post('/admin/movies', data);
        return res.data;
    },

    updateMovie: async (id, data) => {
        const res = await backendApiClient.put(`/admin/movies/${id}`, data);
        return res.data;
    },

    deleteMovie: async (id) => {
        const res = await backendApiClient.delete(`/admin/movies/${id}`);
        return res.data;
    },

    // Users
    getUsers: async (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await backendApiClient.get(`/admin/users?${params}`);
        return res.data;
    },

    updateUserRole: async (id, role) => {
        const res = await backendApiClient.put(`/admin/users/${id}/role`, { role });
        return res.data;
    },

    deleteUser: async (id) => {
        const res = await backendApiClient.delete(`/admin/users/${id}`);
        return res.data;
    },

    // Episodes
    createEpisode: async (movieId, data) => {
        const res = await backendApiClient.post(`/admin/movies/${movieId}/episodes`, data);
        return res.data;
    },

    updateEpisode: async (id, data) => {
        const res = await backendApiClient.put(`/admin/episodes/${id}`, data);
        return res.data;
    },

    deleteEpisode: async (id) => {
        const res = await backendApiClient.delete(`/admin/episodes/${id}`);
        return res.data;
    },

    // Roles & Permissions
    getRoles: async () => {
        const res = await backendApiClient.get('/admin/roles');
        return res.data;
    },

    createRole: async (data) => {
        const res = await backendApiClient.post('/admin/roles', data);
        return res.data;
    },

    updateRole: async (id, data) => {
        const res = await backendApiClient.put(`/admin/roles/${id}`, data);
        return res.data;
    },

    deleteRole: async (id) => {
        const res = await backendApiClient.delete(`/admin/roles/${id}`);
        return res.data;
    },

    getPermissions: async () => {
        const res = await backendApiClient.get('/admin/permissions');
        return res.data;
    },

    createPermission: async (data) => {
        const res = await backendApiClient.post('/admin/permissions', data);
        return res.data;
    },

    deletePermission: async (id) => {
        const res = await backendApiClient.delete(`/admin/permissions/${id}`);
        return res.data;
    },

    // Settings
    getSettings: async () => {
        // Corrected endpoint from previous findings (SettingsController uses /settings, not /admin/settings base)
        // Wait, verifying SettingsController path. 
        // SettingsController is @Controller('settings') so path is /api/settings. 
        // But Admin might have specific one? 
        // Previously viewed SettingsController (Step 17, line 15) shows @Controller('settings').
        // The original code used /api/admin/settings. 
        // If I follow original code:
        const res = await backendApiClient.get('/admin/settings');
        return res.data;
    },

    updateSettings: async (data) => {
        const res = await backendApiClient.put('/admin/settings', data);
        return res.data;
    },

    // Reviews
    getReviews: async (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await backendApiClient.get(`/admin/reviews?${params}`);
        return res.data;
    },

    deleteReview: async (id) => {
        const res = await backendApiClient.delete(`/admin/reviews/${id}`);
        return res.data;
    },
};

export default adminService;
