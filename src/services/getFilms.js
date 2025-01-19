import axios from "axios";

export const getFilms = async (endpoint, page = 1) => {
  return await axios
    .get(process.env.REACT_APP_API_URL + `/films/${endpoint}?page=${page}`)
    .then((res) => res.data.items)
    .catch((err) => {
      console.error("Không thể tải films:", err);
      throw err;
    });
};
