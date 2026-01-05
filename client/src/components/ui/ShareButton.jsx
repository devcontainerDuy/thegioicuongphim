import { Share2 } from "lucide-react";

/**
 * ShareButton - Social share button
 * Hover effect with icon rotation
 */
export const ShareButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
    >
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 rounded-full blur-md bg-white/30"></span>
      </span>
      
      {/* Icon with rotation */}
      <span className="relative z-10">
        <Share2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
      </span>
    </button>
  );
};

export default ShareButton;
