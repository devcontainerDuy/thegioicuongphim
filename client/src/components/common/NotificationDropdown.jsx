import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { backendApiClient } from '@/config/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await backendApiClient.get('/notifications?limit=20');
            setNotifications(response.data.items);
            setUnreadCount(response.data.unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Optional: Set up polling every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleRead = async (id) => {
        try {
            await backendApiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleReadAll = async () => {
        try {
            await backendApiClient.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (err) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleAction = (notification) => {
        handleRead(notification.id);
        if (notification.type === 'REPLY' && notification.metadata?.movieSlug) {
            navigate(`/phim/${notification.metadata.movieSlug}`);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isAuthenticated) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] bg-zinc-950 border-zinc-800 text-zinc-100">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleReadAll} className="text-xs h-7 px-2 hover:bg-zinc-800">
                            Đánh dấu đã đọc tất cả
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-zinc-900 transition-colors",
                                    !n.isRead && "bg-zinc-900/50 border-l-2 border-primary"
                                )}
                                onClick={() => handleAction(n)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <div className={cn(
                                        "p-2 rounded-full",
                                        n.type === 'REPLY' ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-400"
                                    )}>
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{n.title}</p>
                                        <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <span className="text-[10px] text-zinc-500 mt-1">{formatDate(n.createdAt)}</span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">Không có thông báo nào</p>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
