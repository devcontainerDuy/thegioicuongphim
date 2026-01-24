import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWatchlist } from "@/store/reducers/watchlistSlice";

/**
 * FavoriteButton - Heart button that adds to watchlist (unified collection)
 * Beautiful pulse animation on click
 * @param {Object} props
 * @param {Object} props.movie - Movie object to add/remove
 * @param {string} props.className - Additional CSS classes
 */
export const FavoriteButton = ({ movie, className = "" }) => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.items);
  const isInWatchlist = watchlist.some((item) => item.id === movie.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWatchlist(movie));
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative inline-flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        isInWatchlist
          ? "bg-red-500 text-white"
          : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
      } ${className}`}
    >
      {/* Pulse effect when in watchlist */}
      {isInWatchlist && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
      )}
      
      {/* Heart icon */}
      <span className="relative z-10">
        <Heart 
          className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
            isInWatchlist ? "fill-current scale-110" : "group-hover:scale-110"
          }`} 
        />
      </span>
    </button>
  );
};

export default FavoriteButton;
