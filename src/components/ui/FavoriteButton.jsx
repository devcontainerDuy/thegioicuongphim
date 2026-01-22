import { Heart } from "lucide-react";

/**
 * FavoriteButton - Heart button for favorites
 * Beautiful pulse animation on click
 */
export const FavoriteButton = ({ isFavorite = false, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        isFavorite
          ? "bg-red-500 text-white"
          : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
      } ${className}`}
    >
      {/* Pulse effect when favorited */}
      {isFavorite && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
      )}
      
      {/* Heart icon */}
      <span className="relative z-10">
        <Heart 
          className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
            isFavorite ? "fill-current scale-110" : "group-hover:scale-110"
          }`} 
        />
      </span>
    </button>
  );
};

export default FavoriteButton;
