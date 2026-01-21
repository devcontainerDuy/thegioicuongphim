import { Info } from "lucide-react";

/**
 * TrailerButton - Button for movie trailer/info
 * Glassmorphism design perfect for movie websites
 */
export const TrailerButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white overflow-hidden rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 ${className}`}
    >
      {/* Glow effect on hover */}
      <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 blur-xl bg-white/30"></span>
      </span>
      
      {/* Content */}
      <span className="relative flex items-center gap-2 z-10">
        <Info className="w-5 h-5" />
        <span className="text-base font-semibold">Chi Tiết</span>
      </span>
    </button>
  );
};

export default TrailerButton;
