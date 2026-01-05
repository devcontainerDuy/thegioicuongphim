import React, { useCallback, useMemo, useState, useEffect } from "react";
import movieService from "@/services/movieService";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { addFavorite, removeFavorite } from "@/store/reducers/favoritesSlice";
import { useFilmDetail } from "@/hooks/useFilmDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import FadeContent from "@/components/bits/FadeContent";
import BlurText from "@/components/bits/BlurText";
import StarRating from "@/components/ui/StarRating";
import CommentSection from "@/components/ui/CommentSection";
import ReviewSection from "@/components/ui/ReviewSection";

function Detail() {
    const { slug } = useParams();
    const { film: data, loading, error } = useFilmDetail(slug);
    const dispatch = useDispatch();
    const favoriteList = useSelector((state) => state.favorites.items);
    const isFavorite = useMemo(() => favoriteList.some((film) => film.id === data?.id), [favoriteList, data]);

    const handleFavoriteClick = useCallback(() => {
        if (data) {
            dispatch(isFavorite ? removeFavorite(data.id) : addFavorite(data));
        }
    }, [data, isFavorite, dispatch]);

    const [isDescExpanded, setIsDescExpanded] = useState(false);

    if (loading) {
        return (
             <div className="min-h-screen bg-black pt-[64px]">
                <Skeleton className="w-full h-[60vh] bg-zinc-800" />
                <div className="container mx-auto px-4 py-8 space-y-4">
                     <Skeleton className="h-10 w-1/3 bg-zinc-800" />
                     <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                     <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </div>
             </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-black">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">Không tìm thấy phim</h2>
                    <Button asChild variant="outline">
                        <Link to="/">Quay về trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Data parsing
    const categoryList = data?.category?.[2]?.list?.map((item) => item.name).join(", ") || "N/A";
    const releaseYear = data?.category?.[3]?.list?.[0]?.name || "N/A";
    const country = data?.category?.[4]?.list?.[0]?.name || "N/A";
    const episodes = data?.episodes?.flatMap((episode) => episode?.items?.map((item) => ({
            name: item.name,
            slug: item.slug,
            embed: item.embed,
        }))) || [];

    const firstEpisodeSlug = episodes?.[0]?.slug;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Backdrop Section */}
            <div className="relative w-full h-[70vh] md:h-[85vh]">
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${data.poster_url || data.thumb_url})` }}
                >
                    {/* Gradient Overlay: Bottom blends with theme (subtle), Side stays dark for white text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                </motion.div>
                
                <div className="absolute inset-0 flex items-end pb-12 md:pb-20">
                    <div className="container mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-8 items-end">
                        <div className="md:col-span-2 space-y-6">
                            <BlurText 
                                text={data.name} 
                                className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none drop-shadow-2xl text-white" 
                            />
                            
                            <FadeContent delay={0.3}>
                                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-300 font-medium">
                                    <span className="text-green-500 font-bold px-2 py-0.5 border border-green-500 rounded">{data.quality}</span>
                                    <span>{releaseYear}</span>
                                    <span>{data.time}</span>
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">{country}</Badge>
                                </div>
                                 {/* Star Rating */}
                                 <StarRating 
                                    movieId={data.id} 
                                    slug={data.slug} 
                                    movieData={data}
                                    className="mt-3" 
                                 />
                            </FadeContent>

                            <FadeContent delay={0.5}>
                                <div className="flex gap-4 pt-4">
                                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                        <Link to={firstEpisodeSlug ? `/xem-phim/${data.slug}/${firstEpisodeSlug}` : "#"}>
                                            <Play className="w-6 h-6 mr-2 fill-current" /> Xem Ngay
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="h-14 px-6 text-lg border-zinc-600 hover:bg-zinc-800 text-white bg-black/40 backdrop-blur-sm"
                                        onClick={handleFavoriteClick}
                                    >
                                        {isFavorite ? (
                                            <><Check className="w-6 h-6 mr-2 text-green-500" /> Đã Yêu Thích</>
                                        ) : (
                                            <><Plus className="w-6 h-6 mr-2" /> Thêm Yêu Thích</>
                                        )}
                                    </Button>
                                </div>
                            </FadeContent>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 md:px-12 py-12 -mt-10 relative z-10">
                <FadeContent delay={0.6}>
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left: Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">Nội Dung</h3>
                                <div className="relative">
                                    <p className={cn("text-foreground leading-relaxed text-lg", !isDescExpanded && "line-clamp-3")}>
                                        {data.description}
                                    </p>
                                    <button 
                                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                                        className="text-primary hover:underline text-sm font-medium mt-2 flex items-center"
                                    >
                                        {isDescExpanded ? <span className="flex items-center"><ChevronUp className="w-4 h-4 mr-1"/> Thu gọn</span> : <span className="flex items-center"><ChevronDown className="w-4 h-4 mr-1"/> Xem thêm</span>}
                                    </button>
                                </div>
                            </div>

                             {/* Episodes Grid */}
                             <div className="space-y-4">
                                <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                    Danh Sách Tập
                                    <span className="text-sm font-normal normal-case text-muted-foreground">{episodes.length} tập</span>
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {episodes.map((ep, i) => (
                                        <Link 
                                            key={i} 
                                            to={`/xem-phim/${data.slug}/${ep.slug}`}
                                            className="bg-card dark:bg-zinc-900 hover:bg-muted dark:hover:bg-zinc-800 border border-border dark:border-zinc-800 text-foreground dark:text-zinc-300 text-center py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                                        >
                                            {ep.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                             {/* Comment Section */}
                             <div className="pt-8 border-t border-border dark:border-zinc-800 space-y-12">
                                <ReviewSection 
                                    movieId={data.id || data.slug} 
                                    slug={data.slug}
                                    movieData={data}
                                />

                                <CommentSection 
                                    movieId={data.id || data.slug} 
                                    slug={data.slug}
                                    movieData={data}
                                />
                             </div>
                        </div>

                        {/* Right: Meta */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-card dark:bg-zinc-900/50 p-6 rounded-xl border border-border dark:border-zinc-800 space-y-4 shadow-sm">
                                 <h4 className="font-bold text-foreground dark:text-white border-b border-border dark:border-zinc-800 pb-2 mb-4">Thông Tin Chi Tiết</h4>
                                 
                                 <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-muted-foreground">Tên gốc</span>
                                        <span className="col-span-2 text-foreground dark:text-zinc-300 italic">{data.original_name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <span className="col-span-2 text-primary font-medium">{data.current_episode}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Quốc gia</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300">
                                             {Array.isArray(data.countries) ? (
                                                 data.countries.map((c, i) => (
                                                     <React.Fragment key={c}>
                                                         <Link to={`/tim-kiem?country=${encodeURIComponent(c)}`} className="hover:text-primary transition-colors">{c}</Link>
                                                         {i < data.countries.length - 1 && ", "}
                                                     </React.Fragment>
                                                 ))
                                             ) : (
                                                 data.category?.['4']?.list?.[0]?.name ? (
                                                     <Link to={`/tim-kiem?country=${encodeURIComponent(data.category['4'].list[0].name)}`} className="hover:text-primary transition-colors">
                                                         {data.category['4'].list[0].name}
                                                     </Link>
                                                 ) : "Đang cập nhật"
                                             )}
                                         </span>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Đạo diễn</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300">
                                             {data.director ? (
                                                 <Link to={`/tim-kiem?keyword=${encodeURIComponent(data.director)}`} className="hover:text-primary transition-colors">
                                                     {data.director}
                                                 </Link>
                                             ) : "Đang cập nhật"}
                                         </span>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Diễn viên</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300 line-clamp-3">
                                             {Array.isArray(data.casts) ? (
                                                 data.casts.map((actor, i) => (
                                                     <React.Fragment key={actor}>
                                                         <Link to={`/tim-kiem?keyword=${encodeURIComponent(actor)}`} className="hover:text-primary transition-colors">{actor}</Link>
                                                         {i < data.casts.length - 1 && ", "}
                                                     </React.Fragment>
                                                 ))
                                             ) : (
                                                 data.casts || "Đang cập nhật"
                                             )}
                                         </span>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Thể loại</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300">
                                             {Array.isArray(data.genres) ? (
                                                 data.genres.map((g, i) => (
                                                     <React.Fragment key={g}>
                                                         <Link to={`/tim-kiem?genre=${encodeURIComponent(g)}`} className="hover:text-primary transition-colors">{g}</Link>
                                                         {i < data.genres.length - 1 && ", "}
                                                     </React.Fragment>
                                                 ))
                                             ) : (
                                                 categoryList
                                             )}
                                         </span>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </FadeContent>
            </div>

            {/* Similar Movies Section */}
            {data?.id && (
                <div className="container mx-auto px-4 md:px-12 pb-20">
                    <SimilarMovies movieId={data.id} />
                </div>
            )}
        </div>
    );
}

// Sub-component for Similar Movies
function SimilarMovies({ movieId }) {
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const results = await movieService.getSimilarMovies(movieId, 12);
                setSimilar(results);
            } catch (error) {
                console.error("Failed to fetch similar movies:", error);
            } finally {
                setLoading(false); // Original line
            }
        };
        fetchSimilar();
    }, [movieId]);

    if (!loading && similar.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full" />
                Phim Tương Tự
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="w-full aspect-[2/3] rounded-lg bg-zinc-900" />
                            <Skeleton className="h-4 w-3/4 bg-zinc-900" />
                        </div>
                    ))
                ) : (
                    similar.map((movie) => (
                        <Link 
                            key={movie.id} 
                            to={`/phim/${movie.slug}`}
                            className="group block space-y-3"
                        >
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/10">
                                <img 
                                    src={movie.thumb_url} 
                                    alt={movie.name} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                                    <Button size="sm" className="w-full h-8 text-[10px] uppercase font-bold tracking-wider">
                                        Xem ngay
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                    {movie.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate italic">
                                    {movie.original_name}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default Detail;
