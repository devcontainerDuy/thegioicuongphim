import React, { useState, useEffect } from 'react';
import { backendApiClient } from '@/config/apiClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewSection({ movieId, slug, movieData }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
