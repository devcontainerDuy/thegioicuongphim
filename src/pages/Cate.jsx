import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useFilmsList } from "@/hooks/useFilmsList";
import { categories } from "@/utils/categories"; 
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MovieListingLayout from "@/components/layouts/MovieListingLayout";

const SORT_OPTIONS = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "name", label: "Tên (A-Z)" },
  { value: "episodes", label: "Số tập nhiều" },
];

function Cate() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Internal State
    const [page, setPage] = useState(1);
    const [sortOption, setSortOption] = useState("recent");
    const [viewMode, setViewMode] = useState("pagination");
    const [showFilters, setShowFilters] = useState(false); // Mobile sidebar state
    const observerRef = useRef();

    // Mapping params to endpoint
    const categoryParam = searchParams.get("category");
    const subParam = searchParams.get("sub");
    
    let endpoint = "";
    if (!slug && categoryParam) {
        endpoint = categoryParam;
        if (subParam) endpoint += `/${subParam}`;
    } else if (slug) {
         endpoint = slug === "danh-sach-phim" ? "danh-sach/phim-le" : `the-loai/${slug}`;
         if (categoryParam) endpoint = categoryParam; 
         if (subParam) endpoint += `/${subParam}`;
    } else {
        endpoint = "danh-sach/phim-le"; 
    }

    // Attempt to find title
    const currentCategory = categories.find(c => c.slug === (categoryParam || slug)) || categories.find(c => c.item?.some(sub => sub.slug === (subParam || slug)));
    const currentSub = currentCategory?.item?.find(i => i.slug === (subParam || slug));
    const title = currentSub?.name || currentCategory?.name || "Danh sách phim";

    // Reset page to 1 whenever endpoint changes or viewMode changes
    useEffect(() => {
        setPage(1);
        window.scrollTo(0, 0);
    }, [endpoint, viewMode]);

    // Fetch Data
    const { items, loading, error, meta } = useFilmsList({ endpoint, page, isInfinite: viewMode === "infinite" });
    
    // Infinite Scroll Observer
    const lastElementRef = useCallback(node => {
        if (loading || viewMode !== "infinite") return;
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && meta.currentPage < meta.totalPage) {
                setPage(prev => prev + 1);
            }
        });
        
        if (node) observerRef.current.observe(node);
    }, [loading, meta.currentPage, meta.totalPage, viewMode]);

    // Sorting logic
    const displayFilms = React.useMemo(() => {
        if (!items) return [];
        let sorted = [...items];
        if (sortOption === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOption === "episodes") sorted.sort((a, b) => (parseInt(b.episode_current || 0) || 0) - (parseInt(a.episode_current || 0) || 0));
        return sorted;
    }, [items, sortOption]);

    const handleCategoryClick = (catSlug) => setSearchParams({ category: catSlug, page: 1 });
    const handleSubClick = (catSlug, subSlug) => setSearchParams({ category: catSlug, sub: subSlug, page: 1 });
    const handleReset = () => setSearchParams({});

    const handlePageChange = (newPage) => {
         setPage(newPage);
         window.scrollTo(0, 0);
         const newParams = { ...Object.fromEntries(searchParams) };
         newParams.page = newPage;
         setSearchParams(newParams);
    };

    // Sidebar Component
    const Sidebar = (
        <div className="bg-card dark:bg-zinc-900/50 border border-border rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Danh mục</h3>
                <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">
                    Làm mới
                </button>
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
    );

    return (
        <MovieListingLayout
            title={title}
            description={meta.totalPage > 1 ? `Hơn ${meta.totalPage * 24} phim đang chờ bạn khám phá` : "Cập nhật mới nhất"}
            items={displayFilms}
            loading={loading}
            error={error}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortOption={sortOption}
            onSortChange={setSortOption}
            sortOptions={SORT_OPTIONS}
            currentPage={page}
            totalPage={meta.totalPage}
            onPageChange={handlePageChange}
            sidebar={Sidebar}
            showMobileSidebar={showFilters}
            onToggleSidebar={() => setShowFilters(!showFilters)}
            lastElementRef={lastElementRef}
        />
    );
}

export default Cate;
