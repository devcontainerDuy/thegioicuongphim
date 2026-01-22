import { Bookmark, BookmarkCheck } from "lucide-react";

/**
 * WatchlistButton - Add to watchlist button
 * Toggle design with smooth animations
 */
export const WatchlistButton = ({ isInWatchlist = false, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 font-medium rounded-lg transition-all duration-300 overflow-hidden active:scale-95 min-h-[44px] ${
        isInWatchlist
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      } ${className}`}
    >
      {/* Ripple effect */}
      <span className="absolute inset-0 w-full h-full">
        <span className="absolute inset-0 rounded-lg bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300"></span>
      </span>
      
      {/* Content */}
      <span className="relative flex items-center gap-2 z-10">
        {isInWatchlist ? (
          <BookmarkCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4" />
        )}
        <span className="text-xs md:text-sm font-medium hidden sm:inline">
          {isInWatchlist ? "Đã Lưu" : "Lưu Phim"}
        </span>
      </span>
    </button>
  );
};

export default WatchlistButton;
