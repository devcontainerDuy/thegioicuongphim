import React from "react";
import { Link } from "react-router-dom";

const FilmRailSection = ({ title, films = [], viewAllLink, loading = false }) => {
  if (!films.length && !loading) {
    return null;
  }

  return (
    <section className="py-4 film-rail-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="section-title text-danger fw-bold mb-0">{title}</h3>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-decoration-none fw-semibold text-danger">
            See more <i className="bi bi-chevron-right" />
          </Link>
        )}
      </div>
      <div className="film-rail-track">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={`rail-placeholder-${index}`} className="film-rail-card placeholder-glow">
                <div className="film-rail-thumb placeholder" />
                <div className="film-rail-info">
                  <span className="placeholder col-8" />
                  <span className="placeholder col-6" />
                </div>
              </div>
            ))
          : films.slice(0, 10).map((film, index) => (
              <Link
                key={film.id ?? `${film.slug}-${index}`}
                to={`/phim/${film.slug}`}
                className="film-rail-card text-decoration-none"
              >
                <div
                  className="film-rail-thumb"
                  style={{ backgroundImage: `url(${film.poster_url || film.thumb_url})` }}
                >
                  <span className="badge bg-danger">{film.quality || "HD"}</span>
                </div>
                <div className="film-rail-info">
                  <p className="mb-1 fw-semibold text-truncate text-body">{film.name}</p>
                  <small className="text-body-secondary">
                    {(film.current_episode &&
                      film.total_episodes &&
                      `${film.current_episode}/${film.total_episodes}`) ||
                      film.current_episode ||
                      "Full"}
                    {film.time ? ` - ${film.time}` : ""}
                  </small>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
};

export default FilmRailSection;
