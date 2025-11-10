import apiClient from "./apiClient";

export const getFilms = async (endpoint, page = 1) => {
  try {
    const res = await apiClient.get(`/films/${endpoint}?page=${page}`);
    return res.data;
  } catch (err) {
    console.error("Không thể tải films:", err);
    throw err;
  }
};
