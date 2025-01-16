import NavLink from "components/ui/NavLink";
import { useIsActive } from "lib/navigation";
import { useTheme } from "hooks/useTheme";
import { scrollToTop } from "lib/scroll";
import { Button, Col, Container, Dropdown, Nav, Navbar, Offcanvas, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchForm from "./SearchFrom";

function Header() {
  const favoriteCount = useSelector((state) => state.favorites.items.length);
  const [theme, toggleTheme] = useTheme();

  const handleThemeClick = (newTheme) => {
    toggleTheme(newTheme);
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3" className="text-center">
        Tài khoản
      </Popover.Header>
      <Popover.Body className="p-2 text-center">
        <Nav className="flex-column">
          <Nav.Item>
            <Link to="/dang-nhap" className="nav-link">
              Đăng nhập
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/dang-ky" className="nav-link">
              Đăng ký
            </Link>
          </Nav.Item>
        </Nav>
      </Popover.Body>
    </Popover>
  );

  return (
    <header className="header fixed-top border-1 border-bottom border-body">
      <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
        <Container>
          <Navbar.Brand href="/">
            <div className="d-flex align-items-center text-uppercase border border-success rounded">
              <div className="fw-bold text-bg-danger px-2 rounded-start">
                <span>THẾ</span>
              </div>
              <div className="fw-bold bg-secondary text-warning px-2">
                <span>GIỚI</span>
              </div>
              <div className="fw-bold text-bg-danger px-2">
                <span>CUỒNG</span>
              </div>
              <div className="fw-bold bg-secondary text-warning px-2 rounded-end">
                <span>PHIM</span>
              </div>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="offcanvasNavbar-expand" />

          <Navbar.Offcanvas id="offcanvasNavbar-expand" aria-labelledby="offcanvasNavbarLabel-expand" placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand">
                <Navbar.Brand href="/">
                  <div className="d-flex align-items-center text-uppercase border border-success rounded">
                    <div className="fw-bold text-bg-danger px-2 rounded-start">
                      <span>THẾ</span>
                    </div>
                    <div className="fw-bold bg-secondary text-warning px-2">
                      <span>GIỚI</span>
                    </div>
                    <div className="fw-bold text-bg-danger px-2">
                      <span>CUỒNG</span>
                    </div>
                    <div className="fw-bold bg-secondary text-warning px-2 rounded-end">
                      <span>PHIM</span>
                    </div>
                  </div>
                </Navbar.Brand>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="d-flex justify-content-end flex-grow-1">
                <Row className="w-100">
                  <Col xs={12} xl={5}>
                    <Nav className="me-auto fw-bold">
                      <NavLink to="/" active={useIsActive("/")}>
                        Trang chủ
                      </NavLink>
                      <NavLink to="/danh-sach-phim" active={useIsActive("/danh-sach-phim")}>
                        Danh sách phim
                      </NavLink>
                      <NavLink to="/danh-sach-phim/phim-le" active={useIsActive("/danh-sach-phim/phim-le")}>
                        Phim lẻ
                      </NavLink>
                      <NavLink to="/danh-sach-phim/phim-bo" active={useIsActive("/danh-sach-phim/phim-bo")}>
                        Phim bộ
                      </NavLink>
                    </Nav>
                  </Col>
                  <Col xs={12} xl={4}>
                    {/* Tìm kiếm */}
                    <SearchForm />
                    {/* Tìm kiếm */}
                  </Col>
                  <Col>
                    <Nav className="d-flex justify-content-end align-items-center fw-bold">
                      <Nav.Item>
                        <Link to="/danh-sach-yeu-thich" className="nav-link position-relative">
                          <i className="bi bi-heart text-body fs-5" />
                          <small class="position-absolute start-75 translate-middle badge rounded-pill bg-danger">{favoriteCount}</small>
                        </Link>
                      </Nav.Item>
                      <Nav.Item className="ms-3">
                        <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                          <i className="bi bi-person-circle fs-5" />
                        </OverlayTrigger>
                      </Nav.Item>
                    </Nav>
                  </Col>
                </Row>
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <Dropdown className="btn-group dropup position-fixed bottom-0 start-0 mb-3 ms-3 bd-mode-toggle">
        <Button variant="danger" type="button" title="Lên đầu trang" onClick={scrollToTop}>
          <i className="bi bi-chevron-up" />
        </Button>
        <Dropdown.Toggle variant="success" className="py-2 d-flex align-items-center border-1" id="bd-theme">
          <div className="my-1 theme-icon-active" width="1em" height="1em">
            <i className={"bi bi-" + (theme === "light" ? "sun-fill" : "moon-stars-fill")} />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
          <Dropdown.Item
            onClick={() => handleThemeClick("light")}
            className={`d-flex align-items-center ${theme === "light" ? "active" : ""}`}
            data-bs-theme-value="light"
            aria-pressed={theme === "light"}
          >
            <i className="bi bi-sun-fill me-2 opacity-50" width="1em" height="1em" />
            Light
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleThemeClick("dark")}
            className={`d-flex align-items-center ${theme === "dark" ? "active" : ""}`}
            data-bs-theme-value="dark"
            aria-pressed={theme === "dark"}
          >
            <i className="bi bi-moon-stars-fill me-2 opacity-50" width="1em" height="1em" />
            Dark
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleThemeClick("auto")}
            className={`d-flex align-items-center ${theme === "auto" ? "active" : ""}`}
            data-bs-theme-value="auto"
            aria-pressed={theme === "auto"}
          >
            <i className="me-2 bi bi-circle-half opacity-50" width="1em" height="1em" />
            Auto
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}

export default Header;
