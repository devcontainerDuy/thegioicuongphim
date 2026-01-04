import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info } from "lucide-react";


const getCategoryLabel = (item) =>
  item?.category?.[2]?.list?.map((c) => c.name).join(", ") || item?.category?.[1]?.list?.[0]?.name || "Nổi bật";

const HeroSpotlight = ({ film, trending = [] }) => {
  const spotlightSlides = useMemo(() => {
    if (!film) return [];

    const unique = new Map();
    const pushItem = (item) => {
      if (!item?.slug || unique.has(item.slug)) return;
      unique.set(item.slug, item);
    };

    pushItem(film);
    trending.forEach(pushItem);

    return Array.from(unique.values()).slice(0, 5);
  }, [film, trending]);

  if (!film) return null;

  return (
    <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        slidesPerView={1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        className="h-full w-full"
      >
        {spotlightSlides.map((item) => {
          const categoryLabel = getCategoryLabel(item);
          const firstEpisodeSlug = item.episodes?.[0]?.items?.[0]?.slug;

          return (
            <SwiperSlide key={item.slug} className="relative h-full w-full bg-black">
              {/* Backdrop Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-105"
                style={{
                  backgroundImage: `url(${item.poster_url || item.thumb_url})`,
                }}
              >
                 {/* Gradient Overlay: Dark fade at bottom to blend with content, adapts to theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center px-4 md:px-12">
                <div className="max-w-2xl space-y-6 pt-20">
                  <Badge variant="outline" className="border-white/30 text-white backdrop-blur-md">
                     {categoryLabel}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg uppercase tracking-tighter">
                    {item.name}
                  </h1>

                  <div className="flex items-center gap-4 text-white/90 text-sm md:text-base font-medium">
                     <span className="text-primary font-bold">{item.quality || "HD"}</span>
                     <span>{item.year || "2024"}</span>
                     <span>{item.time || "N/A"}</span>
                     <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border border-white/20">{item.language || "Vietsub"}</Badge>
                  </div>

                  <p className="text-white/80 text-base md:text-lg line-clamp-3 md:line-clamp-4 max-w-xl leading-relaxed drop-shadow-md">
                    {item.content || item.description || "Đang cập nhật nội dung..."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button asChild size="lg" className="h-12 px-8 text-lg font-bold bg-primary text-white hover:bg-primary/90 rounded-md border-none shadow-lg shadow-primary/20">
                      <Link to={`/phim/${item.slug}`}>
                        <Play className="w-6 h-6 mr-2 fill-current" /> Xem ngay
                      </Link>
                    </Button>
                    
                    <Button asChild variant="secondary" size="lg" className="h-12 px-6 text-lg font-semibold bg-zinc-600/80 hover:bg-zinc-600 text-white backdrop-blur-sm rounded-md">
                       <Link to={firstEpisodeSlug ? `/xem-phim/${item.slug}/${firstEpisodeSlug}` : `/phim/${item.slug}`}>
                        <Info className="w-6 h-6 mr-2" /> Chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default HeroSpotlight;
