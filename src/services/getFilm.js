import axios from "axios";

export const getFilm = async (endpoint) => {
  return await axios
    .get(process.env.REACT_APP_API_URL + `/film/${endpoint}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Không thể tải films:", err);
      throw err;
    });
};
