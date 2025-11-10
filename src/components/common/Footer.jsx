import React from "react";
import { Col, Container, Nav, Row } from "react-bootstrap";
import Logo from "components/specific/Logo";
import NavLink from "components/ui/NavLink";

const FOOTER_LINKS = [
  { label: "Trang chủ", to: "/" },
  { label: "Danh sách phim", to: "/danh-sach-phim" },
  { label: "Phim lẻ", to: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1" },
  { label: "Phim bộ", to: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1" },
];

function Footer() {
  return (
    <footer className="app-footer border-top">
      <Container className="py-4">
        <Row className="gy-4 align-items-center">
          <Col md={6}>
            <Logo />
            <p className="text-body-secondary mb-0 mt-3">
              Thế Giới Cuồng Phim – nơi tụi mình tuyển chọn phim mới mỗi ngày, hạn chế ồn ào và tập trung vào trải nghiệm xem chill nhất.
            </p>
          </Col>
          <Col md={6} className="d-flex justify-content-md-end">
            <Nav className="gap-3 flex-wrap footer-links">
              {FOOTER_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className="text-body-secondary px-0">
                  {link.label}
                </NavLink>
              ))}
            </Nav>
          </Col>
        </Row>
        <div className="d-flex flex-column flex-sm-row justify-content-between text-body-secondary mt-4 small">
          <span>© {new Date().getFullYear()} The Gioi Cuong Phim. All rights reserved.</span>
          <span className="mt-2 mt-sm-0">Build with React + Bootstrap</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
