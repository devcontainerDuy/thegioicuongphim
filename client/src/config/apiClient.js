import axios from "axios";

// =======================================
// EXTERNAL API - Movie Data
// =======================================
export const movieApiClient = axios.create({
  baseURL: process.env.REACT_APP_MOVIE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

movieApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[MovieAPI] Request failed:`, error.config?.url, error);
    return Promise.reject(error);
  }
);

// =======================================
// INTERNAL API - Backend (NestJS)
// =======================================
export const backendApiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to backend requests (using js-cookie) and Maintenance Token
backendApiClient.interceptors.request.use((config) => {
  // Import dynamically to avoid circular deps
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  if (token) {
    config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
  }

  // Inject Maintenance Token if exists (from localStorage or cookie)
  const maintenanceToken = localStorage.getItem('maintenance_token') ||
    document.cookie.split('; ').find(row => row.startsWith('maintenance_token='))?.split('=')[1];

  if (maintenanceToken) {
    config.headers['x-maintenance-token'] = maintenanceToken;
  }

  return config;
});

backendApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error(`[BackendAPI] Request failed:`, error.config?.url, error);

    // Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/dang-nhap';
    }

    // Handle Maintenance Mode (503)
    if (error.response?.status === 503) {
      // Only redirect if not already on maintenance page to avoid loops
      if (!window.location.pathname.includes('/bao-tri') && !window.location.pathname.includes('/admin')) {
        window.location.href = '/bao-tri';
      }
    }

    return Promise.reject(error);
  }
);

export default movieApiClient;
