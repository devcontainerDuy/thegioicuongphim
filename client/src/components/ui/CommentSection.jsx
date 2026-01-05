import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, MoreVertical, Edit, Trash2, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { backendApiClient } from '@/config/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * CommentSection Component
 * - Hiển thị danh sách bình luận
 * - Cho phép thêm, sửa, xóa bình luận
 * - Chỉ owner mới có thể edit/delete comment của mình
 */
function CommentSection({ movieId, slug, movieData, className }) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    const fetchComments = React.useCallback(async () => {
        const identifier = (typeof movieId === 'number' && movieId > 0) ? movieId : slug;
        if (!identifier) return;

        try {
            const response = await backendApiClient.get(`/movies/${identifier}/comments`);
            setComments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [movieId, slug]);

    // Fetch comments
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        setIsSubmitting(true);
        try {
            // Ensure movie exists in local DB before commenting
            let targetId = movieId;
            if (movieData && slug) {
                try {
                    const syncRes = await backendApiClient.post('/movies/sync', { 
                        ...movieData,
                        slug 
                    });
                    targetId = syncRes.data.movieId;
                } catch (syncErr) {
                    console.warn('[CommentSection] Sync failed, trying direct post:', syncErr);
                }
            }

            const identifier = (typeof targetId === 'number' && targetId > 0) ? targetId : slug;

            const response = await backendApiClient.post(`/movies/${identifier}/comments`, { 
                content: newComment.trim() 
            });
            setComments([response.data, ...comments]);
            setNewComment('');
            toast.success('Đã đăng bình luận');
        } catch (error) {
            toast.error('Không thể đăng bình luận. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (id) => {
        if (!editContent.trim()) return;

        try {
            await backendApiClient.put(`/movies/comments/${id}`, {
                content: editContent.trim()
            });
            setEditingId(null);
            setEditContent('');
            fetchComments();
            toast.success('Đã cập nhật bình luận');
        } catch (error) {
            toast.error('Không thể cập nhật bình luận');
        }
    };

    const handleDelete = async (id) => {
        try {
            await backendApiClient.delete(`/movies/comments/${id}`);
            setDeleteId(null);
            fetchComments();
            toast.success('Đã xóa bình luận');
        } catch (error) {
            toast.error('Không thể xóa bình luận');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Bình luận ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                rows={3}
                                className="resize-none bg-card border-border focus:border-primary"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={!newComment.trim() || isSubmitting} size="sm">
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Gửi bình luận
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center text-muted-foreground">
                    <a href="/dang-nhap" className="text-primary hover:underline">Đăng nhập</a> để bình luận
                </div>
            )}

            {/* Comments List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-4 bg-muted rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => {
                        const isOwner = user?.id === comment.userId;
                        const isEditing = editingId === comment.id;

                        return (
                            <div key={comment.id} className="flex gap-3 group">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    {comment.user?.avatar ? (
                                        <img src={comment.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">
                                            {comment.user?.name || 'Người dùng'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={2}
                                                className="resize-none bg-card border-border"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleEdit(comment.id)}>
                                                    Lưu
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setEditingId(null);
                                                    setEditContent('');
                                                }}>
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {isOwner && !isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setEditingId(comment.id);
                                                setEditContent(comment.content);
                                            }}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setDeleteId(comment.id)}
                                                className="text-red-500 focus:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDelete(deleteId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default CommentSection;
