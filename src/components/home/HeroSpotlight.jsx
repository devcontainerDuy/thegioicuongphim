import React from "react";
import { Badge, Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const HeroSpotlight = ({ film, trending = [] }) => {
  if (!film) {
    return null;
  }

  const trendingList = (trending || [])
    .filter((item) => item && item.slug && item.slug !== film.slug)
    .slice(0, 5);

  const firstEpisodeSlug = film.episodes?.[0]?.items?.[0]?.slug;
  const categoryLabel =
    film.category?.[2]?.list?.map((item) => item.name).join(", ") ||
    film.category?.[1]?.list?.[0]?.name ||
    "Featured";

  return (
    <Row className="g-4 align-items-stretch hero-spotlight">
      <Col lg={7}>
        <Card className="border-0 shadow hero-spotlight-card h-100 text-white">
          <div
            className="hero-spotlight-backdrop"
            style={{ backgroundImage: `url(${film.poster_url || film.thumb_url})` }}
          />
          <Card.Body className="position-relative d-flex flex-column justify-content-end">
            <Badge bg="danger" className="mb-3 align-self-start text-uppercase">
              {film.quality || "HD"}
            </Badge>
            <h2 className="hero-spotlight-title fw-bold mb-2">{film.name}</h2>
            <p className="hero-spotlight-meta mb-3 text-uppercase">
              {(film.time && `${film.time} - `) || ""}
              {film.language || "Vietsub"} - {categoryLabel}
            </p>
            {film.description && (
              <p className="hero-spotlight-description mb-0">
                {film.description.slice(0, 200)}
                {film.description.length > 200 ? "..." : ""}
              </p>
            )}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button as={Link} to={`/phim/${film.slug}`} variant="danger" size="lg">
                <i className="bi bi-play-fill me-2" />
                Watch now
              </Button>
              <Button
                as={Link}
                to={firstEpisodeSlug ? `/xem-phim/${film.slug}/${firstEpisodeSlug}` : `/phim/${film.slug}`}
                variant="outline-light"
                size="lg"
              >
                <i className="bi bi-collection-play me-2" />
                Latest episode
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5}>
        <Card className="h-100 border-0 shadow hero-trending-list">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold text-uppercase text-danger">Trending now</h5>
              <Badge bg="dark" className="text-uppercase">
                Top 5
              </Badge>
            </div>
            <ListGroup variant="flush" className="hero-trending-items">
              {trendingList.length > 0 ? (
                trendingList.map((item, index) => (
                  <ListGroup.Item
                    key={item.id ?? `${item.slug}-${index}`}
                    className="px-0 py-3 d-flex gap-3 align-items-center border-0 border-bottom"
                  >
                    <span className="hero-trending-index">{index + 1}</span>
                    <div className="flex-grow-1">
                      <Link
                        to={`/phim/${item.slug}`}
                        className="stretched-link text-decoration-none text-body fw-semibold"
                      >
                        <span className="text-truncate d-inline-block hero-trending-title">{item.name}</span>
                      </Link>
                      <div className="small text-body-secondary">
                        {(item.current_episode &&
                          item.total_episodes &&
                          `${item.current_episode}/${item.total_episodes}`) ||
                          item.current_episode ||
                          "Full"}
                        {item.time ? ` - ${item.time}` : ""}
                      </div>
                    </div>
                    <Button as={Link} to={`/phim/${item.slug}`} variant="outline-danger" size="sm">
                      <i className="bi bi-play-fill" />
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-body-secondary mb-0">Trending titles are being updated...</p>
              )}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HeroSpotlight;
