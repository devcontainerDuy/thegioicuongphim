import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, setAccessToken, removeAccessToken } from '@/utils/cookies';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => getAccessToken());
    const [loading, setLoading] = useState(true);

    // Fetch user profile on mount if token exists
    const fetchProfile = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include' // Include cookies in request
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                // Token invalid
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // Store in cookie instead of localStorage
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);

        return data;
    };

    const register = async (email, password, name) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
        }

        // Store in cookie instead of localStorage
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);

        return data;
    };

    const logout = () => {
        removeAccessToken();
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile: fetchProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

