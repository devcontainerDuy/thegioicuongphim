import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendApiClient } from '@/config/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * StarRating Component
 * - Hiển thị và cho phép đánh giá phim từ 1-5 sao
 * - Tự động lưu rating khi user click
 * - Hiển thị rating trung bình của phim
 */
function StarRating({ movieId, className }) {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRating = React.useCallback(async () => {
        try {
            const response = await backendApiClient.get(`/movies/${movieId}/rating`);
            setAverageRating(response.data.averageScore || 0);
            setTotalRatings(response.data.totalRatings || 0);
            if (response.data.userRating) {
                setRating(response.data.userRating);
            }
        } catch (error) {
            console.error('Failed to fetch rating:', error);
        } finally {
            setIsLoading(false);
        }
    }, [movieId]);

    // Fetch rating info on mount
    useEffect(() => {
        fetchRating();
    }, [fetchRating]);

    const handleClick = async (value) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đánh giá phim');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        setRating(value);

        try {
            await backendApiClient.post(`/movies/${movieId}/rating`, { score: value });
            toast.success(`Đã đánh giá ${value} sao`);
            // Refetch to update average
            fetchRating();
        } catch (error) {
            toast.error('Không thể gửi đánh giá');
            setRating(rating); // Revert
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
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={isSubmitting || isLoading}
                            className={cn(
                                "transition-all duration-150 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                                isSubmitting && "animate-pulse"
                            )}
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
                        <span className="font-semibold text-yellow-400">
                            {averageRating.toFixed(1)}
                        </span>
                        <span>/5</span>
                        <span className="text-zinc-500">({totalRatings} đánh giá)</span>
                    </div>
                )}
            </div>

            {/* User rating label */}
            {rating > 0 && (
                <p className="text-xs text-muted-foreground">
                    Bạn đã đánh giá: <span className="text-yellow-400 font-medium">{rating} sao</span>
                </p>
            )}
        </div>
    );
}

export default StarRating;
