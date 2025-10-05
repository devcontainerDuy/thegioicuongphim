import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge, Col, Container, Nav, Navbar, Offcanvas, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import Buttons from "components/ui/Buttons";
import NavLink from "components/ui/NavLink";
import { useTheme } from "hooks/useTheme";
import SearchForm from "./SearchFrom";
import Logo from "components/specific/Logo";
import ScrollToTop from "./ScrollToTop";

const navItems = [
  {
    to: "/",
    label: "Home",
    match: (location) => location.pathname === "/",
  },
  {
    to: "/danh-sach-phim",
    label: "Library",
    match: (location, params) => location.pathname === "/danh-sach-phim" && !params.get("sub"),
  },
  {
    to: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1",
    label: "Movies",
    match: (location, params) => location.pathname === "/danh-sach-phim" && params.get("sub") === "phim-le",
  },
  {
    to: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1",
    label: "Series",
    match: (location, params) => location.pathname === "/danh-sach-phim" && params.get("sub") === "phim-bo",
  },
];

const accountPopover = (
  <Popover id="header-account-popover" className="header-account-popover shadow">
    <Popover.Header as="h3" className="text-center fw-semibold text-uppercase mb-0">
      Account
    </Popover.Header>
    <Popover.Body className="p-0">
      <Nav className="flex-column">
        <NavLink to="/dang-nhap" className="px-4 py-2 border-bottom">
          Sign in
        </NavLink>
        <NavLink to="/dang-ky" className="px-4 py-2">
          Create account
        </NavLink>
      </Nav>
    </Popover.Body>
  </Popover>
);

function Header() {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const favoriteItemsRaw = useSelector((state) => state.favorites.items);
  const favoriteItems = useMemo(() => favoriteItemsRaw ?? [], [favoriteItemsRaw]);
  const favoriteCount = favoriteItems.length;
  const [theme] = useTheme();
  const [appliedTheme, setAppliedTheme] = useState(() => document.documentElement.getAttribute("data-bs-theme") || "light");

  useEffect(() => {
    if (theme === "auto") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const update = (event) => setAppliedTheme(event.matches ? "dark" : "light");

      setAppliedTheme(media.matches ? "dark" : "light");
      media.addEventListener("change", update);

      return () => media.removeEventListener("change", update);
    }

    setAppliedTheme(theme);
    return undefined;
  }, [theme]);

  const accountButtonVariant = appliedTheme === "dark" ? "outline-light" : "outline-dark";
  const heartIconClass = appliedTheme === "dark" ? "text-danger" : "text-body";

  const isActive = (item) => item.match(location, searchParams);

  return (
    <header className="app-header">
      <Navbar expand="lg" className="app-navbar" sticky="top">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <Logo />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="app-header-offcanvas" className="border-0 shadow-sm app-navbar-toggle" />

          <Navbar.Offcanvas id="app-header-offcanvas" placement="start" className="app-navbar-offcanvas">
            <Offcanvas.Header closeButton closeVariant={appliedTheme === "dark" ? "white" : undefined} className="border-bottom">
              <Offcanvas.Title>
                <Logo />
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Row className="align-items-center gy-3">
                <Col xs={12} lg={6} className="order-lg-1">
                  <Nav className="app-navbar-links flex-lg-row flex-column gap-lg-3 gap-2 text-uppercase">
                    {navItems.map((item) => (
                      <NavLink key={item.to} to={item.to} active={isActive(item)} className="px-lg-0 px-2">
                        {item.label}
                      </NavLink>
                    ))}
                  </Nav>
                </Col>
                <Col xs={12} lg={4} className="order-lg-2">
                  <SearchForm />
                </Col>
                <Col xs={12} lg={2} className="order-lg-3">
                  <Nav className="justify-content-lg-end align-items-center gap-3 app-navbar-actions">
                    <NavLink to="/danh-sach-yeu-thich" className="position-relative px-lg-0">
                      <i className={`bi bi-heart-fill ${heartIconClass}`} />
                      {favoriteCount > 0 && (
                        <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                          {favoriteCount}
                        </Badge>
                      )}
                    </NavLink>
                    <OverlayTrigger trigger="click" placement="bottom" overlay={accountPopover} rootClose>
                      <Buttons
                        type="button"
                        variant={accountButtonVariant}
                        className="rounded-pill d-flex align-items-center gap-2 px-3"
                        style={{ textTransform: "none" }}
                      >
                        <i className="bi bi-person-circle" />
                        <span className="d-none d-md-inline">Account</span>
                      </Buttons>
                    </OverlayTrigger>
                  </Nav>
                </Col>
              </Row>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <ScrollToTop />
    </header>
  );
}

export default Header;
