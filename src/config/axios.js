import axios from 'axios';
import { API_URL } from './env';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
