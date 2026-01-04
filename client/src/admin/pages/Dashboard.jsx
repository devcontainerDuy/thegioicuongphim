import React, { useState, useEffect } from 'react';
import adminService from '@/services/adminService';
import { Film, Users, Eye, DollarSign } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import AdminHeader from '@/admin/components/AdminHeader';
import StatCard from '@/admin/components/StatCard';

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

    // Prepare stats with safe defaults
    const stats = [
        {
            title: 'Tổng Phim',
            value: data?.totalMovies || 0,
            icon: Film,
            color: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
            trend: 5.2 
        },
        {
            title: 'Tổng Users',
            value: data?.totalUsers || 0,
            icon: Users,
            color: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
            trend: 12.5
        },
        {
            title: 'Lượt xem',
            value: data?.totalViews || 0,
            icon: Eye,
            color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
            trend: -2.4 
        },
        {
            title: 'Doanh thu (Ước tính)',
            value: '$1,234',
            icon: DollarSign,
            color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
            trend: 8.1,
            subtext: '+ $230 from last month'
        }
    ];

    return (
        <div className="space-y-6 fade-in">
            <AdminHeader 
                title="Dashboard" 
                description="Tổng quan số liệu của hệ thống"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Activity Section (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Hoạt động gần đây</h3>
                    <div className="text-zinc-500 text-sm text-center py-10">
                        Chưa có dữ liệu hoạt động
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-lg font-bold text-white mb-4">Phim Top 10</h3>
                     <div className="text-zinc-500 text-sm text-center py-10">
                        Chưa có dữ liệu
                     </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
