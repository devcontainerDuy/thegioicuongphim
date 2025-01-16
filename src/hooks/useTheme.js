import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const applyTheme = (theme) => {
      if (theme === "auto") {
        const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.setAttribute("data-bs-theme", preferredTheme);
      } else {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    };

    applyTheme(theme);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (theme === "auto") {
        applyTheme("auto");
      }
    });
  }, [theme]);

  const toggleTheme = (newTheme) => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return [theme, toggleTheme];
}
