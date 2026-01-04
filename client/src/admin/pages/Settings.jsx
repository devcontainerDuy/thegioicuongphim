import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '@/services/adminService';
import AdminHeader from '@/admin/components/AdminHeader';

function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Thế Giới Cuồng Phim',
        siteDescription: 'Xem phim online chất lượng cao...',
        maintenance: false,
        allowRegistration: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSettings();
                // Merge with defaults to ensure all keys exist
                setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                toast.error('Lỗi tải cấu hình');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.updateSettings(settings);
            toast.success('Đau lưu cấu hình thành công');
        } catch (error) {
            toast.error('Lỗi lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 fade-in">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in max-w-4xl mx-auto">
            <AdminHeader 
                title="Cài đặt hệ thống" 
                description="Quản lý cấu hình chung cho website"
            />

            <form onSubmit={handleSave} className="space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-sm">
                {/* General Settings */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Thông tin chung</h3>
                        <p className="text-sm text-zinc-500">Các thông tin cơ bản hiển thị trên website.</p>
                    </div>
                    <Separator className="bg-zinc-800" />
                    
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Tên Website</Label>
                            <Input 
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-white focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Mô tả (SEO)</Label>
                            <Input 
                                value={settings.siteDescription}
                                onChange={(e) => handleChange('siteDescription', e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-white focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="space-y-6 pt-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Hệ thống</h3>
                        <p className="text-sm text-zinc-500">Cấu hình chức năng và trạng thái hoạt động.</p>
                    </div>
                    <Separator className="bg-zinc-800" />

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950/50">
                            <div className="space-y-0.5">
                                <Label className="text-base text-zinc-200">Bảo trì hệ thống</Label>
                                <p className="text-sm text-zinc-500">Tạm thời đóng website để bảo trì, chỉ Admin mới truy cập được.</p>
                            </div>
                            <Switch 
                                checked={settings.maintenance}
                                onCheckedChange={(checked) => handleChange('maintenance', checked)}
                                className="data-[state=checked]:bg-primary" 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950/50">
                            <div className="space-y-0.5">
                                <Label className="text-base text-zinc-200">Cho phép đăng ký</Label>
                                <p className="text-sm text-zinc-500">Cho phép người dùng mới đăng ký tài khoản tự do.</p>
                            </div>
                            <Switch 
                                checked={settings.allowRegistration}
                                onCheckedChange={(checked) => handleChange('allowRegistration', checked)}
                                className="data-[state=checked]:bg-primary" 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Lưu cấu hình
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Settings;
