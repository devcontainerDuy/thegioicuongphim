import React from "react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { ChevronRight } from "lucide-react";
import MovieCard from "@/components/shared/MovieCard";
import SlideIn from "@/components/bits/SlideIn";
import ShinyText from "@/components/bits/ShinyText";


const FilmRailSection = ({ title, films = [], viewAllLink, loading = false }) => {
  if (!films.length && !loading) {
    return null;
  }

  return (
    <section className="py-8 relative">
      <SlideIn direction="right" delay={0.1}>
        <div className="flex justify-between items-center mb-6 px-4 md:px-12">
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-8 bg-primary rounded-full"></span>
            {title.includes("Hot") || title.includes("Mới") ? (
              <ShinyText text={title} speed={4} />
            ) : (
              title
            )}
          </h3>
          {viewAllLink && (
            <Link to={viewAllLink} className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-all hover:gap-2 gap-1 group">
              Xem thêm <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </SlideIn>

      <div className="px-4 md:px-12">
        {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <MovieCard key={`loading-${index}`} loading={true} />
              ))}
            </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({ delay: 5000, stopOnInteraction: false }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {films.slice(0, 15).map((film, index) => (
                <CarouselItem 
                  key={film.id ?? `${film.slug}-${index}`} 
                  className="pl-4 basis-[45%] md:basis-[31%] lg:basis-[23%] xl:basis-[19%] 2xl:basis-[16%]"
                >
                  <MovieCard
                    name={film.name}
                    slug={film.slug}
                    image={film.poster_url || film.thumb_url}
                    totalEpisodes={film.total_episodes}
                    currentEpisode={film.current_episode}
                    time={film.time}
                    quality={film.quality}
                    averageScore={film.averageScore}
                    totalRatings={film.totalRatings}
                    className="h-full"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Custom styled navigation or standard */}
             <CarouselPrevious className="left-0 -translate-x-1/2 hidden md:flex" />
             <CarouselNext className="right-0 translate-x-1/2 hidden md:flex" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FilmRailSection;
