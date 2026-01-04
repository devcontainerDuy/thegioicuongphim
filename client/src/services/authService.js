import { backendApiClient as apiClient } from '@/config/apiClient';
import { setAccessToken, getAccessToken, removeAccessToken } from '@/utils/cookies';

const authService = {
    /**
     * Login with email/password
     * @param {string} email 
     * @param {string} password 
     * @param {boolean} remember - Enable "Remember Me" for persistent login
     */
    login: async (email, password, remember = false) => {
        const response = await apiClient.post('/auth/login', { email, password, remember });

        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setAccessToken(response.data.access_token);
        }

        return response.data;
    },

    /**
     * Register new user
     */
    register: async (email, password, name) => {
        const response = await apiClient.post('/auth/register', { email, password, name });

        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setAccessToken(response.data.access_token);
        }

        return response.data;
    },

    /**
     * Refresh access token using HttpOnly refresh_token cookie
     */
    refresh: async () => {
        try {
            const response = await apiClient.post('/auth/refresh');

            if (response.data.access_token) {
                setAccessToken(response.data.access_token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }

            return response.data;
        } catch (error) {
            // If refresh fails, logout user
            authService.clearSessionData();
            throw error;
        }
    },

    /**
     * Login with remember token (auto-login)
     */
    loginWithRemember: async () => {
        try {
            const response = await apiClient.post('/auth/remember');

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setAccessToken(response.data.access_token);
            }

            return response.data;
        } catch (error) {
            authService.clearSessionData();
            throw error;
        }
    },

    /**
     * Logout current session
     */
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        authService.clearSessionData();
    },

    /**
     * Logout from all devices
     */
    logoutAll: async () => {
        try {
            await apiClient.post('/auth/logout-all');
        } catch (error) {
            console.error('Logout all error:', error);
        }
        authService.clearSessionData();
    },

    /**
     * Get active sessions
     */
    getSessions: async () => {
        const response = await apiClient.get('/auth/sessions');
        return response.data;
    },

    /**
     * Revoke a specific session
     */
    revokeSession: async (sessionId) => {
        const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
        return response.data;
    },

    /**
     * Bulk revoke sessions
     * @param {number[]} sessionIds
     */
    bulkRevokeSessions: async (sessionIds) => {
        const response = await apiClient.delete('/auth/sessions-bulk', { data: { ids: sessionIds } });
        return response.data;
    },

    /**
     * Clear session data (local storage user and cookie token)
     */
    clearSessionData: () => {
        localStorage.removeItem('user');
        removeAccessToken();
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get access token from cookies
     */
    getAccessToken: () => {
        return getAccessToken();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!authService.getAccessToken();
    }
};

export default authService;

