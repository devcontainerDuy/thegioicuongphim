import React from "react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Cards from "containers/Cards";

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
            Xem thêm <i className="bi bi-chevron-right" />
          </Link>
        )}
      </div>
      {loading ? (
        <div className="film-rail-placeholder row g-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Cards key={`rail-placeholder-${index}`} loader />
          ))}
        </div>
      ) : (
        <Swiper
          className="film-rail-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={films.length > 6 ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          breakpoints={{
            0: { slidesPerView: 1.4 },
            576: { slidesPerView: 1.8 },
            768: { slidesPerView: 2.6 },
            992: { slidesPerView: 3.6 },
            1200: { slidesPerView: 4.4 },
          }}
        >
          {films.slice(0, 12).map((film, index) => (
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
      )}
    </section>
  );
};

export default FilmRailSection;
