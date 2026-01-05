import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, Trash2, Loader2, ChevronLeft, ChevronRight, MessageSquare, Star, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/admin/components/AdminHeader';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

function ReviewList() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, total_page: 1 });

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.getReviews(page, 20, search);
            setReviews(result.items || []);
            setMeta(result.paginate || {});
        } catch (error) {
            toast.error('Lỗi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa đánh giá này?')) return;
        try {
            await adminService.deleteReview(id);
            toast.success('Đã xóa đánh giá');
            fetchReviews();
        } catch (error) {
            toast.error('Lỗi xóa đánh giá');
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <AdminHeader 
                title="Quản lý Đánh giá" 
                description="Theo dõi và kiểm duyệt nội dung đánh giá từ người dùng"
            >
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm theo nội dung, user, phim..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-primary/50"
                    />
                </div>
            </AdminHeader>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Người dùng</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Phim</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Nội dung</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Sao</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Thời gian</th>
                                    <th className="text-right px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-zinc-800">
                                                    <AvatarImage src={review.user?.avatar} />
                                                    <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="max-w-[150px]">
                                                    <p className="text-sm font-medium text-zinc-200 truncate">{review.user?.name}</p>
                                                    <p className="text-[10px] text-zinc-500 truncate">{review.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                to={`/phim/${review.movie?.slug}`} 
                                                target="_blank"
                                                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors group"
                                            >
                                                <span className="truncate max-w-[120px]">{review.movie?.name}</span>
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 min-w-[200px] max-w-[400px]">
                                                <MessageSquare className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                                <p className="text-sm text-zinc-300 line-clamp-2">
                                                    {review.content}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20 w-fit">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold text-yellow-400">{review.score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-500">
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(review.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!reviews.length && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-zinc-500">
                                            Không tìm thấy đánh giá nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {meta.total_page > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 w-9 h-9"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm text-zinc-400 font-medium px-4 bg-zinc-900 border border-zinc-800 rounded-md h-9 flex items-center">
                        Trang {page} / {meta.total_page}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === meta.total_page}
                        onClick={() => setPage(p => p + 1)}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 w-9 h-9"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ReviewList;
