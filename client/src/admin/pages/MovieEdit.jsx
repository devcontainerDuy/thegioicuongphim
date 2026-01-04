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
        type: 'movie', // or 'series'
        status: 'completed', // completed, ongoing, trailer
        quality: 'HD',
        language: 'Vietsub',
        year: new Date().getFullYear(),
        time: '',
        totalEpisodes: 1,
        currentEpisode: 'Full'
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                currentEpisode: data.currentEpisode || 'Full'
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
                totalEpisodes: parseInt(formData.totalEpisodes)
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
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/movies')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-xl border border-border">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên phim (TV)</Label>
                        <div className="flex gap-2">
                            <Input id="name" value={formData.name} onChange={handleChange} placeholder="Phim người nhện" required />
                            <Button type="button" variant="outline" onClick={generateSlug} title="Generate Slug">Auto</Button>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input id="slug" value={formData.slug} onChange={handleChange} placeholder="phim-nguoi-nhen" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="originalName">Tên gốc</Label>
                        <Input id="originalName" value={formData.originalName} onChange={handleChange} placeholder="Spider-man" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Loại phim</Label>
                            <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="movie">Phim lẻ</SelectItem>
                                    <SelectItem value="series">Phim bộ</SelectItem>
                                    <SelectItem value="hoat-hinh">Hoạt hình</SelectItem>
                                    <SelectItem value="tv-shows">TV Shows</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                             <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="ongoing">Đang chiếu</SelectItem>
                                    <SelectItem value="trailer">Trailer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* URLs */}
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="thumbUrl">Thumbnail URL</Label>
                        <Input id="thumbUrl" value={formData.thumbUrl} onChange={handleChange} placeholder="https://..." />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="posterUrl">Poster URL</Label>
                        <Input id="posterUrl" value={formData.posterUrl} onChange={handleChange} placeholder="https://..." />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quality">Chất lượng</Label>
                            <Input id="quality" value={formData.quality} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Ngôn ngữ</Label>
                            <Input id="language" value={formData.language} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="year">Năm phát hành</Label>
                            <Input type="number" id="year" value={formData.year} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Thời lượng</Label>
                            <Input id="time" value={formData.time} onChange={handleChange} placeholder="120 phút" />
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="totalEpisodes">Tổng số tập</Label>
                            <Input type="number" id="totalEpisodes" value={formData.totalEpisodes} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentEpisode">Tập hiện tại</Label>
                            <Input id="currentEpisode" value={formData.currentEpisode} onChange={handleChange} placeholder="Full / Tập 5" />
                        </div>
                    </div>
                
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea id="description" value={formData.description} onChange={handleChange} rows={5} />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                     <Button type="button" variant="ghost" onClick={() => navigate('/admin/movies')}>Hủy</Button>
                     <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo phim mới'}
                     </Button>
                </div>
            </form>

            {/* Episodes Management (Only in Edit Mode) */}
            {isEditMode && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                    <div className="flex items-center justify-between">
                         <h2 className="text-xl font-bold">Danh sách tập phim</h2>
                         <Button size="sm" onClick={() => openEpisodeDialog()}>
                            <Plus className="w-4 h-4 mr-2" /> Thêm tập mới
                         </Button>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tên tập</th>
                                    <th className="px-4 py-3 text-left">Slug</th>
                                    <th className="px-4 py-3 text-left">Link</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {episodes.map((ep) => (
                                    <tr key={ep.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{ep.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{ep.slug}</td>
                                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                                            {ep.m3u8Url ? 'M3U8' : (ep.embedUrl ? 'Embed' : 'N/A')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEpisodeDialog(ep)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEpisode(ep.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!episodes.length && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground">Chưa có tập phim nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Episode Dialog */}
            {isEditMode && (
                <Dialog open={episodeDialog} onOpenChange={setEpisodeDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentEpisode ? 'Sửa tập phim' : 'Thêm tập phim'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tên tập</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={episodeForm.name} 
                                        onChange={(e) => setEpisodeForm({...episodeForm, name: e.target.value})} 
                                        placeholder="Tập 1"
                                    />
                                    <Button type="button" variant="outline" onClick={generateEpisodeSlug}>Auto</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input 
                                    value={episodeForm.slug} 
                                    onChange={(e) => setEpisodeForm({...episodeForm, slug: e.target.value})} 
                                    placeholder="tap-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Embed URL</Label>
                                <Input 
                                    value={episodeForm.embedUrl} 
                                    onChange={(e) => setEpisodeForm({...episodeForm, embedUrl: e.target.value})} 
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>M3U8 URL (Ưu tiên)</Label>
                                <Input 
                                    value={episodeForm.m3u8Url} 
                                    onChange={(e) => setEpisodeForm({...episodeForm, m3u8Url: e.target.value})} 
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEpisodeDialog(false)}>Hủy</Button>
                            <Button onClick={handleEpisodeSubmit}>Lưu</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default MovieEdit;
