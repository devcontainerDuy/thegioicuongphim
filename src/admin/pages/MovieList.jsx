import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Plus, Search, Trash2, Edit, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/admin/components/AdminHeader';

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
        <div className="space-y-6 fade-in">
            {/* Header */}
            <AdminHeader 
                title="Quản lý Phim" 
                description="Danh sách phim, phim bộ và quản lý tập phim"
            >
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm kiếm phim..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-primary/50"
                    />
                </div>
                <Link to="/admin/movies/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Thêm phim
                    </Button>
                </Link>
            </AdminHeader>

            {/* Table */}
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
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Phim</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden md:table-cell">Loại</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden lg:table-cell">Tập</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden lg:table-cell">Views</th>
                                    <th className="text-right px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {movies.map((movie) => (
                                    <tr key={movie.id} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50">
                                                    <img src={movie.thumbUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-zinc-200 font-medium line-clamp-1">{movie.name}</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{movie.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`px-2.5 py-1 text-xs rounded-full border font-medium
                                                ${movie.type === 'movie' 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}
                                            `}>
                                                {movie.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell text-sm">
                                            {movie._count?.episodes || 0} tập
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell text-sm font-mono">
                                            {movie.views?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/movies/${movie.id}`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
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
                                        <td colSpan={5} className="text-center py-16 text-zinc-500">
                                            Không tìm thấy phim nào
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

export default MovieList;
