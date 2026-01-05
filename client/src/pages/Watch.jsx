import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import { useFilmDetail } from "@/hooks/useFilmDetail";
import { useAuth } from "@/contexts/AuthContext"; // Import Auth Context
import userService from "@/services/userService"; // Import User Service
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Info, AlertTriangle, Maximize, Minimize, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Spotlight from "@/components/bits/Spotlight";
import { cn } from "@/lib/utils";
import CommentSection from "@/components/ui/CommentSection";

import { saveWatchHistory } from "@/utils/storage";

function Watch() {
    const { slug, episode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user status
    const { film: data, loading, error } = useFilmDetail(slug);
    
    // UI States
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
    const [showAutoPlayOverlay, setShowAutoPlayOverlay] = useState(false);

    // Derived state for current episode
    const episodeList = useMemo(() => {
        if (!data?.episodes) return [];
        return data.episodes.flatMap(group => group.items);
    }, [data]);

    const currentEpisode = useMemo(() => {
        if (!episodeList.length) return null;
        const found = episodeList.find(item => item.slug === episode);
        return found || episodeList[0];
    }, [episodeList, episode]);

    const currentIndex = useMemo(() => {
        return episodeList.findIndex(ep => ep.slug === currentEpisode?.slug);
    }, [episodeList, currentEpisode]);

    // Save history helper
    const saveProgress = async (progress) => {
        if (!data || !currentEpisode) return;

        // 1. Always save to LocalStorage (fallback/guest)
        saveWatchHistory(data, currentEpisode, progress);

        // 2. If User Logged In -> Save to Backend
        if (user) {
            try {
                // Pass full data for "Sync-on-Watch"
                await userService.saveWatchProgress(
                    data.id || data.slug,       // ID or Slug
                    currentEpisode.id || currentEpisode.slug, // ID or Slug
                    progress,
                    data,                       // Full Movie Data
                    currentEpisode              // Full Episode Data
                );
            } catch (err) {
                console.error("Failed to save history to backend", err);
            }
        }
    };

    // Save history on mount or episode change (Progress 0%)
    useEffect(() => {
        if (data && currentEpisode) {
            saveProgress(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.id, currentEpisode?.slug]); // Use IDs/Slugs to prevent loops

    const handleNextEpisode = useCallback(() => {
        if (currentIndex < episodeList.length - 1) {
            const nextEp = episodeList[currentIndex + 1];
            navigate(`/xem-phim/${slug}/${nextEp.slug}`);
            // Reset countdown state
            setAutoPlayCountdown(0);
            setShowAutoPlayOverlay(false);
        }
    }, [currentIndex, episodeList, navigate, slug]);

    const triggerAutoPlay = () => {
        if (currentIndex < episodeList.length - 1) {
            setAutoPlayCountdown(5); // 5 seconds countdown
            setShowAutoPlayOverlay(true);
        }
    };

    useEffect(() => {
        let timer;
        if (showAutoPlayOverlay && autoPlayCountdown > 0) {
            timer = setInterval(() => {
                setAutoPlayCountdown(prev => prev - 1);
            }, 1000);
        } else if (showAutoPlayOverlay && autoPlayCountdown === 0) {
            handleNextEpisode();
        }
        return () => clearInterval(timer);
    }, [showAutoPlayOverlay, autoPlayCountdown, handleNextEpisode]);

    const handlePrevEpisode = () => {
         if (currentIndex > 0) {
            const prevEp = episodeList[currentIndex - 1];
            navigate(`/xem-phim/${slug}/${prevEp.slug}`);
        }
    };

    const handleProgress = (state) => {
        if (data && currentEpisode) {
            const percentage = Math.floor(state.played * 100);
            // Throttle: Save every 5%
            if (percentage > 0 && percentage % 5 === 0) { 
                saveProgress(percentage);
            }
        }
    };

    // Popout Player (Picture-in-Picture / Pop-up)
    const handlePopout = () => {
        if (!currentEpisode?.embed) return;
        
        // Open a small window with the embed
        const width = 800;
        const height = 450;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
            currentEpisode.embed,
            `CuongPhimPlayer_${slug}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,toolbar=no`
        );
    };
    
    if (loading) {
        return (
             <div className="min-h-screen bg-black flex flex-col">
                <div className="w-full aspect-video bg-zinc-900 animate-pulse" />
                <div className="container mx-auto p-4 space-y-4">
                    <Skeleton className="h-8 w-1/3 bg-zinc-800" />
                    <Skeleton className="h-4 w-1/4 bg-zinc-800" />
                </div>
             </div>
        );
    }

    if (error || !data) {
        return (
             <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500" />
                <h2 className="text-2xl font-bold">Không tìm thấy phim hoặc tập phim này.</h2>
                <Button asChild variant="outline">
                    <Link to="/">Quay về trang chủ</Link>
                </Button>
            </div>
        );
    }

    // Determine active video source (Prioritize Embed as requested)
    // Fallback logic: Try embed first, if not available, try m3u8
    const videoUrl = currentEpisode?.embed || currentEpisode?.m3u8;
    // Only use HLS/ReactPlayer if we DON'T have an embed but DO have m3u8
    const isHls = !currentEpisode?.embed && currentEpisode?.m3u8;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Player Section */}
            <motion.div 
                layout 
                className={cn(
                    "w-full bg-black relative flex items-center justify-center transition-all duration-500 ease-in-out z-50 group",
                    isTheaterMode ? "h-screen fixed inset-0 z-[100]" : "aspect-video md:h-[80vh] md:aspect-auto relative"
                )}
            >
                {/* Priority: Embed Iframe */}
                {!isHls && videoUrl ? (
                     <iframe
                        src={videoUrl}
                        title={data.name}
                        className="w-full h-full border-0 shadow-2xl"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : isHls && videoUrl ? (
                    <ReactPlayer
                        url={videoUrl}
                        controls={true}
                        width="100%"
                        height="100%"
                        playing={true}
                        onEnded={triggerAutoPlay}
                        onProgress={handleProgress}
                        config={{
                            file: {
                                forceHLS: true,
                                attributes: {
                                    poster: data.thumb_url || data.poster_url
                                }
                            }
                        }}
                        className="absolute inset-0"
                    />
                ) : (
                    <div className="text-zinc-500 flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 opacity-50" />
                        <span>Video đang cập nhật...</span>
                    </div>
                )}
                
                {/* Overlay Controls (Visible on hover or when UI is active) */}
                <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md"
                        onClick={handlePopout}
                        title="Mở cửa sổ nổi (PiP)"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md"
                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                        title={isTheaterMode ? "Thu nhỏ" : "Phóng to (Theater Mode)"}
                    >
                        {isTheaterMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                </div>
                
                {/* Back Button Overlay */}
                {!isTheaterMode && (
                    <Link 
                        to={`/phim/${slug}`} 
                        className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                )}

                {/* Next Episode Countdown Overlay */}
                {showAutoPlayOverlay && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-[110] bg-black/60 backdrop-blur-sm"
                    >
                        <div className="text-center space-y-4">
                            <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Tập tiếp theo sẽ bắt đầu sau</p>
                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="44"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-white/10"
                                    />
                                    <motion.circle
                                        cx="48" cy="48" r="44"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray="276.46"
                                        initial={{ strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: 276.46 * (1 - autoPlayCountdown / 5) }}
                                        className="text-primary"
                                    />
                                </svg>
                                <span className="text-4xl font-bold text-white">{autoPlayCountdown}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => setShowAutoPlayOverlay(false)} 
                                    variant="outline" 
                                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                                >
                                    Hủy bỏ
                                </Button>
                                <Button 
                                    onClick={handleNextEpisode} 
                                    className="bg-white text-black hover:bg-zinc-200"
                                >
                                    Xem ngay
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Controls & Info (Hidden in Theater Mode) */}
            {!isTheaterMode && (
                <div className="flex-1 container mx-auto px-4 py-6 md:px-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-3 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start justify-between"
                            >
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{data.name}</h1>
                                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                        <span className="text-primary font-medium">Tập {currentEpisode?.name}</span>
                                        <span>•</span>
                                        <span>{data.year || "2024"}</span>
                                        <span>•</span>
                                        <span className={cn("px-1.5 py-0.5 rounded text-xs font-bold", isHls ? "bg-green-900/20 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                                            {isHls ? "HLS SUPER SPEED" : "EMBED PLAYER"}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Nav Buttons */}
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={handlePrevEpisode} 
                                        disabled={currentIndex === 0}
                                        className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700 hover:bg-muted dark:hover:bg-zinc-800 disabled:opacity-50 text-foreground"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={handleNextEpisode} 
                                        disabled={currentIndex === episodeList.length - 1}
                                        className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-700 hover:bg-muted dark:hover:bg-zinc-800 disabled:opacity-50 text-foreground"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Description (Spotlight Effect) */}
                            <Spotlight className="bg-card dark:bg-zinc-900/30 p-4 rounded-lg border border-border dark:border-zinc-800/50 shadow-sm">
                                <p className="text-foreground dark:text-zinc-300 text-sm line-clamp-2 md:line-clamp-none leading-relaxed">
                                    {data.description}
                                </p>
                            </Spotlight>

                            {/* Comment Section */}
                            <CommentSection 
                                movieId={data.id || slug} 
                                slug={slug}
                                movieData={data}
                                className="mt-8" 
                            />
                        </div>

                        {/* Sidebar / Episode List */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-card dark:bg-zinc-900/50 border border-border dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[400px] shadow-sm">
                                <div className="p-4 border-b border-border dark:border-zinc-800 bg-muted/50 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0">
                                    <h3 className="font-bold text-foreground dark:text-white flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" /> 
                                        Danh sách tập
                                    </h3>
                                    <span className="text-xs text-muted-foreground">{episodeList.length} tập</span>
                                </div>
                                
                                <ScrollArea className="flex-1 p-2">
                                    <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                                        {episodeList.map((ep, idx) => {
                                            const isActive = ep.slug === currentEpisode?.slug;
                                            return (
                                                <Link
                                                    key={ep.slug}
                                                    to={`/xem-phim/${slug}/${ep.slug}`}
                                                    className={cn(
                                                        "py-2 px-1 text-center text-sm font-medium rounded-md transition-all border",
                                                        isActive 
                                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" 
                                                            : "bg-card dark:bg-zinc-900 text-muted-foreground hover:text-foreground border-border dark:border-zinc-800 hover:bg-muted dark:hover:bg-zinc-800 hover:border-zinc-400"
                                                    )}
                                                >
                                                    {ep.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Watch;
