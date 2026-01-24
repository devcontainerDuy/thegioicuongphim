import React from "react";
import { Link } from "react-router-dom";
import { Filter, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MovieCard from "@/components/shared/MovieCard";
import FadeContent from "@/components/bits/FadeContent";

export const MovieListingLayout = ({
    title,
    description,
    items = [],
    loading = false,
    error = null,
    viewMode = "grid",
    onViewModeChange,
    sortOption,
    onSortChange,
    sortOptions = [],
    currentPage,
    totalPage,
    onPageChange,
    sidebar,
    showSidebar = true,
    lastElementRef, // For infinite scroll
    emptyMessage = "Chưa có phim nào trong mục này.",
    onToggleSidebar, // Mobile sidebar toggle
    showMobileSidebar // Mobile sidebar state
}) => {
    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8 lg:px-12">
            <FadeContent>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Mobile Filter Toggle */}
                    {sidebar && (
                        <div className="lg:hidden w-full mb-4">
                            <Button 
                                variant="outline" 
                                className="w-full flex items-center gap-2 justify-between"
                                onClick={onToggleSidebar}
                            >
                                <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Bộ Lọc</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${showMobileSidebar ? 'rotate-90' : ''}`} />
                            </Button>
                        </div>
                    )}

                    {/* Sidebar / Filter */}
                    {sidebar && (
                        <aside className={`w-full lg:w-64 shrink-0 space-y-6 ${showMobileSidebar ? 'block' : 'hidden lg:block'}`}>
                            {sidebar}
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0">
                        {/* Header */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-6 border-b border-border dark:border-zinc-800">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-foreground">{title}</h1>
                                {description && (
                                    <p className="text-muted-foreground text-sm mt-1">{description}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground hidden sm:block">Chế độ xem:</span>
                                    <Select value={viewMode} onValueChange={onViewModeChange}>
                                        <SelectTrigger className="w-[140px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                                             <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pagination">Phân trang</SelectItem>
                                            <SelectItem value="infinite">Xem vô tận</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Options */}
                                {sortOptions.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground hidden sm:block">Sắp xếp:</span>
                                        <Select value={sortOption} onValueChange={onSortChange}>
                                            <SelectTrigger className="w-[140px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                                                <SelectValue placeholder="Sắp xếp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sortOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Movie Grid */}
                        <div className={viewMode === "grid" 
                            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8"
                            : "space-y-4"
                        }>
                            {items.map((movie, index) => {
                                // Attach ref to the last element ONLY if Infinite Mode
                                const isLast = viewMode === "infinite" && items.length === index + 1;
                                const ref = isLast ? lastElementRef : null;

                                if (viewMode === "grid") {
                                    return (
                                        <div ref={ref} key={`${movie.slug}-${index}-grid`} className="w-full">
                                            <MovieCard
                                                name={movie.name}
                                                slug={movie.slug}
                                                image={movie.thumb_url}
                                                totalEpisodes={movie.episode_current}
                                                currentEpisode={movie.current_episode}
                                                time={movie.time}
                                                quality={movie.quality}
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div ref={ref} key={`${movie.slug}-${index}-list`}>
                                            <ListItem movie={movie} />
                                        </div>
                                    );
                                }
                            })}
                        </div>
                        
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-8 w-full mt-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}
                        
                        {/* Empty State */}
                        {!loading && items.length === 0 && !error && (
                             <div className="text-center py-20 bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                <p className="text-muted-foreground">{emptyMessage}</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-10 text-destructive">
                                <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                            </div>
                        )}
                        
                        {/* End of list indicator (Infinite Mode) */}
                        {viewMode === "infinite" && !loading && !error && items.length > 0 && currentPage >= totalPage && (
                             <div className="text-center py-12 text-muted-foreground text-sm italic">
                                Bạn đã xem hết danh sách.
                            </div>
                        )}

                        {/* Pagination Controls (Pagination Mode) */}
                        {viewMode === "pagination" && totalPage > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <Button 
                                    variant="outline" 
                                    disabled={currentPage === 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                    className="bg-card dark:bg-black border-border dark:border-zinc-700 text-foreground dark:text-white hover:bg-muted dark:hover:bg-zinc-900"
                                >
                                    Trước
                                </Button>
                                <div className="flex items-center gap-1">
                                    <span className="px-4 py-2 bg-primary text-white font-bold rounded-md">{currentPage}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-muted-foreground">{totalPage}</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    disabled={currentPage === totalPage}
                                    onClick={() => onPageChange(currentPage + 1)}
                                    className="bg-card dark:bg-black border-border dark:border-zinc-700 text-foreground dark:text-white hover:bg-muted dark:hover:bg-zinc-900"
                                >
                                    Sau
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </FadeContent>
        </div>
    );
};

// Internal List Item Component for "List View Mode"
const ListItem = ({ movie }) => (
    <div className="group flex gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50 hover:border-primary/50 transition-all">
        <Link
            to={`/phim/${movie.slug}`}
            className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl overflow-hidden shrink-0 border border-zinc-800"
        >
            <img
                src={movie.thumb_url}
                alt={movie.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
        </Link>
        <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
            <div>
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <Link
                        to={`/phim/${movie.slug}`}
                        className="text-base sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                    >
                        {movie.name}
                    </Link>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 shrink-0">
                        {movie.quality || "HD"}
                    </Badge>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-1">
                    {movie.original_name || movie.originalName}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-4">
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                        {movie.time || "N/A"}
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] h-5">
                        {movie.year || "2024"}
                    </Badge>
                </div>
            </div>
            {/* Optional: Add Play Button or other actions here */}
        </div>
    </div>
);

export default MovieListingLayout;
