import React from "react";
import { Link } from "react-router-dom";
import { Row } from "react-bootstrap";
import Product from "containers/Product";

const ContinueWatchingSection = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="section-title text-danger fw-bold mb-0">Tiếp tục xem</h3>
        <Link to="/danh-sach-yeu-thich" className="text-decoration-none text-danger fw-semibold">
          Quản lý danh sách <i className="bi bi-chevron-right" />
        </Link>
      </div>
      <Row xs={2} sm={3} md={4} lg={5} className="g-3">
        {items.map((film, index) => (
          <Product
            key={film.id ?? `${film.slug}-${index}`}
            name={film.name}
            slug={film.slug}
            image={film.thumb_url}
            totalEpisodes={film.total_episodes}
            currentEpisode={film.current_episode}
            time={film.time}
          />
        ))}
      </Row>
    </section>
  );
};

export default ContinueWatchingSection;

