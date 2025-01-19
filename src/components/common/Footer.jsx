/* eslint-disable */
import Logo from "components/specific/Logo";
import Buttons from "components/ui/Buttons";
import InputLabel from "components/ui/InputLabel";
import NavLink from "components/ui/NavLink";
import TextInput from "components/ui/TextInput";
import React from "react";
import { Col, Container, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-body-secondary">
      <Container>
        <Row className="py-5">
          <Col xs="8" md="3" className="mb-3">
            <Logo />
          </Col>
          <Col xs="4" md="3" className="mb-3">
            <h5>Doanh mục</h5>
            <Nav className="flex-column">
              <NavLink className="p-0 mb-2 text-body-secondary" to="/">
                Trang chủ
              </NavLink>
              <NavLink className="p-0 mb-2 text-body-secondary" to="/danh-sach-phim">
                Danh sách phim
              </NavLink>
              <NavLink className="p-0 mb-2 text-body-secondary" to="/danh-sach-phim/phim-le">
                Phim lẻ
              </NavLink>
              <NavLink className="p-0 mb-2 text-body-secondary" to="/danh-sach-phim/phim-bo">
                Phim bộ
              </NavLink>
            </Nav>
          </Col>
          <Col md="5" className="offset-md-1 mb-3">
            <form>
              <h5>Đăng ký vào bản tin của chúng tôi</h5>
              <p>Thông báo hàng tháng về những gì mới và thú vị từ chúng tôi.</p>
              <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                <InputLabel htmlFor="newsletter1" value="Địa chỉ email" className="visually-hidden" />
                <TextInput id="newsletter1" type="text" className="form-control" placeholder="Nhập địa chỉ email của bạn..." />
                <Buttons variant="danger" className="w-25">
                  Đăng ký!
                </Buttons>
              </div>
            </form>
          </Col>
        </Row>

        <div className="d-flex flex-column flex-sm-row justify-content-between py-4 border-top">
          <p>© 2024 Company, Inc. All rights reserved.</p>
          <ul className="list-unstyled d-flex">
            <li className="ms-3">
              <Link className="link-body-emphasis" to="#">
                <i className="bi bi-twitter" width={24} height={24} />
              </Link>
            </li>
            <li className="ms-3">
              <Link className="link-body-emphasis" to="#">
                <i className="bi bi-instagram" width={24} height={24} />
              </Link>
            </li>
            <li className="ms-3">
              <Link className="link-body-emphasis" to="#">
                <i className="bi bi-facebook" width={24} height={24} />
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
