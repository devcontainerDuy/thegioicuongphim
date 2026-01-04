import React, { useMemo } from "react";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import FilmRailSection from "@/components/home/FilmRailSection";
import FeaturedFilmSection from "@/components/home/FeaturedFilmSection";
import FilmGridSection from "@/components/home/FilmGridSection";
import { useFilmsList } from "@/hooks/useFilmsList";


function Home() {
  const { items: trending } = useFilmsList({ endpoint: "phim-moi-cap-nhat" }); // Trending
  const { items: latestSeries } = useFilmsList({ endpoint: "danh-sach/phim-bo" }); // Series
  const { items: latestMovies } = useFilmsList({ endpoint: "danh-sach/phim-le" }); // Movies
  const { items: tvShows } = useFilmsList({ endpoint: "danh-sach/tv-shows" }); // TV Shows
  const { items: cartoons } = useFilmsList({ endpoint: "danh-sach/hoat-hinh" }); // Cartoons

  // Spotlight Film (First of trending or fallback)
  const spotlightFilm = useMemo(() => trending?.[0] || null, [trending]);

  return (
    <div className="bg-background min-h-screen pb-12">
      <HeroSpotlight film={spotlightFilm} trending={trending} />
      
      <div className="container mx-auto px-4 md:px-12 space-y-12 -mt-20 relative z-10">
        <div className="animate-in fade-in zoom-in duration-500">
           <FeaturedFilmSection title="Phim Đề Cử" films={trending} />
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
           <FilmRailSection title="Phim Bộ Mới" films={latestSeries} link="/danh-sach/phim-bo" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <FilmGridSection title="Phim Lẻ Mới" films={latestMovies} link="/danh-sach/phim-le" />
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <FilmRailSection title="TV Shows Hot" films={tvShows} link="/danh-sach/tv-shows" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <FilmRailSection title="Hoạt Hình" films={cartoons} link="/danh-sach/hoat-hinh" />
        </div>
      </div>
    </div>
  );
}

export default Home;
