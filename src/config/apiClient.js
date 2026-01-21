import axios from "axios";
import { getAccessToken, setAccessToken } from "@/utils/cookies";

const rawBackendUrl = process.env.REACT_APP_BACKEND_URL || "";
const normalizedBackendUrl = (() => {
    if (!rawBackendUrl) return "";
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
        return rawBackendUrl.replace(/^http:\/\//i, "https://");
    }
    return rawBackendUrl;
})();
const backendBaseUrl = normalizedBackendUrl ? `${normalizedBackendUrl}/api` : "/api";

// =======================================
// EXTERNAL API - Movie Data
// =======================================
export const movieApiClient = axios.create({
    baseURL: process.env.REACT_APP_MOVIE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

movieApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`[MovieAPI] Request failed:`, error.config?.url, error);
        return Promise.reject(error);
    },
);

// =======================================
// INTERNAL API - Backend (NestJS)
// =======================================
export const backendApiClient = axios.create({
    baseURL: backendBaseUrl,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add JWT token from cookies to backend requests
backendApiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject Maintenance Token if exists
    const maintenanceToken = localStorage.getItem("maintenance_token");
    if (maintenanceToken) {
        config.headers["x-maintenance-token"] = maintenanceToken;
    }

    return config;
});

// Response interceptor with auto-refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

backendApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return backendApiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await backendApiClient.post("/auth/refresh");
                const { access_token } = response.data;

                setAccessToken(access_token); // Use cookies instead of localStorage
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);
                return backendApiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                window.location.href = "/dang-nhap";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle Maintenance Mode (503)
        if (error.response?.status === 503) {
            if (!window.location.pathname.includes("/bao-tri") && !window.location.pathname.includes("/admin")) {
                window.location.href = "/bao-tri";
            }
        }

        return Promise.reject(error);
    },
);

export default movieApiClient;
