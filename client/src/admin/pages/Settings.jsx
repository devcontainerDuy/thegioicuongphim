import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

function Settings() {
    const handleSave = (e) => {
        e.preventDefault();
        toast.info("Chức năng đang được phát triển");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>

            <form onSubmit={handleSave} className="space-y-8 bg-card p-6 rounded-xl border border-border">
                {/* General Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thông tin chung</h3>
                    <Separator />
                    
                    <div className="space-y-2">
                        <Label>Tên Website</Label>
                        <Input defaultValue="Thế Giới Cuồng Phim" />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả (SEO)</Label>
                        <Input defaultValue="Xem phim online chất lượng cao..." />
                    </div>
                </div>

                {/* System Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Hệ thống</h3>
                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Bảo trì</Label>
                            <p className="text-sm text-muted-foreground">Tạm thời đóng website để bảo trì.</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Cho phép đăng ký</Label>
                            <p className="text-sm text-muted-foreground">Cho phép người dùng mới đăng ký tài khoản.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit">
                        <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Settings;
