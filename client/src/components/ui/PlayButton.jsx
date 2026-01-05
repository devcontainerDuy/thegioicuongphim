import { Play } from "lucide-react";

/**
 * PlayButton - Cinematic play button for movies
 * Inspired by UIverse.io with movie theme
 */
export const PlayButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 ${className}`}
    >
      {/* Animated gradient background */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 transition-all duration-300 ease-out group-hover:from-red-500 group-hover:via-orange-500 group-hover:to-yellow-500"></span>
      
      {/* Shine effect */}
      <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000"></span>
      </span>
      
      {/* Content */}
      <span className="relative flex items-center gap-2 z-10">
        <Play className="w-5 h-5 fill-current" />
        <span className="text-base md:text-lg font-bold tracking-wide">Xem Ngay</span>
      </span>
    </button>
  );
};

export default PlayButton;
