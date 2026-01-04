import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MovieCard from "@/components/shared/MovieCard";

const FilmGridSection = ({ title, films = [], viewAllLink, loading = false }) => (
  <section className="py-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide border-l-4 border-primary pl-4">{title}</h3>
      {viewAllLink && (
        <Link to={viewAllLink} className="flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>

    {loading ? (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
        {Array.from({ length: 10 }).map((_, index) => (
          <MovieCard key={`grid-loading-${index}`} loading={true} />
        ))}
      </div>
    ) : films.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-4 gap-y-8">
        {films.slice(0, 15).map((film, index) => (
          <MovieCard
            key={film.id ?? `${film.slug}-${index}`}
            name={film.name}
            slug={film.slug}
            image={film.poster_url || film.thumb_url}
            totalEpisodes={film.total_episodes}
            currentEpisode={film.current_episode}
            time={film.time}
            quality={film.quality}
          />
        ))}
      </div>
    ) : (
      <p className="text-zinc-500 italic">Mục này đang được cập nhật.</p>
    )}
  </section>
);

export default FilmGridSection;
