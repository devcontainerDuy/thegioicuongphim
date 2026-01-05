import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import movieService from "@/services/movieService";
import MovieCard from "@/components/shared/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, AlertCircle, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    const page = Number(searchParams.get("page")) || 1;
    
    // Filters from URL
    const type = searchParams.get("type") || "all";
    const genre = searchParams.get("genre") || "all";
    const year = searchParams.get("year") || "all";
    const country = searchParams.get("country") || "all";

    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({ currentPage: 1, totalPage: 1 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (type !== "all") filters.type = type;
            if (genre !== "all") filters.genre = genre;
            if (year !== "all") filters.year = year;
            if (country !== "all") filters.country = country;

            const response = await movieService.searchFilms(keyword, page, filters);
            setFilms(response?.items || []);
            setMeta({
                currentPage: response?.paginate?.current_page || 1,
                totalPage: response?.paginate?.total_page || 1
            });
        } catch (err) {
            console.error("Search error:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [keyword, page, type, genre, year, country]);

    useEffect(() => {
        if (!keyword && type === "all" && genre === "all" && year === "all" && country === "all") {
             setFilms([]);
             return;
        }

        fetchData();
        window.scrollTo(0, 0);
    }, [fetchData, keyword, type, genre, year, country]);

    const handlePageChange = (newPage) => {
        const params = Object.fromEntries([...searchParams]);
        params.page = newPage;
        setSearchParams(params);
    };

    const handleFilterChange = (key, value) => {
        const params = Object.fromEntries([...searchParams]);
        if (value === "all") {
            delete params[key];
        } else {
            params[key] = value;
        }
        params.page = 1; // Reset to page 1 on filter
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({ keyword });
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8 lg:px-12">
             <div className="container mx-auto">
                <div className="mb-8 border-b border-zinc-800 pb-6 space-y-6">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <SearchIcon className="w-8 h-8 text-primary" />
                            {keyword ? "Kết quả tìm kiếm:" : "Khám phá phim"}
                        </h1>
                        {keyword && <span className="text-2xl text-zinc-400 italic">"{keyword}"</span>}
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-400 mr-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Bộ lọc:</span>
                        </div>

                        {/* Type */}
                        <Select value={type} onValueChange={(v) => handleFilterChange("type", v)}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 h-9">
                                <SelectValue placeholder="Định dạng" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">Tất cả định dạng</SelectItem>
                                <SelectItem value="movie">Phim Lẻ</SelectItem>
                                <SelectItem value="series">Phim Bộ</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Genre */}
                        <Select value={genre} onValueChange={(v) => handleFilterChange("genre", v)}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 h-9">
                                <SelectValue placeholder="Thể loại" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">Tất cả thể loại</SelectItem>
                                <SelectItem value="Hành động">Hành động</SelectItem>
                                <SelectItem value="Tình cảm">Tình cảm</SelectItem>
                                <SelectItem value="Hài hước">Hài hước</SelectItem>
                                <SelectItem value="Kinh dị">Kinh dị</SelectItem>
                                <SelectItem value="Hoạt hình">Hoạt hình</SelectItem>
                                <SelectItem value="Viễn tưởng">Viễn tưởng</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Year */}
                        <Select value={year} onValueChange={(v) => handleFilterChange("year", v)}>
                            <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800 h-9">
                                <SelectValue placeholder="Năm" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">Tất cả năm</SelectItem>
                                {Array.from({ length: 10 }).map((_, i) => {
                                    const y = 2025 - i;
                                    return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                })}
                            </SelectContent>
                        </Select>

                        {/* Country */}
                        <Select value={country} onValueChange={(v) => handleFilterChange("country", v)}>
                            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 h-9">
                                <SelectValue placeholder="Quốc gia" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">Tất cả quốc gia</SelectItem>
                                <SelectItem value="Trung Quốc">Trung Quốc</SelectItem>
                                <SelectItem value="Việt Nam">Việt Nam</SelectItem>
                                <SelectItem value="Hàn Quốc">Hàn Quốc</SelectItem>
                                <SelectItem value="Mỹ">Mỹ</SelectItem>
                                <SelectItem value="Nhật Bản">Nhật Bản</SelectItem>
                            </SelectContent>
                        </Select>

                        {(type !== "all" || genre !== "all" || year !== "all" || country !== "all") && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-zinc-500 hover:text-white h-9 px-2"
                                onClick={clearFilters}
                            >
                                <X className="w-4 h-4 mr-1" /> Xóa lọc
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                         {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="w-full aspect-[2/3] rounded-lg bg-zinc-900" />
                                <Skeleton className="h-4 w-3/4 bg-zinc-900" />
                            </div>
                         ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium">Đã xảy ra lỗi khi tìm kiếm.</h3>
                        <p className="text-zinc-500 mt-2">Vui lòng thử lại sau.</p>
                    </div>
                ) : films.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                            {films.map((p, i) => (
                                <MovieCard
                                  key={i}
                                  name={p.name}
                                  slug={p.slug}
                                  image={p.thumb_url}
                                  totalEpisodes={p.total_episodes}
                                  currentEpisode={p.current_episode}
                                  time={p.time}
                                  quality={p.quality}
                                  averageScore={p.averageScore}
                                  totalRatings={p.totalRatings}
                                />
                            ))}
                        </div>

                         {/* Pagination */}
                         {meta.totalPage > 1 && (
                             <div className="flex justify-center gap-2 mt-12">
                                 <Button 
                                    variant="outline" 
                                    disabled={meta.currentPage === 1}
                                    onClick={() => handlePageChange(meta.currentPage - 1)}
                                    className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                                 >
                                    Trước
                                 </Button>
                                 <div className="flex items-center gap-1">
                                    <span className="px-4 py-2 bg-primary text-white font-bold rounded-md">{meta.currentPage}</span>
                                    <span className="text-zinc-600">/</span>
                                    <span className="text-zinc-400">{meta.totalPage}</span>
                                 </div>
                                  <Button 
                                    variant="outline" 
                                    disabled={meta.currentPage === meta.totalPage}
                                    onClick={() => handlePageChange(meta.currentPage + 1)}
                                    className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                                 >
                                    Sau
                                 </Button>
                             </div>
                         )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                         <SearchIcon className="w-20 h-20 text-zinc-800 mb-4" />
                         <h3 className="text-xl font-medium text-zinc-400">Không tìm thấy phim nào phù hợp.</h3>
                         <p className="text-zinc-600 mt-2">Hãy thử tìm với từ khóa khác xem sao?</p>
                    </div>
                )}
             </div>
        </div>
    );
}

export default Search;
