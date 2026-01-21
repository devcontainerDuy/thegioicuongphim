import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAccessToken, setAccessToken, removeAccessToken } from "@/utils/cookies";
import { backendApiClient } from "@/config/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
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
            const response = await backendApiClient.get("/user/profile");
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            // If 401 logic in apiClient fails (refresh failed), it will redirect/logout automatically.
            // But we can double check here if needed.
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (email, password) => {
        const response = await backendApiClient.post("/auth/login", { email, password });
        const data = response.data;

        // Store in cookie instead of localStorage
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);

        return data;
    };

    const register = async (email, password, name) => {
        const response = await backendApiClient.post("/auth/register", { email, password, name });
        const data = response.data;

        // Store in cookie instead of localStorage
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);

        return data;
    };

    const logout = async () => {
        try {
            await backendApiClient.post("/auth/logout");
        } catch (e) {
            // Ignore logout errors
        }
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
        refreshProfile: fetchProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
