import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const SpotlightGrid = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="py-4 spotlight-grid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="section-title text-danger fw-bold mb-0">Spotlight collections</h3>
        <span className="text-body-secondary">Curated highlights chosen for you</span>
      </div>
      <Row className="g-3">
        {items.slice(0, 4).map((item, index) => (
          <Col md={6} key={item.id ?? `${item.slug}-${index}`}>
            <Card
              as={Link}
              to={`/phim/${item.slug}`}
              className="spotlight-card border-0 shadow-sm text-white"
            >
              <div
                className="spotlight-card-backdrop"
                style={{ backgroundImage: `url(${item.poster_url || item.thumb_url})` }}
              />
              <Card.Body className="position-relative">
                <span className="badge bg-danger text-uppercase mb-2">
                  {item.quality || "HD"}
                </span>
                <Card.Title className="fw-bold text-truncate">{item.name}</Card.Title>
                <Card.Text className="mb-0 text-white-50 text-truncate">
                  {item.description
                    ? `${item.description.slice(0, 90)}${item.description.length > 90 ? "..." : ""}`
                    : "Discover the stories everyone is talking about."}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default SpotlightGrid;
