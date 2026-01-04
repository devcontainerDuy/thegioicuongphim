import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const MovieCard = ({
  name,
  slug,
  image,
  totalEpisodes,
  currentEpisode,
  time,
  quality = "HD",
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
         <Skeleton className="aspect-[2/3] w-full rounded-lg" />
         <div className="space-y-1">
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-3 w-1/2" />
         </div>
      </div>
    );
  }

  const episodeLabel = currentEpisode && totalEpisodes ? `${currentEpisode}/${totalEpisodes}` : currentEpisode || "Trọn bộ";

  return (
    <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className={cn("group relative rounded-lg cursor-pointer", className)}
    >
      <Link to={`/phim/${slug}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted dark:bg-zinc-800 border border-transparent dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            {image ? (
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                    loading="lazy"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                    No Image
                </div>
            )}
            
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary/90 rounded-full p-3 transform transition-transform scale-0 group-hover:scale-100 shadow-lg">
                     <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
                <Badge variant="destructive" className="bg-primary hover:bg-primary/90 text-xs px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider shadow-sm">
                    {quality}
                </Badge>
            </div>
             <div className="absolute top-2 right-2">
                {episodeLabel && (
                    <Badge variant="secondary" className="bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-sm shadow-sm border-none">
                        {episodeLabel}
                    </Badge>
                )}
            </div>
        </div>

        <div className="mt-2 space-y-1">
          <h3 className="font-bold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              {time && <span>{time}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
