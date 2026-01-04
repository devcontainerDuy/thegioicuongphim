import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '@/services/adminService';
import { Film, Users, Eye, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-zinc-400 text-sm">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value?.toLocaleString() || 0}</p>
                {trend && (
                    <p className="flex items-center gap-1 text-xs text-green-400 mt-2">
                        <TrendingUp className="w-3 h-3" /> {trend}
                    </p>
                )}
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await adminService.getDashboard();
                setData(result);
            } catch (error) {
                console.error('Dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Tổng quan hệ thống</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Tổng số phim" 
                    value={data?.stats?.totalMovies} 
                    icon={Film}
                    color="bg-blue-500/20 text-blue-400"
                />
                <StatCard 
                    title="Tổng users" 
                    value={data?.stats?.totalUsers} 
                    icon={Users}
                    color="bg-green-500/20 text-green-400"
                />
                <StatCard 
                    title="Tổng lượt xem" 
                    value={data?.stats?.totalViews} 
                    icon={Eye}
                    color="bg-purple-500/20 text-purple-400"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Movies */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Phim mới thêm</h2>
                        <Link to="/admin/movies" className="text-primary text-sm flex items-center gap-1 hover:underline">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {data?.recentMovies?.map((movie) => (
                            <div key={movie.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
                                <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 shrink-0">
                                    <img src={movie.thumbUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{movie.name}</p>
                                    <p className="text-xs text-zinc-500">{new Date(movie.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        ))}
                        {!data?.recentMovies?.length && (
                            <p className="text-zinc-500 text-center py-4">Chưa có phim nào</p>
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Users mới</h2>
                        <Link to="/admin/users" className="text-primary text-sm flex items-center gap-1 hover:underline">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {data?.recentUsers?.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{user.name || user.email}</p>
                                    <p className="text-xs text-zinc-500">{user.role}</p>
                                </div>
                            </div>
                        ))}
                        {!data?.recentUsers?.length && (
                            <p className="text-zinc-500 text-center py-4">Chưa có user nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
