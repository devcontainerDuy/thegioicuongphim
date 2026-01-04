import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Plus, Search, Trash2, Edit, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

function MovieList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, total_page: 1 });

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.getMovies(page, 20, search);
            setMovies(result.items || []);
            setMeta(result.paginate || {});
        } catch (error) {
            toast.error('Lỗi tải danh sách phim');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa phim "${name}"?`)) return;
        try {
            await adminService.deleteMovie(id);
            toast.success('Đã xóa phim');
            fetchMovies();
        } catch (error) {
            toast.error('Lỗi xóa phim');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-bold text-white">Quản lý Phim</h1>
                <Link to="/admin/movies/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Thêm phim
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Tìm kiếm phim..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-10 bg-zinc-900 border-zinc-800"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium">Phim</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden md:table-cell">Loại</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden lg:table-cell">Tập</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden lg:table-cell">Views</th>
                                <th className="text-right px-4 py-3 text-zinc-400 text-sm font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {movies.map((movie) => (
                                <tr key={movie.id} className="hover:bg-zinc-800/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 shrink-0">
                                                <img src={movie.thumbUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium line-clamp-1">{movie.name}</p>
                                                <p className="text-xs text-zinc-500">{movie.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300">
                                            {movie.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">
                                        {movie._count?.episodes || 0} tập
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">
                                        {movie.views?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/admin/movies/${movie.id}`}>
                                                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => handleDelete(movie.id, movie.name)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!movies.length && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                                        Không có phim nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.total_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="bg-zinc-900 border-zinc-700"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-zinc-400 px-4">
                        {page} / {meta.total_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === meta.total_page}
                        onClick={() => setPage(p => p + 1)}
                        className="bg-zinc-900 border-zinc-700"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default MovieList;
