import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilmDetail } from "@/hooks/useFilmDetail";
import { toggleWatchlist } from "@/store/reducers/watchlistSlice";
import { cn } from "@/lib/utils";
import SEO from "@/components/common/SEO";
import FadeContent from "@/components/bits/FadeContent";
import ReviewSection from "@/components/ui/ReviewSection";
import { backendApiClient } from '@/config/apiClient';
import CommentSection from "@/components/ui/CommentSection";
import { Badge } from "@/components/ui/badge";
import PlayButton from "@/components/ui/PlayButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import WatchlistButton from "@/components/ui/WatchlistButton";
import ShareButton from "@/components/ui/ShareButton";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/ui/StarRating";
import BlurText from "@/components/bits/BlurText";
import { motion } from "framer-motion";

function Detail() {
    const { slug } = useParams();
    const { film: data, loading, error } = useFilmDetail(slug);
    const dispatch = useDispatch();
    
    // FavoriteButton is now self-contained with watchlist logic

    // Watchlist
    const watchlist = useSelector((state) => state.watchlist.items);
    const isInWatchlist = useMemo(() => watchlist.some((film) => film.id === data?.id), [watchlist, data]);
    const [isDescExpanded, setIsDescExpanded] = useState(false);



    // Log view on load
    useEffect(() => {
        const logView = async () => {
            if (data?.id) {
                try {
                    await backendApiClient.post(`/movies/${data.id}/view`, data);
                } catch (error) {
                    console.error('Failed to log view:', error);
                }
            }
        };
        
        // Slight delay to ensure it's a real view
        const timer = setTimeout(logView, 2000);
        return () => clearTimeout(timer);
    }, [data?.id, data]);

    const handleWatchlistClick = async () => {
        if (data) {
            try {
                await dispatch(toggleWatchlist(data)).unwrap();
                toast.success(!isInWatchlist ? 'Đã thêm vào danh sách xem sau' : 'Đã xóa khỏi danh sách xem sau');
            } catch (err) {
                toast.error('Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };

    if (loading) {
        return (
             <div className="min-h-screen bg-black pt-[64px]">
                 <div className="h-[70vh] w-full relative">
                     <Skeleton className="absolute inset-0 bg-zinc-900" />
                 </div>
             </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center pt-[64px]">
                <div className="text-center text-zinc-400">
                    <p className="text-xl mb-4">{error || 'Không tìm thấy phim'}</p>
                    <Link to="/" className="text-primary hover:underline">Về trang chủ</Link>
                </div>
            </div>
        );
    }

    // Prepare Movie Schema
    const movieSchema = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": data.name,
        "alternateName": data.original_name,
        "description": data.description,
        "image": data.poster_url || data.thumb_url,
        "datePublished": data.year,
        "director": data.director?.split(',').map(d => ({ "@type": "Person", "name": d.trim() })),
        "actor": data.actor?.split(',').map(a => ({ "@type": "Person", "name": a.trim() })),
    };

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
    const firstEpisodeLink = firstEpisodeSlug ? `/xem-phim/${data.slug}/${firstEpisodeSlug}` : `/phim/${data.slug}`;

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            <SEO 
                title={data.name} 
                description={data.description} 
                image={data.poster_url || data.thumb_url}
                schema={movieSchema}
            />
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
                            {/* Actions */}
                            <FadeContent delay={0.4}>
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Play Button */}
                                    <Link to={firstEpisodeLink}>
                                        <PlayButton />
                                    </Link>

                                    {/* Favorite Button (uses watchlist internally) */}
                                    <FavoriteButton movie={data} />

                                    {/* Watchlist Button */}
                                    <WatchlistButton 
                                        isInWatchlist={isInWatchlist}
                                        onClick={handleWatchlistClick}
                                    />

                                    {/* Share Button */}
                                    <ShareButton onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Đã sao chép link!');
                                    }} />
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
                                     <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Quốc gia</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300">
                                             {country}
                                         </span>
                                     </div>
                                     <div className="grid grid-cols-3 gap-2">
                                         <span className="text-muted-foreground">Khởi Chiếu</span>
                                         <span className="col-span-2 text-foreground dark:text-zinc-300">
                                             {releaseYear}
                                         </span>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </FadeContent>
            </div>
        </div>
    );
}

export default Detail;
