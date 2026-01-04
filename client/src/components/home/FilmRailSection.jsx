import React from "react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight } from "lucide-react";
import MovieCard from "@/components/shared/MovieCard";


const FilmRailSection = ({ title, films = [], viewAllLink, loading = false }) => {
  if (!films.length && !loading) {
    return null;
  }

  return (
    <section className="py-8 relative">
      <div className="flex justify-between items-center mb-6 px-4 md:px-12">
        <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-wide">{title}</h3>
        {viewAllLink && (
          <Link to={viewAllLink} className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Xem thêm <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="px-4 md:px-12 overflow-hidden">
        {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <MovieCard key={`loading-${index}`} loading={true} />
              ))}
            </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation
            autoplay={films.length > 6 ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
            breakpoints={{
              0: { slidesPerView: 2.2, spaceBetween: 12 },
              640: { slidesPerView: 3.2, spaceBetween: 16 },
              768: { slidesPerView: 4.2 },
              1024: { slidesPerView: 5.2 },
              1280: { slidesPerView: 6.2 },
            }}
            className="film-swiper !overflow-visible"
          >
            {films.slice(0, 15).map((film, index) => (
              <SwiperSlide key={film.id ?? `${film.slug}-${index}`} className="!h-auto">
                <MovieCard
                  name={film.name}
                  slug={film.slug}
                  image={film.poster_url || film.thumb_url}
                  totalEpisodes={film.total_episodes}
                  currentEpisode={film.current_episode}
                  time={film.time}
                  quality={film.quality}
                  className="h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default FilmRailSection;
