import React, { useState, useEffect } from 'react';
import { backendApiClient } from '@/config/apiClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ReviewSection({ movieId, slug, movieData }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const handleVote = async (reviewId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để bình chọn');
            return;
        }

        try {
            const response = await backendApiClient.post(`/movies/reviews/${reviewId}/vote`);
            const { voted } = response.data;
            
            // Update local state optimistically
            setReviews(prev => prev.map(r => {
                if (r.id === reviewId) {
                    return {
                        ...r,
                        isVoted: voted,
                        _count: {
                            ...r._count,
                            votes: voted ? (r._count?.votes || 0) + 1 : (r._count?.votes || 0) - 1
                        }
                    };
                }
                return r;
            }));

            toast.success(voted ? 'Đã đánh dấu hữu ích' : 'Đã bỏ đánh dấu hữu ích');
        } catch (error) {
            console.error('Failed to vote:', error);
            toast.error('Không thể thực hiện bình chọn');
        }
    };

    const fetchReviews = async () => {
        try {
            const identifier = (typeof movieId === 'number' && movieId > 0) ? movieId : slug;
            if (!identifier) return;

            const response = await backendApiClient.get(`/movies/${identifier}/reviews`);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [movieId, slug]);

    if (isLoading) return <div className="text-center text-zinc-500 py-4">Đang tải đánh giá...</div>;

    if (reviews.length === 0) return null; // Hide if no reviews

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Đánh giá từ cộng đồng
                <span className="text-sm font-normal text-zinc-400">({reviews.length})</span>
            </h3>

            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10 border border-zinc-700">
                                <AvatarImage src={review.user?.avatar} />
                                <AvatarFallback>{review.user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-200">{review.user?.name || 'Người dùng ẩn danh'}</span>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    className={cn(
                                                        "w-3 h-3", 
                                                        star <= review.score ? "fill-yellow-500 text-yellow-500" : "fill-zinc-800 text-zinc-800"
                                                    )} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                                
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                                    {review.content}
                                </p>

                                <div className="pt-2 flex items-center gap-4">
                                    <button 
                                        onClick={() => handleVote(review.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs transition-colors py-1 px-2 rounded-md",
                                            review.isVoted 
                                                ? "text-primary bg-primary/10" 
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                        )}
                                    >
                                        <ThumbsUp className={cn("w-3.5 h-3.5", review.isVoted && "fill-current")} />
                                        <span>Hữu ích ({review._count?.votes || 0})</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
