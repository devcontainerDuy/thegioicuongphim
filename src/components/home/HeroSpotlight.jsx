import React, { useMemo } from "react";
import { Badge, Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const getCategoryLabel = (item) =>
  item?.category?.[2]?.list?.map((c) => c.name).join(", ") || item?.category?.[1]?.list?.[0]?.name || "Nổi bật";

const HeroSpotlight = ({ film, trending = [] }) => {
  const trendingList = useMemo(
    () =>
      film
        ? (trending || [])
            .filter((item) => item && item.slug && item.slug !== film.slug)
            .slice(0, 5)
        : [],
    [trending, film]
  );

  const spotlightSlides = useMemo(() => {
    if (!film) {
      return [];
    }

    const unique = new Map();
    const pushItem = (item) => {
      if (!item?.slug || unique.has(item.slug)) {
        return;
      }
      unique.set(item.slug, item);
    };

    pushItem(film);
    trendingList.forEach(pushItem);

    return Array.from(unique.values()).slice(0, 5);
  }, [film, trendingList]);

  const autoplay = useMemo(
    () =>
      spotlightSlides.length > 1
        ? {
            delay: 5000,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
          }
        : false,
    [spotlightSlides.length]
  );

  if (!film) {
    return null;
  }

  return (
    <Row className="g-4 align-items-stretch hero-spotlight">
      <Col lg={7}>
        <Swiper className="hero-spotlight-swiper flex-grow-1" modules={[Autoplay]} slidesPerView={1} autoplay={autoplay}>
          {spotlightSlides.map((item) => {
            const firstEpisodeSlug = item.episodes?.[0]?.items?.[0]?.slug;
            const categoryLabel = getCategoryLabel(item);

            return (
              <SwiperSlide key={item.slug}>
                <Card className="border-0 shadow hero-spotlight-card h-100 text-white">
                  <div
                    className="hero-spotlight-backdrop"
                    style={{ backgroundImage: `url(${item.poster_url || item.thumb_url || film.poster_url || film.thumb_url})` }}
                  />
                  <Card.Body className="position-relative d-flex flex-column justify-content-end">
                    <Badge bg="danger" className="mb-3 align-self-start text-uppercase">
                      {item.quality || "HD"}
                    </Badge>
                    <h2 className="hero-spotlight-title fw-bold mb-2">{item.name}</h2>
                    <p className="hero-spotlight-meta mb-3 text-uppercase">
                      {(item.time && `${item.time} - `) || ""}
                      {item.language || "Vietsub"} - {categoryLabel}
                    </p>
                    {item.description && (
                      <p className="hero-spotlight-description mb-0">
                        {item.description.slice(0, 200)}
                        {item.description.length > 200 ? "..." : ""}
                      </p>
                    )}
                    <div className="d-flex flex-wrap gap-2 mt-4">
                      <Button as={Link} to={`/phim/${item.slug}`} variant="danger" size="lg">
                        <i className="bi bi-play-fill me-2" />
                        Xem ngay
                      </Button>
                      <Button
                        as={Link}
                        to={firstEpisodeSlug ? `/xem-phim/${item.slug}/${firstEpisodeSlug}` : `/phim/${item.slug}`}
                        variant="outline-light"
                        size="lg"
                      >
                        <i className="bi bi-collection-play me-2" />
                        Tập mới nhất
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Col>
      <Col lg={5}>
        <Card className="h-100 w-100 border-0 shadow hero-trending-list">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold text-uppercase text-danger">Đang thịnh hành</h5>
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
                          "Trọn bộ"}
                        {item.time ? ` - ${item.time}` : ""}
                      </div>
                    </div>
                    <Button as={Link} to={`/phim/${item.slug}`} variant="outline-danger" size="sm">
                      <i className="bi bi-play-fill" />
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-body-secondary mb-0">Danh sách đang được cập nhật...</p>
              )}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HeroSpotlight;

