import React from "react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight, Play, Star } from "lucide-react";
import Spotlight from "@/components/bits/Spotlight";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedFilmSection = ({ title, films = [], viewAllLink, loading = false }) => {
  if (!films.length && !loading) {
    return null;
  }

  return (
    <section className="py-8 relative">
      <div className="flex justify-between items-end mb-6 px-4 md:px-12">
        <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Recommendation</span>
            <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-wide uppercase">{title}</h3>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="px-4 md:px-12 overflow-hidden">
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-video w-full rounded-xl bg-muted dark:bg-zinc-800" />
              ))}
            </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              0: { slidesPerView: 1.2, spaceBetween: 16 }, // Mobile: Large card peeking
              640: { slidesPerView: 2.2, spaceBetween: 20 },
              1024: { slidesPerView: 3.2, spaceBetween: 24 },
              1280: { slidesPerView: 4.2 },
            }}
            className="featured-swiper !overflow-visible !py-4"
          >
            {films.slice(0, 10).map((film, index) => (
              <SwiperSlide key={film.id ?? `${film.slug}-${index}`} className="!h-auto group">
                <Link to={`/phim/${film.slug}`}>
                    <Spotlight 
                        className="h-full rounded-xl bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800/50 shadow-lg relative p-1 overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                        spotlightColor="rgba(255, 255, 255, 0.15)"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted dark:bg-black">
                            <img 
                                src={film.thumb_url || film.poster_url} 
                                alt={film.name} 
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
                                loading="lazy"
                            />
                             {/* Floating Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                                <Badge className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold uppercase backdrop-blur-sm shadow-md">
                                    {film.quality || "HD"}
                                </Badge>
                            </div>
                             <div className="absolute top-2 right-2 z-20">
                                <Badge variant="secondary" className="bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {film.year || "2024"}
                                </Badge>
                             </div>

                             {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20">
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                            <h4 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors pr-1">
                                {film.name}
                            </h4>
                            <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 font-medium">
                                <span className="line-clamp-1 flex-1">{film.original_name || "Phim Mới"}</span>
                                <span className="text-zinc-500 whitespace-nowrap bg-zinc-800/50 px-1.5 py-0.5 rounded">{film.time || "N/A"}</span>
                            </div>
                            
                            {/* Categories - Limit to 1 line, minimal */}
                            {film.category?.[2]?.list?.[0] && (
                                <div className="pt-2 flex flex-wrap gap-1 overflow-hidden h-6">
                                    <span className="text-[10px] text-zinc-500 border border-zinc-800/50 px-1.5 py-0.5 rounded inline-block whitespace-nowrap">
                                        {film.category[2].list[0].name}
                                    </span>
                                     {film.category?.[1]?.list?.[0] && (
                                        <span className="text-[10px] text-zinc-500 border border-zinc-800/50 px-1.5 py-0.5 rounded inline-block whitespace-nowrap">
                                            {film.category[1].list[0].name}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </Spotlight>
                </Link>
              </SwiperSlide>
            ))}
            {/* Navigation buttons moved outside or styled to not overlap content brutally */}
            <div className="swiper-button-prev !w-8 !h-8 !text-white !bg-black/50 !backdrop-blur-sm !rounded-full !-left-3 hover:!bg-primary transition-colors after:!text-xs"></div>
            <div className="swiper-button-next !w-8 !h-8 !text-white !bg-black/50 !backdrop-blur-sm !rounded-full !-right-3 hover:!bg-primary transition-colors after:!text-xs"></div>
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default FeaturedFilmSection;
