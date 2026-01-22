import React from "react";
import { Link } from "react-router-dom";
import { Star, Play, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * SuggestionsSidebar - Reusable sidebar for suggested films
 * Used in Favorites, Watchlist, and other pages
 */
export const SuggestionsSidebar = ({ 
  suggestedFilms = [], 
  loading = false,
  maxItems = 6 
}) => {
  return (
    <div className="hidden lg:block">
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 backdrop-blur-sm sticky top-24">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          Có thể bạn sẽ thích
        </h3>
        <Separator className="bg-zinc-800 mb-4" />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-16 h-24 bg-zinc-800 rounded-md shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedFilms.slice(0, maxItems).map((film) => (
              <Link
                key={film.slug}
                to={`/phim/${film.slug}`}
                className="group flex gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-16 h-24 rounded-md overflow-hidden bg-zinc-800 shrink-0 relative shadow-sm">
                  <img
                    src={film.thumb_url}
                    alt={film.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                  <h4 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {film.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{film.original_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {film.year && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-zinc-700 text-zinc-400">
                        {film.year}
                      </Badge>
                    )}
                    <span className="text-[10px] text-zinc-500">{film.time || "N/A"}</span>
                  </div>
                </div>
              </Link>
            ))}

            <Button asChild variant="ghost" className="w-full text-xs text-zinc-400 hover:text-white mt-4">
              <Link to="/danh-sach-phim">
                Xem thêm phim mới <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsSidebar;
