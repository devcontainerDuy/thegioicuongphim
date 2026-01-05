import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * ReviewModal
 * - Modal allows user to select stars rating and write a text review.
 */
export function ReviewModal({ isOpen, onClose, onSubmit, initialRating = 0, initialContent = '', isSubmitting = false }) {
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState(initialContent);

    // Update state when initial props change (e.g. re-opening)
    React.useEffect(() => {
        setRating(initialRating);
        setContent(initialContent || '');
    }, [initialRating, initialContent, isOpen]);

    const displayRating = hoverRating || rating;

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        onSubmit(rating, content);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">Đánh giá phim</DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Stars Selection */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={cn(
                                        "w-10 h-10 transition-colors",
                                        star <= displayRating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-zinc-800 text-zinc-600 hover:text-yellow-400/50"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-yellow-400">
                        {rating > 0 ? (
                            rating === 5 ? 'Tuyệt vời cực phẩm! 😍' :
                            rating === 4 ? 'Phim rất hay! 👍' :
                            rating === 3 ? 'Cũng tạm ổn 👌' :
                            rating === 2 ? 'Không hay lắm 😕' : 'Tệ quá 😭'
                        ) : 'Chọn số sao để đánh giá'}
                    </div>

                    {/* Review Content */}
                    <Textarea
                        placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này... (Không bắt buộc)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px] bg-zinc-950/50 border-zinc-700 focus:border-primary resize-none"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
