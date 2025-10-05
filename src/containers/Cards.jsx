import React, { useEffect, useState } from "react";
import { Card, Col, Placeholder } from "react-bootstrap";
import { Link } from "react-router-dom";

const PLACEHOLDER_HEIGHT = "320px";

function Cards({
  name,
  slug,
  image,
  totalEpisodes,
  currentEpisode,
  time,
  quality = "HD",
  loader = false,
  wrap = "col",
  className = "",
}) {
  const [loading, setLoading] = useState(loader);

  useEffect(() => {
    if (!loader) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [loader]);

  const Wrapper = wrap === "div" ? "div" : Col;
  const wrapperClasses = ["film-card-wrapper", className];
  if (wrap === "div") {
    wrapperClasses.push("d-flex");
  }

  const wrapperStyle = wrap === "div" ? { width: "inherit" } : undefined;

  const episodeLabel = currentEpisode && totalEpisodes ? `${currentEpisode}/${totalEpisodes}` : currentEpisode || "Trọn bộ";
  const posterStyle = image ? { backgroundImage: `url(${image})` } : undefined;
  const metaItems = [episodeLabel, time].filter(Boolean);

  if (loading) {
    return (
      <Wrapper className={wrapperClasses.filter(Boolean).join(" ")} style={wrapperStyle}>
        <Card className="film-card film-card--loading" aria-hidden>
          <div className="film-card-poster">
            <Placeholder animation="wave" className="film-card-poster-placeholder" style={{ height: PLACEHOLDER_HEIGHT }} />
          </div>
          <Card.Body className="film-card-body">
            <Placeholder as="h6" animation="wave" className="mb-2 w-75" />
            <Placeholder as="p" animation="wave" className="w-50" />
          </Card.Body>
        </Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={wrapperClasses.filter(Boolean).join(" ")} style={wrapperStyle}>
      <Card as={Link} to={`/phim/${slug}`} className="film-card text-decoration-none">
        <div className="film-card-poster" style={posterStyle}>
          {!image && <div className="film-card-poster-fallback" aria-hidden />}
          <span className="film-card-badge badge text-bg-danger">{quality || "HD"}</span>
          {episodeLabel && <span className="film-card-badge badge text-bg-dark">{episodeLabel}</span>}
          <span className="film-card-play" aria-hidden>
            <i className="bi bi-play-fill" />
          </span>
        </div>
        <Card.Body className="film-card-body">
          <h6 className="film-card-title">{name}</h6>
          <div className="film-card-meta text-body-secondary">
            {metaItems.map((item, index) => (
              <span key={index} className="film-card-meta-item">
                {item}
              </span>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
}

export default Cards;