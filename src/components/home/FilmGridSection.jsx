import React from "react";
import { Link } from "react-router-dom";
import { Row } from "react-bootstrap";
import Cards from "containers/Cards";

const FilmGridSection = ({ title, films = [], viewAllLink, loading = false }) => (
  <section className="py-4 film-grid-section">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="section-title text-danger fw-bold mb-0">{title}</h3>
      {viewAllLink && (
        <Link to={viewAllLink} className="text-decoration-none fw-semibold text-danger">
          View all <i className="bi bi-chevron-right" />
        </Link>
      )}
    </div>

    {loading ? (
      <Row xs={2} sm={3} md={4} lg={5} className="g-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Cards key={`placeholder-${index}`} loader />
        ))}
      </Row>
    ) : films.length > 0 ? (
      <Row xs={2} sm={3} md={4} lg={5} className="g-3">
        {films.slice(0, 10).map((film, index) => (
          <Cards
            key={film.id ?? `${film.slug}-${index}`}
            name={film.name}
            slug={film.slug}
            image={film.thumb_url}
            totalEpisodes={film.total_episodes}
            currentEpisode={film.current_episode}
            time={film.time}
            loader={false}
          />
        ))}
      </Row>
    ) : (
      <p className="text-body-secondary mb-0">Content is being updated for this shelf.</p>
    )}
  </section>
);

export default FilmGridSection;
