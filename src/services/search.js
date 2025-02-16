import axios from "axios";
import { toSlug } from "utils/slugify";

export const searchFilms = async (keyword) => {
  const slugKeyword = toSlug(keyword);
  return await axios.get(process.env.REACT_APP_API_URL + "/films/search?keyword=" + slugKeyword);
};
