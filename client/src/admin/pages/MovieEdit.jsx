import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/admin/components/AdminHeader';

function MovieEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        originalName: '',
        description: '',
        thumbUrl: '',
        posterUrl: '',
        type: 'movie', 
        status: 'completed',
        quality: 'HD',
        language: 'Vietsub',
        year: new Date().getFullYear(),
        time: '',
        totalEpisodes: 1,
        currentEpisode: 'Full',
        director: '',
        casts: '',
        genres: '',
        countries: ''
    });

    const [episodes, setEpisodes] = useState([]);
    const [episodeDialog, setEpisodeDialog] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [episodeForm, setEpisodeForm] = useState({
        name: '',
        slug: '',
        embedUrl: '',
        m3u8Url: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchMovie();
        }
    }, [id]);

    const fetchMovie = async () => {
        setLoading(true);
        try {
            const data = await adminService.getMovie(id);
            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                originalName: data.originalName || '',
                description: data.description || '',
                thumbUrl: data.thumbUrl || '',
                posterUrl: data.posterUrl || '',
                type: data.type || 'movie',
                status: data.status || 'completed',
                quality: data.quality || 'HD',
                language: data.language || 'Vietsub',
                year: data.year || new Date().getFullYear(),
                time: data.time || '',
                totalEpisodes: data.totalEpisodes || 1,
                currentEpisode: data.currentEpisode || 'Full',
                director: data.director || '',
                casts: Array.isArray(data.casts) ? data.casts.join(', ') : (data.casts || ''),
                genres: Array.isArray(data.genres) ? data.genres.join(', ') : (data.genres || ''),
                countries: Array.isArray(data.countries) ? data.countries.join(', ') : (data.countries || '')
            });
            setEpisodes(data.episodes || []);
        } catch (error) {
            toast.error('Không thể tải thông tin phim');
            navigate('/admin/movies');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
        setFormData(prev => ({ ...prev, slug }));
    };

    const generateEpisodeSlug = () => {
        const slug = episodeForm.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
        setEpisodeForm(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                year: parseInt(formData.year),
                totalEpisodes: parseInt(formData.totalEpisodes),
                // Convert comma-separated strings back to arrays
                casts: formData.casts ? formData.casts.split(',').map(s => s.trim()).filter(Boolean) : [],
                genres: formData.genres ? formData.genres.split(',').map(s => s.trim()).filter(Boolean) : [],
                countries: formData.countries ? formData.countries.split(',').map(s => s.trim()).filter(Boolean) : []
            };

            if (isEditMode) {
                await adminService.updateMovie(id, payload);
                toast.success('Cập nhật phim thành công');
            } else {
                await adminService.createMovie(payload);
                toast.success('Thêm phim mới thành công');
                navigate('/admin/movies');
            }
        } catch (error) {
            toast.error(error.message || 'Lỗi lưu thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleEpisodeSubmit = async () => {
        try {
            if (currentEpisode) {
                await adminService.updateEpisode(currentEpisode.id, episodeForm);
                toast.success('Cập nhật tập phim thành công');
            } else {
                await adminService.createEpisode(id, episodeForm);
                toast.success('Thêm tập phim thành công');
            }
            setEpisodeDialog(false);
            fetchMovie(); // Refresh episodes
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteEpisode = async (episodeId) => {
        if(!window.confirm("Xóa tập phim này?")) return;
        try {
            await adminService.deleteEpisode(episodeId);
            toast.success('Đã xóa tập phim');
            fetchMovie();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openEpisodeDialog = (episode = null) => {
        if (episode) {
            setCurrentEpisode(episode);
            setEpisodeForm({
                name: episode.name,
                slug: episode.slug,
                embedUrl: episode.embedUrl || '',
                m3u8Url: episode.m3u8Url || ''
            });
        } else {
            setCurrentEpisode(null);
            setEpisodeForm({ name: '', slug: '', embedUrl: '', m3u8Url: '' });
        }
        setEpisodeDialog(true);
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12 fade-in">
           <AdminHeader 
                title={isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'} 
                description="Điền đầy đủ thông tin phim và danh sách tập"
            >
                <Button variant="outline" onClick={() => navigate('/admin/movies')} className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditMode ? 'Lưu thay đổi' : 'Tạo phim mới'}
                </Button>
            </AdminHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Tên phim (TV)</Label>
                                <div className="flex gap-2">
                                    <Input id="name" value={formData.name} onChange={handleChange} placeholder="Phim người nhện" className="bg-zinc-950 border-zinc-800" required />
                                    <Button type="button" variant="outline" onClick={generateSlug} className="bg-zinc-950 border-zinc-800" title="Auto Slug">Auto</Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Slug (URL)</Label>
                                <Input id="slug" value={formData.slug} onChange={handleChange} placeholder="phim-nguoi-nhen" className="bg-zinc-950 border-zinc-800" required />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-400">Tên gốc</Label>
                                <Input id="originalName" value={formData.originalName} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-400">Loại phim</Label>
                                <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        <SelectItem value="movie">Phim lẻ</SelectItem>
                                        <SelectItem value="series">Phim bộ</SelectItem>
                                        <SelectItem value="hoat-hinh">Hoạt hình</SelectItem>
                                        <SelectItem value="tv-shows">TV Shows</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label className="text-zinc-400">Mô tả</Label>
                            <Textarea id="description" value={formData.description} onChange={handleChange} rows={5} className="bg-zinc-950 border-zinc-800" />
                        </div>
                    </div>

                    {/* Metadata: Director, Cast, etc. */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
                        <h3 className="text-lg font-bold text-white">Thông tin mở rộng</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Đạo diễn</Label>
                                <Input id="director" value={formData.director} onChange={handleChange} placeholder="Tên đạo diễn" className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Diễn viên (Cách nhau bằng dấu phẩy)</Label>
                                <Input id="casts" value={formData.casts} onChange={handleChange} placeholder="Actor A, Actor B..." className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Thể loại (Cách nhau bằng dấu phẩy)</Label>
                                <Input id="genres" value={formData.genres} onChange={handleChange} placeholder="Hành động, Phiêu lưu..." className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Quốc gia (Cách nhau bằng dấu phẩy)</Label>
                                <Input id="countries" value={formData.countries} onChange={handleChange} placeholder="Mỹ, Trung Quốc..." className="bg-zinc-950 border-zinc-800" />
                            </div>
                        </div>
                    </div>

                    {/* URLs & Media */}
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
                        <h3 className="text-lg font-bold text-white">Hình ảnh & Media</h3>
                         <div className="space-y-2">
                            <Label className="text-zinc-400">Thumbnail URL (Ngang)</Label>
                            <Input id="thumbUrl" value={formData.thumbUrl} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                        </div>
                         <div className="space-y-2">
                            <Label className="text-zinc-400">Poster URL (Dọc)</Label>
                            <Input id="posterUrl" value={formData.posterUrl} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta & Episodes */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
                        <h3 className="text-lg font-bold text-white">Thông tin chi tiết</h3>
                        
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Trạng thái</Label>
                            <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="ongoing">Đang chiếu</SelectItem>
                                    <SelectItem value="trailer">Trailer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400">Chất lượng</Label>
                            <Input id="quality" value={formData.quality} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Ngôn ngữ</Label>
                            <Input id="language" value={formData.language} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400">Năm</Label>
                                <Input type="number" id="year" value={formData.year} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Thời lượng</Label>
                                <Input id="time" value={formData.time} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400">Tổng tập</Label>
                                <Input type="number" id="totalEpisodes" value={formData.totalEpisodes} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Hiện tại</Label>
                                <Input id="currentEpisode" value={formData.currentEpisode} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                            </div>
                        </div>
                    </div>

                    {/* Episodes Management */}
                    {isEditMode && (
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                 <h3 className="text-lg font-bold text-white">Danh sách tập</h3>
                                 <Button size="sm" onClick={() => openEpisodeDialog()} className="h-8 bg-zinc-800 hover:bg-zinc-700">
                                    <Plus className="w-3 h-3 mr-1" /> Thêm
                                 </Button>
                            </div>

                            <div className="border border-zinc-800 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-950 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-zinc-500 font-medium">Tên</th>
                                            <th className="px-3 py-2 text-right text-zinc-500 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {episodes.map((ep) => (
                                            <tr key={ep.id} className="hover:bg-zinc-800/50">
                                                <td className="px-3 py-2 font-medium text-zinc-300">{ep.name}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400" onClick={() => openEpisodeDialog(ep)}>
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={() => handleDeleteEpisode(ep.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {!episodes.length && (
                                            <tr>
                                                <td colSpan={2} className="text-center py-8 text-zinc-500">Chưa có tập phim nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Episode Dialog */}
            <Dialog open={episodeDialog} onOpenChange={setEpisodeDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">{currentEpisode ? 'Sửa tập phim' : 'Thêm tập phim'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Tên tập</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={episodeForm.name} 
                                    onChange={(e) => setEpisodeForm({...episodeForm, name: e.target.value})} 
                                    placeholder="Tập 1"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                                <Button type="button" variant="outline" onClick={generateEpisodeSlug} className="bg-zinc-950 border-zinc-800">Auto</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Slug</Label>
                            <Input 
                                value={episodeForm.slug} 
                                onChange={(e) => setEpisodeForm({...episodeForm, slug: e.target.value})} 
                                placeholder="tap-1"
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Embed URL</Label>
                            <Input 
                                value={episodeForm.embedUrl} 
                                onChange={(e) => setEpisodeForm({...episodeForm, embedUrl: e.target.value})} 
                                placeholder="https://..."
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">M3U8 URL (Ưu tiên)</Label>
                            <Input 
                                value={episodeForm.m3u8Url} 
                                onChange={(e) => setEpisodeForm({...episodeForm, m3u8Url: e.target.value})} 
                                placeholder="https://..."
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEpisodeDialog(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Hủy</Button>
                        <Button onClick={handleEpisodeSubmit} className="bg-primary hover:bg-primary/90">Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default MovieEdit;
