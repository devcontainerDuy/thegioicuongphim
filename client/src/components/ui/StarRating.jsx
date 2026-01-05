import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendApiClient } from '@/config/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ReviewModal } from './ReviewModal';

/**
 * StarRating Component
 * - Hiển thị và cho phép đánh giá phim từ 1-5 sao
 * - Tự động lưu rating khi user click
 * - Hiển thị rating trung bình của phim
 */
function StarRating({ movieId, slug, movieData, className }) {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [userReviewContent, setUserReviewContent] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Missing states restored
    const [hoverRating, setHoverRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRating = React.useCallback(async () => {
        try {
            const identifier = (typeof movieId === 'number' && movieId > 0) ? movieId : slug;
            if (!identifier) return;

            const response = await backendApiClient.get(`/movies/${identifier}/rating`);
            setAverageRating(response.data.averageScore || 0);
            setTotalRatings(response.data.totalRatings || 0);
            if (response.data.userRating) {
                setRating(response.data.userRating);
                setUserReviewContent(response.data.userReview || '');
            }
        } catch (error) {
            console.error('Failed to fetch rating:', error);
        } finally {
            setIsLoading(false);
        }
    }, [movieId, slug]);

    // Fetch rating info on mount
    useEffect(() => {
        fetchRating();
    }, [fetchRating]);

    const handleStarClick = (value) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đánh giá phim');
            return;
        }
        // Open modal with selected rating
        setRating(value); // Temporary set for modal
        setIsModalOpen(true);
    };

    const handleReviewSubmit = async (score, content) => {
        setIsSubmitting(true);
        try {
            // Lazy sync logic
            let targetId = movieId;
            if (movieData && slug) {
                try {
                    const syncRes = await backendApiClient.post('/movies/sync', { 
                        ...movieData,
                        slug 
                    });
                    targetId = syncRes.data.movieId;
                } catch (e) {
                    console.warn('Sync failed, trying direct post');
                }
            }

            const identifier = (typeof targetId === 'number' && targetId > 0) ? targetId : slug;

            await backendApiClient.post(`/movies/${identifier}/rating`, { 
                score, 
                content 
            });
            
            toast.success('Cảm ơn phản hồi của bạn!');
            setRating(score);
            setUserReviewContent(content);
            setIsModalOpen(false);
            fetchRating(); // Refresh average
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-4">
                {/* Stars */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={isLoading}
                            className="transition-all duration-150 hover:scale-110 disabled:opacity-50"
                            aria-label={`Rate ${star} stars`}
                        >
                            <Star
                                className={cn(
                                    "w-6 h-6 transition-colors",
                                    star <= displayRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-zinc-500 hover:text-yellow-400/50"
                                )}
                            />
                        </button>
                    ))}
                </div>

                {/* Rating Info */}
                {!isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-yellow-400 text-lg">
                            {averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs">/5</span>
                        <span className="text-zinc-500 text-xs">({totalRatings} đánh giá)</span>
                    </div>
                )}
            </div>

            {/* User rating label */}
            {rating > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    Bạn đã đánh giá: <span className="text-yellow-400 font-medium">{rating} sao</span>
                    <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline ml-2">
                        (Viết lại)
                    </button>
                </div>
            )}

            <ReviewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleReviewSubmit}
                initialRating={rating}
                initialContent={userReviewContent}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default StarRating;
