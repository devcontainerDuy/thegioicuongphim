import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.url) {
      console.error(`[API] Request failed: ${error.config.url}`, error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
