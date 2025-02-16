import NavLink from "components/ui/NavLink";
import { useIsActive } from "lib/navigation";
import { Col, Container, Nav, Navbar, Offcanvas, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import SearchForm from "./SearchFrom";
import Logo from "components/specific/Logo";
import ScrollToTop from "./ScrollToTop";

function Header() {
  const favoriteCount = useSelector((state) => state.favorites.items.length);

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3" className="text-center">
        Tài khoản
      </Popover.Header>
      <Popover.Body className="p-2 text-center">
        <Nav className="flex-column">
          <NavLink to="/dang-nhap" className="border-bottom border-body">
            Đăng nhập
          </NavLink>
          <NavLink to="/dang-ky">Đăng ký</NavLink>
        </Nav>
      </Popover.Body>
    </Popover>
  );

  return (
    <header className="header fixed-top border-1 border-bottom border-body">
      <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
        <Container>
          <Navbar.Brand href="/" hrefLang="vi">
            <Logo />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="offcanvasNavbar-expand" />

          <Navbar.Offcanvas id="offcanvasNavbar-expand" aria-labelledby="offcanvasNavbarLabel-expand" placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand">
                <Navbar.Brand href="/" hrefLang="vi">
                  <Logo />
                </Navbar.Brand>
              </Offcanvas.Title>
            </Offcanvas.Header>
            {/* Thanh điều hướng nav */}
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
                      {/* <NavLink to="/danh-sach-phim?category=danh-sach&sub=phim-le&page=1" active={useIsActive("/danh-sach-phim?category=danh-sach&sub=phim-le&page=1")}>
                        Phim lẻ
                      </NavLink>
                      <NavLink to="/danh-sach-phim/phim-bo" active={useIsActive("/danh-sach-phim/phim-bo")}>
                        Phim bộ
                      </NavLink> */}
                    </Nav>
                  </Col>
                  <Col xs={12} xl={4}>
                    {/* Tìm kiếm */}
                    <SearchForm />
                    {/* Tìm kiếm */}
                  </Col>
                  <Col>
                    <Nav className="d-flex justify-content-end align-items-center fw-bold">
                      <NavLink to="/danh-sach-yeu-thich" className="position-relative">
                        <i className="bi bi-heart text-body fs-5" />
                        <small class="position-absolute start-75 translate-middle badge rounded-pill bg-danger">{favoriteCount}</small>
                      </NavLink>
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
            {/* Thanh điều hướng nav */}
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <ScrollToTop />
    </header>
  );
}

export default Header;
