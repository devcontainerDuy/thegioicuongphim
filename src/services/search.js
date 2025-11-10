import apiClient from "./apiClient";
import { toSlug } from "utils/slugify";

export const searchFilms = async (keyword) => {
  const slugKeyword = toSlug(keyword);
  return await apiClient.get(`/films/search?keyword=${slugKeyword}`);
};
