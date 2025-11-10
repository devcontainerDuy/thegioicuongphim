import React from "react";
import { Container, Breadcrumb } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Breadcrumbs({ props = [] }) {
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  const buildHref = (item) => {
    if (item.href) {
      return item.href;
    }
    if (item.url) {
      return item.url;
    }
    if (item.path) {
      const query = new URLSearchParams(item.params || {});
      const queryString = query.toString();
      return queryString ? `${item.path}?${queryString}` : item.path;
    }
    return "#";
  };

  const isParamsMatch = (item) => {
    if (!item.params) {
      return false;
    }
    const targetPath = item.path || "/";
    if (location.pathname !== targetPath) {
      return false;
    }

    const entries = Object.entries(item.params);
    if (!entries.length) {
      return location.search === "";
    }

    const currentParams = new URLSearchParams(location.search);
    return entries.every(([key, value]) => currentParams.get(key) === String(value));
  };

  return (
    <Container className="bg-body-tertiary border border-1 rounded rounded-1">
      <Breadcrumb aria-label="breadcrumb" className="mt-3 ps-2">
        <Breadcrumb.Item
          href="/"
          linkAs={Link}
          linkProps={{ to: "/" }}
          active={location.pathname === "/" && !location.search}
          aria-current={location.pathname === "/" && !location.search ? "page" : undefined}
        >
          <i className="bi bi-house-door-fill" width="16" height="16" />
          <span className="visually-hidden">Trang chủ</span>
        </Breadcrumb.Item>

        {props.map((item, index) => {
          const href = buildHref(item);
          const isActive = item.params
            ? isParamsMatch(item)
            : currentUrl === href;
          return (
            <Breadcrumb.Item
              key={index}
              href={href}
              linkAs={Link}
              linkProps={{ to: href }}
              className="text-capitalize"
              active={isActive}
              aria-current={isActive ? "page" : undefined}
            >
              {item.name}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </Container>
  );
}

export default Breadcrumbs;
