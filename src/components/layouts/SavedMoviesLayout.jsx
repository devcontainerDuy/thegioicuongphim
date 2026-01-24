import React from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/shared/MovieCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

/**
 * SavedMoviesLayout - Unified layout for Favorites & Watchlist pages
 * Reduces code duplication between similar pages
 */
export const SavedMoviesLayout = ({ title, icon, items = [], emptyMessage, emptyDescription, viewMode = "grid", onViewModeChange, isLoading = false }) => {
    console.log(items);

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            {icon && React.createElement(icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                            {title}
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Bạn đang theo dõi <span className="text-white font-bold">{items.length}</span> phim
                        </p>
                    </div>

                    {items.length > 0 && (
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-md" onClick={() => onViewModeChange?.("grid")}>
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-md" onClick={() => onViewModeChange?.("list")}>
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl" />
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {items.map((film, index) => (
                                <>
                                    <div key={film.id || index} className="animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                        <MovieCard name={film.name} slug={film.slug} image={film.thumbUrl || film.posterUrl} time={film.time} quality={film.quality} originalName={film.original_name || film.originalName} />
                                    </div>
                                </>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((film, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={film.id || index}
                                    className="group flex gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50 hover:border-primary/50 transition-all"
                                >
                                    <Link to={`/phim/${film.slug}`} className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                                        <img src={film.thumbUrl} alt={film.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </Link>
                                    <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                                                <Link to={`/phim/${film.slug}`} className="text-base sm:text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                                    {film.name}
                                                </Link>
                                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 shrink-0">
                                                    {film.quality || "HD"}
                                                </Badge>
                                            </div>
                                            <p className="text-zinc-500 text-xs sm:text-sm mt-1 line-clamp-1">{film.original_name || film.originalName}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-4">
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                                                    {film.time || "N/A"}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                                                    {film.year || "2024"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm">
                                                <Link to={`/phim/${film.slug}`}>
                                                    <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 fill-current" />
                                                    <span className="hidden xs:inline">Xem ngay</span>
                                                    <span className="xs:hidden">Xem</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">{icon && React.createElement(icon, { className: "w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" })}</div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{emptyMessage}</h3>
                        <p className="text-zinc-500 mb-6 sm:mb-8 text-center max-w-md text-sm sm:text-base px-4">{emptyDescription}</p>
                        <Button asChild className="rounded-full px-6 sm:px-8 bg-primary hover:bg-primary/90">
                            <Link to="/">
                                Khám phá phim ngay <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedMoviesLayout;
