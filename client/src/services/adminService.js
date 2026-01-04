import { getAccessToken } from '@/utils/cookies';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeader = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminService = {
    // Dashboard
    getDashboard: async () => {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get dashboard');
        return res.json();
    },

    // Movies
    getMovies: async (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await fetch(`${API_URL}/api/admin/movies?${params}`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get movies');
        return res.json();
    },

    getMovie: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/movies/${id}`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get movie');
        return res.json();
    },

    createMovie: async (data) => {
        const res = await fetch(`${API_URL}/api/admin/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create movie');
        return res.json();
    },

    updateMovie: async (id, data) => {
        const res = await fetch(`${API_URL}/api/admin/movies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update movie');
        return res.json();
    },

    deleteMovie: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/movies/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to delete movie');
        return res.json();
    },

    // Users
    getUsers: async (page = 1, limit = 20, search = '') => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
        const res = await fetch(`${API_URL}/api/admin/users?${params}`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get users');
        return res.json();
    },

    updateUserRole: async (id, role) => {
        const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ role })
        });
        if (!res.ok) throw new Error('Failed to update role');
        return res.json();
    },

    deleteUser: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
    },

    // Episodes
    createEpisode: async (movieId, data) => {
        const res = await fetch(`${API_URL}/api/admin/movies/${movieId}/episodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create episode');
        return res.json();
    },

    updateEpisode: async (id, data) => {
        const res = await fetch(`${API_URL}/api/admin/episodes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update episode');
        return res.json();
    },

    deleteEpisode: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/episodes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to delete episode');
        return res.json();
    },

    // Roles & Permissions
    getRoles: async () => {
        const res = await fetch(`${API_URL}/api/admin/roles`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get roles');
        return res.json();
    },

    createRole: async (data) => {
        const res = await fetch(`${API_URL}/api/admin/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create role');
        return res.json();
    },

    updateRole: async (id, data) => {
        const res = await fetch(`${API_URL}/api/admin/roles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update role');
        return res.json();
    },

    deleteRole: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/roles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to delete role');
        return res.json();
    },

    getPermissions: async () => {
        const res = await fetch(`${API_URL}/api/admin/permissions`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get permissions');
        return res.json();
    },

    createPermission: async (data) => {
        const res = await fetch(`${API_URL}/api/admin/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create permission');
        return res.json();
    },

    deletePermission: async (id) => {
        const res = await fetch(`${API_URL}/api/admin/permissions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to delete permission');
        return res.json();
    },

    // Settings
    getSettings: async () => {
        const res = await fetch(`${API_URL}/api/admin/settings`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error('Failed to get settings');
        return res.json();
    },

    updateSettings: async (data) => {
        const res = await fetch(`${API_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    }
};

export default adminService;
