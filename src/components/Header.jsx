import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Dropdown, Form, Image, InputGroup, Nav, Navbar, Offcanvas, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function useTheme() {
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

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa ký tự tiếng Việt có dấu thành không dấu
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu thanh
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ các ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-"); // Loại bỏ dấu gạch ngang dư thừa
}

function Header() {
  const favoriteCount = useSelector((state) => state.favorites.items.length);
  const [theme, toggleTheme] = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);

  const handleThemeClick = (newTheme) => {
    toggleTheme(newTheme);
  };

  const searchFilms = (keyword) => {
    const slugKeyword = toSlug(keyword);
    const url = `https://phim.nguonc.com/api/films/search?keyword=${slugKeyword}`;

    axios
      .get(url)
      .then((response) => {
        setFilms(response.data.items);
      })
      .catch((error) => {
        console.error("Error fetching the films:", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFilms(searchTerm);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
                      <Nav.Item>
                        <Link to="/" className="nav-link active">
                          Trang chủ
                        </Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Link to="/danh-sach-phim" className="nav-link">
                          Doanh sách phim
                        </Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Link to="/danh-sach-phim/phim-le" className="nav-link">
                          Phim lẻ
                        </Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Link to="/danh-sach-phim/phim-bo" className="nav-link">
                          Phim bộ
                        </Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col xs={12} xl={4}>
                    <Form className="d-flex" onSubmit={handleSubmit}>
                      <InputGroup aria-label="Tìm kiếm">
                        <Form.Control type="search" placeholder="Tìm kiếm phim..." aria-label="Search" list="films" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <datalist id="films">
                          <option value="Nhà bà nữ"></option>
                          <option value="Black Adam"></option>
                          <option value="Kẻ Trộm Mặt Trăng 4"></option>
                          <option value="Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season"></option>
                        </datalist>
                        <Dropdown>
                          <Dropdown.Toggle className="bg-danger" variant="danger" type="submit">
                            <i className="bi bi-search" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {films.length > 0 ? (
                              films.map((film) => (
                                <Dropdown.Item key={film.slug} href={`/phim/${film.slug}`}>
                                  <div className="d-flex flex-grow-1">
                                    <div className="me-2">{film.thumb_url ? <Image src={film.thumb_url} className="rounded" style={{ width: "80px", height: "120px" }} /> : <Col className="rounded bg-secondary" style={{ width: "80px", height: "120px" }} />}</div>
                                    <div className="d-flex flex-column">
                                      <h6 className="fw-bold text-truncate">{film.name}</h6>
                                      <span className="text-truncate">{new Date(film.created).toLocaleDateString()}</span>
                                      <p className="text-truncate">{film.current_episode}</p>
                                    </div>
                                  </div>
                                </Dropdown.Item>
                              ))
                            ) : (
                              <Dropdown.Item disabled>Không có kết quả trùng khớp</Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </InputGroup>
                    </Form>
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
      <Dropdown className="btn-group dropup position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
        <Button variant="danger" type="button" title="Lên đầu trang" onClick={handleScrollToTop}>
          <i className="bi bi-chevron-up" />
        </Button>
        <Dropdown.Toggle variant="success" className="py-2 d-flex align-items-center border-1" id="bd-theme">
          <div className="my-1 theme-icon-active" width="1em" height="1em">
            <i className={"bi bi-" + (theme === "light" ? "sun-fill" : "moon-stars-fill")} />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
          <Dropdown.Item onClick={() => handleThemeClick("light")} className={`d-flex align-items-center ${theme === "light" ? "active" : ""}`} data-bs-theme-value="light" aria-pressed={theme === "light"}>
            <i className="bi bi-sun-fill me-2 opacity-50" width="1em" height="1em" />
            Light
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleThemeClick("dark")} className={`d-flex align-items-center ${theme === "dark" ? "active" : ""}`} data-bs-theme-value="dark" aria-pressed={theme === "dark"}>
            <i className="bi bi-moon-stars-fill me-2 opacity-50" width="1em" height="1em" />
            Dark
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleThemeClick("auto")} className={`d-flex align-items-center ${theme === "auto" ? "active" : ""}`} data-bs-theme-value="auto" aria-pressed={theme === "auto"}>
            <i className="me-2 bi bi-circle-half opacity-50" width="1em" height="1em" />
            Auto
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}

export default Header;
