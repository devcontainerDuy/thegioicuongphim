import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import PlayButton from "@/components/ui/PlayButton";
import TrailerButton from "@/components/ui/TrailerButton";


const getCategoryLabel = (item) =>
  item?.category?.[2]?.list?.map((c) => c.name).join(", ") || item?.category?.[1]?.list?.[0]?.name || "Nổi bật";

const HeroSpotlight = ({ film, trending = [] }) => {
  const [api, setApi] = React.useState();
  const [current, setCurrent] = React.useState(0);

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

  // Autoplay & Fade Plugins
  // Increased delay for better readability
  const plugin = React.useRef(
    Autoplay({ delay: 8000, stopOnInteraction: false })
  );
  
  const fadePlugin = React.useRef(
    Fade()
  );

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
        setCurrent(api.selectedScrollSnap() + 1)
      })

  }, [api])


  if (!film) return null;

  return (
    <section className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden group bg-black font-sans">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current, fadePlugin.current]}
        className="w-full h-full"
        opts={{
          loop: true,
          duration: 60, 
        }}
      >
        <CarouselContent className="h-full ml-0"> 
          {spotlightSlides.map((item, index) => {
            const categoryLabel = getCategoryLabel(item);
            const firstEpisodeSlug = item.episodes?.[0]?.items?.[0]?.slug;
            const isActive = index + 1 === current;

            return (
              <CarouselItem key={item.slug} className="relative h-full w-full pl-0 basis-full">
                {/* Backdrop Image with Ken Burns Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform ease-linear ${isActive ? "scale-110" : "scale-100"}`}
                    style={{
                        backgroundImage: `url(${item.poster_url || item.thumb_url})`,
                        transitionDuration: '10000ms'
                    }}
                    >
                        {/* Improved Gradient Overlay: Bottom-heavy for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                    </div>
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex items-center px-4 md:px-16 pb-12 z-10 pointer-events-none">
                  <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-end pointer-events-auto">
                    
                    {/* Left Content */}
                    <div className="space-y-6 pt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      
                      {/* Title Section */}
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl tracking-tighter uppercase relative">
                          {item.name}
                        </h1>
                        <h2 className="text-lg md:text-2xl text-white/70 font-medium italic tracking-wide">
                          {item.original_name}
                        </h2>
                      </div>

                      {/* Meta Info Line */}
                      <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm md:text-base font-semibold">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white/90 backdrop-blur-sm">{categoryLabel}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                         <span>{item.year || "2024"}</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                         <span>{item.time || "N/A"}</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                         <span className="text-primary font-bold shadow-green-500/50 drop-shadow-sm">{item.quality || "HD"}</span>
                      </div>

                      {/* Description */}
                      <p className="text-zinc-300 text-base md:text-lg line-clamp-3 max-w-xl leading-relaxed drop-shadow-md font-medium">
                        {item.content || item.description || "Đang cập nhật nội dung..."}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.7)] border-none rounded-lg">
                          <Link to={`/phim/${item.slug}`}>
                            <Play className="w-6 h-6 mr-2 fill-current" /> Xem Ngay
                          </Link>
                        </Button>
                        
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium bg-white/5 border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/40 rounded-lg backdrop-blur-md transition-all">
                           <Link to={firstEpisodeSlug ? `/xem-phim/${item.slug}/${firstEpisodeSlug}` : `/phim/${item.slug}`}>
                            <Info className="w-6 h-6 mr-2" /> Chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Right Side / Classification Badge */}
                    {item.age_rating && (
                        <div className="hidden md:flex flex-col items-end justify-end h-full pb-20 space-y-4 animate-in fade-in duration-1000">
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 border-l-4 border-primary bg-black/80 backdrop-blur-md text-white font-bold text-lg shadow-lg">
                                    {item.age_rating}
                                </div>
                            </div>
                        </div>
                    )}

                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Custom Navigation - Bottom Right with Glassmorphism */}
        <div className="absolute bottom-12 right-12 hidden md:flex gap-3 z-20">
           <CarouselPrevious className="static translate-y-0 text-white border-white/20 bg-black/30 hover:bg-primary hover:border-primary w-12 h-12 rounded-full transition-all duration-300" />
           <CarouselNext className="static translate-y-0 text-white border-white/20 bg-black/30 hover:bg-primary hover:border-primary w-12 h-12 rounded-full transition-all duration-300" />
        </div>
        
      </Carousel>
    </section>
  );
};

export default HeroSpotlight;
