import React, { useState, useEffect } from 'react';
import adminService from '@/services/adminService';
import { Film, Users, Eye } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import AdminHeader from '@/admin/components/AdminHeader';
import StatCard from '@/admin/components/StatCard';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [data, setData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashResult, analyticsResult] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getAnalytics()
                ]);
                setData(dashResult);
                setAnalytics(analyticsResult);
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

    // Prepare stats with safe defaults
    const stats = [
        {
            title: 'Tổng Phim',
            value: data?.stats?.totalMovies || 0,
            icon: Film,
            color: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
            trend: 0 
        },
        {
            title: 'Tổng Users',
            value: data?.stats?.totalUsers || 0,
            icon: Users,
            color: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
            trend: 0
        },
        {
            title: 'Xem (Tháng)',
            value: analytics?.monthly || 0,
            icon: Eye,
            color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
            subtext: `Hôm nay: ${analytics?.daily || 0}`
        },
        {
            title: 'Xem (Tuần)',
            value: analytics?.weekly || 0,
            icon: Eye,
            color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
            subtext: `TB: ${Math.round((analytics?.weekly || 0) / 7)} / ngày`
        }
    ];

    const chartData = analytics?.chartData || [];

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className="text-sm font-bold text-emerald-500">
              {payload[0].value.toLocaleString()} lượt xem
            </p>
          </div>
        );
      }
      return null;
    };

    return (
        <div className="space-y-6 fade-in px-4 lg:px-0">
            <AdminHeader 
                title="Dashboard" 
                description="Tổng quan số liệu của hệ thống"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* View Trend Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Xu hướng lượt xem</h3>
                        <p className="text-sm text-zinc-500">Thống kê trong 30 ngày qua</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-zinc-400">Lượt xem</span>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    minTickGap={30}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
                                    }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="views" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorViews)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                            <Eye className="w-12 h-12 opacity-10" />
                            <p className="text-sm">Chưa có dữ liệu thống kê</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Phim mới cập nhật</h3>
                    <div className="space-y-4">
                        {data?.recentMovies?.length > 0 ? (
                            data.recentMovies.map((movie) => (
                                <div key={movie.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden">
                                            <img src={movie.thumbUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{movie.name}</p>
                                            <p className="text-xs text-zinc-500">{new Date(movie.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <Button asChild size="sm" variant="ghost">
                                        <a href={`/admin/movies/${movie.id}`}>Chi tiết</a>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 text-sm text-center py-10">Chưa có dữ liệu</div>
                        )}
                    </div>
                </div>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-lg font-bold text-white mb-4">Phim Top 10 (Tháng)</h3>
                     <div className="space-y-4">
                        {analytics?.topMovies?.length > 0 ? (
                            analytics.topMovies.map((movie, index) => (
                                <div key={movie.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 truncate">
                                        <span className="text-xs font-bold text-zinc-600 w-4">#{index + 1}</span>
                                        <p className="text-sm text-zinc-300 truncate">{movie.name}</p>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-500">{movie.views.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 text-sm text-center py-10">Chưa có dữ liệu</div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
