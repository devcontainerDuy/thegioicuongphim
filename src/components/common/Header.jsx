import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { useSelector } from "react-redux";
import NavLink from "components/ui/NavLink";
import { useTheme } from "hooks/useTheme";
import SearchForm from "./SearchFrom";
import Logo from "components/specific/Logo";
import ScrollToTop from "./ScrollToTop";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Trang chủ",
    isActive: (location) => location.pathname === "/",
  },
  {
    to: "/danh-sach-phim",
    label: "Danh sách phim",
    isActive: (location, params) => location.pathname === "/danh-sach-phim" && !params.get("sub"),
  },
  {
    to: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1",
    label: "Phim lẻ",
    isActive: (location, params) => location.pathname === "/danh-sach-phim" && params.get("sub") === "phim-le",
  },
  {
    to: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1",
    label: "Phim bộ",
    isActive: (location, params) => location.pathname === "/danh-sach-phim" && params.get("sub") === "phim-bo",
  },
];

function Header() {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const favoriteItems = useSelector((state) => state.favorites.items) || [];
  const favoriteCount = favoriteItems.length;
  const [theme] = useTheme();
  const [appliedTheme, setAppliedTheme] = useState(() => document.documentElement.getAttribute("data-bs-theme") || "light");

  useEffect(() => {
    if (theme === "auto") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const update = (event) => setAppliedTheme(event.matches ? "dark" : "light");

      setAppliedTheme(media.matches ? "dark" : "light");

      if (media.addEventListener) {
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
      }

      media.addListener(update);
      return () => media.removeListener(update);
    }

    setAppliedTheme(theme);
    return undefined;
  }, [theme]);

  const heartIconClass = appliedTheme === "dark" ? "text-danger" : "text-body";

  const navLinks = useMemo(
    () =>
      NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} active={item.isActive(location, searchParams)} className="app-navbar-link">
          {item.label}
        </NavLink>
      )),
    [location, searchParams]
  );

  return (
    <header className="app-header">
      <Navbar expand="lg" className="app-navbar" sticky="top">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <Logo />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="app-header-nav" className="border-0 shadow-sm app-navbar-toggle" aria-label="Mở menu điều hướng" />

          <Navbar.Collapse id="app-header-nav" className="app-navbar-collapse">
            <Nav className="app-navbar-links gap-2 gap-lg-4 me-auto">{navLinks}</Nav>
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 app-navbar-actions">
              <div className="w-100 w-lg-auto app-navbar-search">
                <SearchForm />
              </div>
              <NavLink to="/danh-sach-yeu-thich" className="position-relative px-0 favorites-link" aria-label="Danh sách yêu thích">
                <i className={`bi bi-heart-fill ${heartIconClass}`} />
                {favoriteCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                    {favoriteCount}
                  </Badge>
                )}
              </NavLink>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <ScrollToTop />
    </header>
  );
}

export default Header;
