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
    // Write Review State
    const [userReview, setUserReview] = useState(null);
    const [isWriting, setIsWriting] = useState(false);
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Existing State
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();

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

    // Fetch Reviews & User Review
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const identifier = (typeof movieId === 'number' && movieId > 0) ? movieId : slug;
                if (!identifier) return;

                const response = await backendApiClient.get(`/movies/${identifier}/reviews`);
                setReviews(response.data);
                
                if (user) {
                     const myReview = response.data.find(r => r.userId === user.id);
                     if (myReview) setUserReview(myReview);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [movieId, slug, user]);

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá!");
            return;
        }
        if (!content.trim()) {
             toast.error("Vui lòng viết nội dung đánh giá!");
             return;
        }

        setIsSubmitting(true);
        try {
            // Identifier logic
            let targetId = movieId;
            // Similar sync logic as CommentSection if needed
             if (movieData && slug && (!targetId || targetId <= 0)) {
                try {
                    const syncRes = await backendApiClient.post('/movies/sync', { ...movieData, slug });
                    targetId = syncRes.data.movieId;
                } catch (syncErr) {
                    console.warn('Sync failed:', syncErr);
                }
            }

            const identifier = (typeof targetId === 'number' && targetId > 0) ? targetId : slug;

            const payload = { score: rating, content };
            
            // If user already has a review, maybe update? Or block?
            // Assuming simplified "Post New" for now. 
            // Ideally should check `userReview` to PUT instead of POST.
            
            let response;
            if (userReview) {
                 response = await backendApiClient.put(`/movies/reviews/${userReview.id}`, payload);
                 toast.success("Cập nhật đánh giá thành công!");
                 // Update local
                 setReviews(prev => prev.map(r => r.id === userReview.id ? response.data : r));
                 setUserReview(response.data);
            } else {
                 response = await backendApiClient.post(`/movies/${identifier}/reviews`, payload);
                 toast.success("Đăng đánh giá thành công!");
                 // Add to local
                 setReviews([response.data, ...reviews]);
                 setUserReview(response.data);
            }
            
            setIsWriting(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi đăng đánh giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center text-zinc-500 py-4">Đang tải đánh giá...</div>;

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Đánh giá từ cộng đồng
                    <span className="text-sm font-normal text-zinc-400">({reviews.length})</span>
                </h3>
                
                {isAuthenticated && !isWriting && !userReview && (
                    <button 
                        onClick={() => { setIsWriting(true); setRating(5); }}
                        className="text-primary hover:underline text-sm font-medium"
                    >
                        Viết đánh giá
                    </button>
                )}
                 {isAuthenticated && !isWriting && userReview && (
                    <button 
                         onClick={() => { 
                             setIsWriting(true); 
                             setRating(userReview.score); 
                             setContent(userReview.content); 
                         }}
                        className="text-primary hover:underline text-sm font-medium"
                    >
                        Sửa đánh giá của bạn
                    </button>
                )}
            </div>
            
            {/* Write Review Form */}
            {isWriting && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-sm">Chọn đánh giá:</span>
                        <div className="flex items-center gap-1">
                             {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        className={cn(
                                            "w-6 h-6 transition-colors", 
                                            star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-zinc-800 text-zinc-700 hover:text-yellow-500"
                                        )} 
                                    />
                                </button>
                             ))}
                        </div>
                        <span className="text-sm font-bold text-yellow-500 ml-2">{rating}/5</span>
                    </div>
                    
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 min-h-[100px] text-sm focus:border-primary outline-none resize-none"
                    />
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsWriting(false)} 
                            className="px-4 py-2 text-sm font-medium hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Đang gửi...' : (userReview ? 'Cập nhật' : 'Đăng đánh giá')}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {reviews.length === 0 && !isWriting ? (
                     <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                        <Star className="w-12 h-12 mx-auto text-zinc-700 mb-2" />
                        <p className="text-zinc-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                     </div>
                ) : (
                    reviews.map((review) => (
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
                )))}
            </div>
        </div>
    );
}
