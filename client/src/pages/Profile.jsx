import React, { useState, useEffect } from 'react';
import { User, Settings, History, LogOut, Bell, Moon, Shield, Play, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import FadeContent from '@/components/bits/FadeContent';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import { toast } from 'sonner';

function Profile() {
    const { user, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        avatar: user?.avatar || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await userService.getWatchHistory(1, 6);
                setHistory(data.items || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await userService.updateProfile(editForm);
            await refreshProfile(); // Refresh global auth state
            toast.success("Cập nhật hồ sơ thành công!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Cập nhật thất bại: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }
        
        setIsSaving(true);
        try {
            await userService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Đổi mật khẩu thành công!");
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 md:px-8 lg:px-12">
            <FadeContent>
                <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: User Info & Menu */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-sm">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1 mx-auto">
                                    <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-white/50" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">{user.name}</h2>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded tracking-wider">
                                    {user.role?.name || user.role}
                                </span>
                            </div>
                            
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">Chỉnh sửa hồ sơ</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                                        <DialogDescription>
                                            Thay đổi thông tin hiển thị của bạn.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Tên hiển thị
                                            </Label>
                                            <Input
                                                id="name"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="avatar" className="text-right">
                                                Avatar URL
                                            </Label>
                                            <Input
                                                id="avatar"
                                                value={editForm.avatar}
                                                onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                                                className="col-span-3"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                                        <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
                                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Lưu thay đổi
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-2 shadow-sm">
                            <nav className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <History className="w-4 h-4 mr-3" /> Lịch sử xem
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <Settings className="w-4 h-4 mr-3" /> Cài đặt chung
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                                    <Link to="/quan-ly-phien">
                                        <Shield className="w-4 h-4 mr-3" /> Quản lý phiên đăng nhập
                                    </Link>
                                </Button>
                                
                                <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                            <Shield className="w-4 h-4 mr-3" /> Đổi mật khẩu
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Đổi mật khẩu</DialogTitle>
                                            <DialogDescription>
                                                Nhập mật khẩu hiện tại và mật khẩu mới.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setIsChangingPassword(false)}>Hủy</Button>
                                            <Button type="button" onClick={handleChangePassword} disabled={isSaving}>
                                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Đổi mật khẩu
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Separator className="my-2 opacity-50" />
                                <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
                                </Button>
                            </nav>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Section: Continue Watching */}
                        <section className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" /> Tiếp tục xem
                                </h3>
                            </div>
                            
                            {isLoadingHistory ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="aspect-[2/1] bg-muted/20 animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : history.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {history.map((item, idx) => (
                                        <Link to={`/xem-phim/${item.movie?.slug}/${item.episode?.slug}`} key={idx} className="group relative bg-card border border-border rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-all">
                                            <div className="w-1/3 aspect-[2/3] bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.movie?.poster_url || item.movie?.thumb_url})` }} />
                                            <div className="w-2/3 p-3 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{item.movie?.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{item.episode?.name}</p>
                                                </div>
                                                <div className="space-y-1.5 mt-2">
                                                    {item.progress > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                                <span>Đã xem {Math.round(item.progress)}%</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                                                            </div>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="secondary" className="w-full h-7 text-xs mt-1 bg-muted hover:bg-primary hover:text-white transition-colors">
                                                        <Play className="w-3 h-3 mr-1" /> Xem tiếp
                                                    </Button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-card border border-border rounded-xl">
                                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">Bạn chưa xem phim nào gần đây.</p>
                                    <Button variant="link" asChild className="mt-2 text-primary">
                                        <Link to="/">Khám phá ngay</Link>
                                    </Button>
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* Section: Settings */}
                        <section className="space-y-4">
                             <h3 className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" /> Cài đặt
                            </h3>
                            <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-full"><Bell className="w-4 h-4" /></div>
                                        <div>
                                            <p className="font-medium">Thông báo</p>
                                            <p className="text-xs text-muted-foreground">Nhận thông báo về phim mới</p>
                                        </div>
                                    </div>
                                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-full"><Moon className="w-4 h-4" /></div>
                                        <div>
                                            <p className="font-medium">Giao diện tối (Dark Mode)</p>
                                            <p className="text-xs text-muted-foreground">Đã được đồng bộ với cài đặt hệ thống</p>
                                        </div>
                                    </div>
                                    <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </FadeContent>
        </div>
    );
}

export default Profile;
