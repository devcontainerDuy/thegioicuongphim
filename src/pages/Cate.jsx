import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useFilmsList } from "@/hooks/useFilmsList";
import { categories } from "@/utils/categories"; 
import { Loader2, Filter, ChevronRight } from "lucide-react";

import MovieCard from "@/components/shared/MovieCard";
import FadeContent from "@/components/bits/FadeContent";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "name", label: "Tên (A-Z)" },
  { value: "episodes", label: "Số tập nhiều" },
];

function Cate() {
    const { slug } = useParams();
    // Keep searchParams for ?cat= filter but NOT for page
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Internal State
    const [page, setPage] = useState(1);
    const [sortOption, setSortOption] = useState("recent");
    const observerRef = useRef();

    // Mapping params to endpoint
    const categoryParam = searchParams.get("category");
    const subParam = searchParams.get("sub");
    
    // Determine the current slug to lookup title
    // Logic: if URL is /danh-sach/phim-le -> slug is phim-le. 
    // If URL is /the-loai/hanh-dong -> slug is hanh-dong.
    // But here we rely on how useFilmsList expects endpoints.
    
    let endpoint = "";
    let effectiveSlug = slug;

    if (!slug && categoryParam) {
        endpoint = categoryParam;
        effectiveSlug = categoryParam;
        if (subParam) {
            endpoint += `/${subParam}`;
            effectiveSlug = subParam;
        }
    } else if (slug) {
         // Existing logic in App routing might be /danh-sach/:slug or /the-loai/:slug
         // If we are here, we might need to construct endpoint manually or trust the slug
         // Check if slug matches a category or genre
         endpoint = slug === "danh-sach-phim" ? "danh-sach/phim-le" : `the-loai/${slug}`;
         if (categoryParam) endpoint = categoryParam; // Override if params exist (legacy)
         if (subParam) endpoint += `/${subParam}`;
    } else {
        endpoint = "danh-sach/phim-le"; // Fallback
    }

    // Attempt to find title
    const currentCategory = categories.find(c => c.slug === (categoryParam || slug)) || categories.find(c => c.item?.some(sub => sub.slug === (subParam || slug)));
    const currentSub = currentCategory?.item?.find(i => i.slug === (subParam || slug));
    const title = currentSub?.name || currentCategory?.name || "Danh sách phim";

    // Reset page to 1 whenever endpoint changes
    useEffect(() => {
        setPage(1);
        window.scrollTo(0, 0);
    }, [endpoint]);

    // Fetch Data
    const { items, loading, error, meta } = useFilmsList({ endpoint, page, isInfinite: true });
    
    // Infinite Scroll Observer
    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && meta.currentPage < meta.totalPage) {
                setPage(prev => prev + 1);
            }
        });
        
        if (node) observerRef.current.observe(node);
    }, [loading, meta.currentPage, meta.totalPage]);

    // Handle Mobile Filter Toggle
    const [showFilters, setShowFilters] = useState(false);

    // Sorting logic (Frontend sort for now, ideally backend)
    const displayFilms = React.useMemo(() => {
        if (!items) return [];
        let sorted = [...items];
        if (sortOption === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOption === "episodes") sorted.sort((a, b) => (parseInt(b.episode_current || 0) || 0) - (parseInt(a.episode_current || 0) || 0));
        return sorted;
    }, [items, sortOption]);

    const handleCategoryClick = (catSlug) => {
        setSearchParams({ category: catSlug, page: 1 });
    };

    const handleSubClick = (catSlug, subSlug) => {
        setSearchParams({ category: catSlug, sub: subSlug, page: 1 });
    };

    const handleReset = () => {
         setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8 lg:px-12">
            <FadeContent>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden w-full mb-4">
                        <Button 
                            variant="outline" 
                            className="w-full flex items-center gap-2 justify-between"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Bộ Lọc</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                        </Button>
                    </div>

                    {/* Sidebar / Filter */}
                    <aside className={`w-full lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-card dark:bg-zinc-900/50 border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">Danh mục</h3>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="h-auto p-0 text-muted-foreground hover:text-foreground">
                                    Làm mới
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {categories.map((cat) => {
                                    const isActive = cat.slug === (categoryParam || slug);
                                    return (
                                        <div key={cat.slug} className="space-y-2">
                                            <button
                                                onClick={() => handleCategoryClick(cat.slug)}
                                                className={cn(
                                                    "w-full flex items-center justify-between text-left text-sm font-medium transition-colors p-2 rounded-lg",
                                                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800 hover:text-foreground"
                                                )}
                                            >
                                                {cat.name}
                                                {isActive && <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            
                                            {isActive && cat.item && (
                                                <div className="pl-4 border-l-2 border-border dark:border-zinc-800 space-y-1 ml-2">
                                                    {cat.item.map(subItem => (
                                                        <button
                                                            key={subItem.slug}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSubClick(cat.slug, subItem.slug);
                                                            }}
                                                            className={cn(
                                                                "block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors",
                                                                (subParam === subItem.slug) 
                                                                    ? "text-primary font-bold bg-muted dark:bg-zinc-800" 
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {subItem.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 w-full min-w-0">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border dark:border-zinc-800">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-foreground">{title}</h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {meta.totalPage > 1 ? `Hơn ${meta.totalPage * 24} phim đang chờ bạn khám phá` : "Cập nhật mới nhất"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:block">Sắp xếp:</span>
                                <Select value={sortOption} onValueChange={setSortOption}>
                                    <SelectTrigger className="w-[180px] bg-card dark:bg-zinc-900 border-border dark:border-zinc-700">
                                        <SelectValue placeholder="Sắp xếp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Movie Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                            {displayFilms.map((movie, index) => {
                                // Attach ref to the last element
                                if (displayFilms.length === index + 1) {
                                    return (
                                        <div ref={lastElementRef} key={`${movie.slug}-${index}-last`} className="w-full">
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
                                        <MovieCard
                                            key={`${movie.slug}-${index}`}
                                            name={movie.name}
                                            slug={movie.slug}
                                            image={movie.thumb_url}
                                            totalEpisodes={movie.episode_current}
                                            currentEpisode={movie.current_episode}
                                            time={movie.time}
                                            quality={movie.quality}
                                        />
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
                        {!loading && displayFilms.length === 0 && !error && (
                             <div className="text-center py-20 bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                <p className="text-muted-foreground">Chưa có phim nào trong mục này.</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-10 text-destructive">
                                <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                            </div>
                        )}
                        
                        {/* End of list indicator */}
                        {!loading && !error && displayFilms.length > 0 && meta.currentPage >= meta.totalPage && (
                             <div className="text-center py-12 text-muted-foreground text-sm italic">
                                Bạn đã xem hết danh sách.
                            </div>
                        )}
                    </main>
                </div>
            </FadeContent>
        </div>
    );
}

export default Cate;
