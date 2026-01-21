import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Bookmark, ArrowRight, Star, Play, LayoutGrid, List } from "lucide-react";
import MovieCard from "@/components/shared/MovieCard";
import { useFilmsList } from "@/hooks/useFilmsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchWatchlist } from "@/store/reducers/watchlistSlice";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

function Watchlist() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const { items: watchlistItems, loading } = useSelector((state) => state.watchlist);
    const [viewMode, setViewMode] = React.useState("grid"); // "grid" | "list"

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWatchlist());
        }
    }, [isAuthenticated, dispatch]);

    // Fetch suggested films
    const { items: suggestedFilms, isLoading: loadingSuggestions } = useFilmsList({ 
        endpoint: "phim-moi-cap-nhat" 
    });

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Main Content: Watchlist Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <Bookmark className="w-8 h-8 text-primary fill-primary" />
                                    Danh Sách Xem Sau
                                </h1>
                                <p className="text-zinc-400 mt-2">
                                    Bạn đã lưu <span className="text-white font-bold">{watchlistItems.length}</span> phim để xem sau
                                </p>
                            </div>

                            {watchlistItems.length > 0 && (
                                <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                                    <Button 
                                        variant={viewMode === "grid" ? "secondary" : "ghost"} 
                                        size="icon" 
                                        className="h-8 w-8 rounded-md"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant={viewMode === "list" ? "secondary" : "ghost"} 
                                        size="icon" 
                                        className="h-8 w-8 rounded-md"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {loading && watchlistItems.length === 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl" />
                                ))}
                            </div>
                        ) : watchlistItems.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {watchlistItems.map((film, index) => (
                                        <div key={film.id || index} className="animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                            <MovieCard
                                                name={film.name}
                                                slug={film.slug}
                                                image={film.poster_url || film.thumb_url}
                                                time={film.time}
                                                quality={film.quality}
                                                originalName={film.original_name || film.originalName}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {watchlistItems.map((film, index) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={film.id || index}
                                            className="group flex gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50 hover:border-primary/50 transition-all"
                                        >
                                            <Link to={`/phim/${film.slug}`} className="w-24 h-36 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                                                <img src={film.thumb_url} alt={film.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </Link>
                                            <div className="flex-1 py-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <Link to={`/phim/${film.slug}`} className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                                            {film.name}
                                                        </Link>
                                                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                                            {film.quality || "HD"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-zinc-500 text-sm mt-1">{film.original_name || film.originalName}</p>
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                                                            {film.time || "N/A"}
                                                        </Badge>
                                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                                                            {film.year || "2024"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 px-6">
                                                        <Link to={`/phim/${film.slug}`}>
                                                            <Play className="w-4 h-4 mr-2 fill-current" /> Xem ngay
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
                                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <Bookmark className="w-10 h-10 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Chưa có phim nào</h3>
                                <p className="text-zinc-500 mb-8 text-center max-w-md">
                                    Bạn chưa lưu bộ phim nào để xem sau. Hãy khám phá và lưu lại những phim thú vị nhé!
                                </p>
                                <Button asChild className="rounded-full px-8 bg-primary hover:bg-primary/90">
                                    <Link to="/">
                                        Khám phá phim ngay <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Suggestions */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 backdrop-blur-sm sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                Có thể bạn sẽ thích
                            </h3>
                            <Separator className="bg-zinc-800 mb-4" />
                            
                            {loadingSuggestions ? (
                                <div className="space-y-4">
                                    {[1,2,3,4,5].map(i => (
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
                                    {suggestedFilms.slice(0, 6).map((film) => (
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
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Watchlist;
