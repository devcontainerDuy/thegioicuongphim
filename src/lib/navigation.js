import { useLocation } from "react-router-dom";

export const useIsActive = (path) => {
  const location = useLocation();

  return location.pathname === path;
};
