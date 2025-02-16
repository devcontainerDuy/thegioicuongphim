import React from "react";
import { Container, Breadcrumb } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Breadcrumbs({ props }) {
  let location = useLocation();
  var url = location.pathname;

  return (
    <>
      <Container className="bg-body-tertiary border border-1 rounded rounded-1">
        <Breadcrumb aria-label="breadcrumb" className="mt-3 ps-2">
          <Breadcrumb.Item href="/" linkAs={Link} linkProps={{ to: "/" }}>
            <i className="bi bi-house-door-fill" width="16" height="16" />
            <span className="visually-hidden">Trang chủ</span>
          </Breadcrumb.Item>
          {props &&
            props.map((item, index) => (
              <Breadcrumb.Item
                key={index}
                href={item.url}
                linkAs={Link}
                linkProps={{ to: item.url }}
                aria-current={index === 0 ? "page" : false}
                className="text-capitalize"
                active={item.url === url ? true : false}
              >
                {item.name}
              </Breadcrumb.Item>
            ))}
        </Breadcrumb>
      </Container>
    </>
  );
}

export default Breadcrumbs;
