export const endpoint = (point) => {
  switch (point) {
    case 0:
      return "phim-moi-cap-nhat";
    case 1:
      return "phim-le";
    case 2:
      return "phim-bo";
    case 3:
      return "tv-shows";
    case 4:
      return "quoc-gia";
    default:
      return "phim-moi-cap-nhat";
  }
};
