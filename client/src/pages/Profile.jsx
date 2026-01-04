import React, { useState, useEffect } from 'react';
import { User, Settings, History, LogOut, Bell, Moon, Shield, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import FadeContent from '@/components/bits/FadeContent';
import { getWatchHistory } from '@/utils/storage';

function Profile() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(getWatchHistory());
    }, []);

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
                                        <User className="w-10 h-10 text-white/50" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">Member</h2>
                                <p className="text-muted-foreground text-sm">member@example.com</p>
                            </div>
                            <Button variant="outline" className="w-full">Chỉnh sửa hồ sơ</Button>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-2 shadow-sm">
                            <nav className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <History className="w-4 h-4 mr-3" /> Lịch sử xem
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <Settings className="w-4 h-4 mr-3" /> Cài đặt chung
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <Shield className="w-4 h-4 mr-3" /> Bảo mật
                                </Button>
                                <Separator className="my-2 opacity-50" />
                                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
                                {/* <Button variant="link" className="text-muted-foreground hover:text-primary p-0">Xem tất cả</Button> */}
                            </div>
                            
                            {history.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {history.map((film, idx) => (
                                        <Link to={`/xem-phim/${film.film_slug}/${film.episode_slug}`} key={idx} className="group relative bg-card border border-border rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-all">
                                            <div className="w-1/3 aspect-[2/3] bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${film.film_thumb})` }} />
                                            <div className="w-2/3 p-3 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{film.film_name}</h4>
                                                    <p className="text-xs text-muted-foreground">{film.episode_name}</p>
                                                </div>
                                                <div className="space-y-1.5 mt-2">
                                                    {film.progress > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                                <span>Đã xem {film.progress}%</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${film.progress}%` }} />
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
