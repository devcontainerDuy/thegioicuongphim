import apiClient from "./apiClient";

export const getFilm = async (endpoint) => {
  try {
    const res = await apiClient.get(`/film/${endpoint}`);
    return res.data;
  } catch (err) {
    console.error("Không thể tải film:", err);
    throw err;
  }
};
