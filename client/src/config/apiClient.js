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

// Add JWT token to backend requests (using js-cookie)
backendApiClient.interceptors.request.use((config) => {
  // Import dynamically to avoid circular deps
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  if (token) {
    config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
  }
  return config;
});

backendApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[BackendAPI] Request failed:`, error.config?.url, error);
    // Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);

export default movieApiClient;
