import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Trash2, LogOut, Loader2, Shield, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FadeContent from '@/components/bits/FadeContent';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';
import { toast } from 'sonner';

function SessionManager() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
    const [isBulkRevoking, setIsBulkRevoking] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const data = await authService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Không thể tải danh sách phiên đăng nhập");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectAll = () => {
        // Only select sessions that are NOT the current one (index 0)
        const otherSessions = sessions.slice(1);
        if (selectedIds.length === otherSessions.length && otherSessions.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(otherSessions.map(s => s.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkRevoke = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkRevoking(true);
        try {
            await authService.bulkRevokeSessions(selectedIds);
            setSessions(prev => prev.filter(s => !selectedIds.includes(s.id)));
            setSelectedIds([]);
            toast.success(`Đã thu hồi ${selectedIds.length} phiên đăng nhập`);
        } catch (error) {
            toast.error("Không thể thu hồi các phiên đã chọn");
        } finally {
            setIsBulkRevoking(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        setRevokingId(sessionId);
        try {
            await authService.revokeSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            toast.success("Đã thu hồi phiên đăng nhập");
        } catch (error) {
            toast.error("Không thể thu hồi phiên đăng nhập");
        } finally {
            setRevokingId(null);
        }
    };

    const handleLogoutAll = async () => {
        setIsLoggingOutAll(true);
        try {
            await authService.logoutAll();
            toast.success("Đã đăng xuất tất cả thiết bị");
            logout();
            navigate('/dang-nhap');
        } catch (error) {
            toast.error("Không thể đăng xuất tất cả thiết bị");
        } finally {
            setIsLoggingOutAll(false);
        }
    };

    const getDeviceIcon = (userAgent) => {
        if (!userAgent) return <Monitor className="w-5 h-5" />;
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return <Smartphone className="w-5 h-5" />;
        }
        if (ua.includes('ipad') || ua.includes('tablet')) {
            return <Tablet className="w-5 h-5" />;
        }
        return <Monitor className="w-5 h-5" />;
    };

    const getDeviceName = (userAgent) => {
        if (!userAgent) return 'Thiết bị không xác định';
        const ua = userAgent.toLowerCase();
        
        // Browser
        let browser = 'Trình duyệt';
        if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
        else if (ua.includes('firefox')) browser = 'Firefox';
        else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
        else if (ua.includes('edg')) browser = 'Edge';
        else if (ua.includes('opera')) browser = 'Opera';

        // OS
        let os = '';
        if (ua.includes('windows')) os = 'Windows';
        else if (ua.includes('mac')) os = 'macOS';
        else if (ua.includes('linux')) os = 'Linux';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

        return `${browser}${os ? ` trên ${os}` : ''}`;
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
        
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        navigate('/dang-nhap');
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 md:px-8 lg:px-12">
            <FadeContent>
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" />
                                Quản lý phiên đăng nhập
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10" disabled={isBulkRevoking}>
                                            {isBulkRevoking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Thu hồi ({selectedIds.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Thu hồi {selectedIds.length} phiên đã chọn?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Các thiết bị đã chọn sẽ bị đăng xuất ngay lập tức.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleBulkRevoke} className="bg-destructive hover:bg-destructive/90">
                                                Thu hồi ngay
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={isLoggingOutAll || sessions.length === 0}>
                                        {isLoggingOutAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Đăng xuất tất cả
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-destructive" />
                                            Đăng xuất tất cả thiết bị?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Hành động này sẽ đăng xuất bạn khỏi tất cả thiết bị, bao gồm cả thiết bị hiện tại. 
                                            Bạn sẽ cần đăng nhập lại.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLogoutAll} className="bg-destructive hover:bg-destructive/90">
                                            Đăng xuất tất cả
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <Separator />

                    {/* Toolbar */}
                    {!isLoading && sessions.length > 1 && (
                        <div className="flex items-center gap-2 px-2">
                             <input 
                                type="checkbox" 
                                id="select-all"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background cursor-pointer"
                                checked={selectedIds.length === sessions.length - 1 && sessions.length > 1}
                                onChange={toggleSelectAll}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                                Chọn tất cả (trừ phiên hiện tại)
                            </label>
                            {selectedIds.length > 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                    Đã chọn {selectedIds.length} phiên
                                </span>
                            )}
                        </div>
                    )}

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-1/3" />
                                            <div className="h-3 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="space-y-4">
                            {sessions.map((session, index) => (
                                <div 
                                    key={session.id} 
                                    className={`bg-card border border-border rounded-xl p-4 transition-all hover:shadow-md relative overflow-hidden group ${
                                        index === 0 ? 'ring-2 ring-primary/50' : selectedIds.includes(session.id) ? 'ring-2 ring-primary/30 bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Multi-select Checkbox */}
                                        {index !== 0 && (
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background cursor-pointer"
                                                checked={selectedIds.includes(session.id)}
                                                onChange={() => toggleSelect(session.id)}
                                            />
                                        )}

                                        {/* Device Icon */}
                                        <div className={`p-3 rounded-lg ${index === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {getDeviceIcon(session.userAgent)}
                                        </div>

                                        {/* Device Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">
                                                    {getDeviceName(session.userAgent)}
                                                </h3>
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase">
                                                        Hiện tại
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                                {session.ipAddress && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {session.ipAddress}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(session.lastActivityAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Individual Revoke Action */}
                                        {index !== 0 && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                        disabled={revokingId === session.id}
                                                    >
                                                        {revokingId === session.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-5 h-5" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Thu hồi phiên đăng nhập?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Thiết bị này sẽ bị đăng xuất và cần đăng nhập lại để tiếp tục sử dụng.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => handleRevokeSession(session.id)}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            Thu hồi
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">Không có phiên đăng nhập nào khác.</p>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground">
                        <p className="flex items-start gap-2">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                                Nếu bạn thấy phiên đăng nhập lạ, hãy thu hồi ngay và đổi mật khẩu để bảo vệ tài khoản.
                            </span>
                        </p>
                    </div>
                </div>
            </FadeContent>
        </div>
    );
}

export default SessionManager;
