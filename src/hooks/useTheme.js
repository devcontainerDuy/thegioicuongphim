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
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "auto") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
        root.setAttribute("data-bs-theme", systemTheme);
      } else {
        root.classList.add(theme);
        root.setAttribute("data-bs-theme", theme);
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
