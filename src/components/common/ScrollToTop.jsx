import Buttons from "components/ui/Buttons";
import Dropdowns from "components/ui/Dropdowns";
import { useTheme } from "hooks/useTheme";
import { scrollToTop } from "lib/scroll";
import React from "react";

function ScrollToTop() {
  const [theme, toggleTheme] = useTheme();

  const handleThemeClick = (newTheme) => {
    toggleTheme(newTheme);
  };

  return (
    <>
      {/* Hoặc class position-fixed bottom-0 start-0 */}
      <div className="fixed-bottom m-3">
        {/* Lên đầu trang */}
        <Buttons className="mb-2 border border-body" variant="outline-body" type="button" title="Lên đầu trang" onClick={scrollToTop}>
          <i className="bi bi-chevron-up" />
        </Buttons>
        {/* Lên đầu trang */}
        <Dropdowns
          className={`bd-mode-toggle dropdown-custom ${theme === "light" ? "btn-dark" : "btn-light"}`}
          id="bd-theme-text"
          trigger={<i className={"bi bi-" + (theme === "light" ? "sun-fill" : "moon-stars-fill")} />}
        >
          <Dropdowns.Item
            onClick={() => handleThemeClick("light")}
            className={`d-flex align-items-center ${theme === "light" ? "active" : ""}`}
            data-bs-theme-value="light"
            aria-pressed={theme === "light"}
          >
            <i className="bi bi-sun-fill me-2 opacity-50" width="1em" height="1em" />
            Sáng
          </Dropdowns.Item>
          <Dropdowns.Item
            onClick={() => handleThemeClick("dark")}
            className={`d-flex align-items-center ${theme === "dark" ? "active" : ""}`}
            data-bs-theme-value="dark"
            aria-pressed={theme === "dark"}
          >
            <i className="bi bi-moon-stars-fill me-2 opacity-50" width="1em" height="1em" />
            Tối
          </Dropdowns.Item>
          <Dropdowns.Item
            onClick={() => handleThemeClick("auto")}
            className={`d-flex align-items-center ${theme === "auto" ? "active" : ""}`}
            data-bs-theme-value="auto"
            aria-pressed={theme === "auto"}
          >
            <i className="me-2 bi bi-circle-half opacity-50" width="1em" height="1em" />
            Tự động
          </Dropdowns.Item>
        </Dropdowns>
      </div>
    </>
  );
}

export default ScrollToTop;
