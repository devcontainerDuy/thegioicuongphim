import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import movieService from "@/services/movieService";
import MovieCard from "@/components/shared/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, AlertCircle } from "lucide-react";

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    const page = Number(searchParams.get("page")) || 1;

    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({ currentPage: 1, totalPage: 1 });

    useEffect(() => {
        if (!keyword) {
             setFilms([]);
             return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await movieService.searchFilms(keyword, page);
                // API structure might need adjustment depending on what verify returns, 
                // but assuming it returns standard { items: [], paginate: {} }
                setFilms(response.data?.items || []);
                setMeta({
                    currentPage: response.data?.paginate?.current_page || 1,
                    totalPage: response.data?.paginate?.total_page || 1
                });
            } catch (err) {
                console.error("Search error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [keyword, page]);

    const handlePageChange = (newPage) => {
        setSearchParams({ keyword, page: newPage });
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8 lg:px-12">
             <div className="container mx-auto">
                <div className="mb-8 border-b border-zinc-800 pb-6 flex items-baseline gap-3">
                     <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <SearchIcon className="w-8 h-8 text-primary" />
                        Kết quả tìm kiếm:
                     </h1>
                     <span className="text-2xl text-zinc-400 italic">"{keyword}"</span>
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
