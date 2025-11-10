import React from "react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Cards from "containers/Cards";

const FilmGridSection = ({ title, films = [], viewAllLink, loading = false }) => (
  <section className="py-4 film-grid-section">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="section-title text-danger fw-bold mb-0">{title}</h3>
      {viewAllLink && (
        <Link to={viewAllLink} className="text-decoration-none fw-semibold text-danger">
          Xem tất cả <i className="bi bi-chevron-right" />
        </Link>
      )}
    </div>

    {loading ? (
      <div className="film-grid-placeholder row g-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Cards key={`placeholder-${index}`} loader />
        ))}
      </div>
    ) : films.length > 0 ? (
      <Swiper
        className="film-grid-swiper"
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        autoplay={films.length > 6 ? { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        breakpoints={{
          0: { slidesPerView: 1.2 },
          576: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          992: { slidesPerView: 4 },
          1200: { slidesPerView: 5 },
        }}
      >
        {films.slice(0, 15).map((film, index) => (
          <SwiperSlide key={film.id ?? `${film.slug}-${index}`}>
            <Cards
              wrap="div"
              name={film.name}
              slug={film.slug}
              image={film.poster_url || film.thumb_url}
              totalEpisodes={film.total_episodes}
              currentEpisode={film.current_episode}
              time={film.time}
              quality={film.quality}
              loader={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    ) : (
      <p className="text-body-secondary mb-0">Mục này đang được cập nhật.</p>
    )}
  </section>
);

export default FilmGridSection;
