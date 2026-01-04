import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
    LayoutDashboard, Film, Users, Settings, LogOut, 
    Menu, X, ChevronRight, Shield 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Phim', path: '/admin/movies', icon: Film },
    { name: 'Quản lý Users', path: '/admin/users', icon: Users },
    { name: 'Phân quyền', path: '/admin/roles', icon: Shield },
    { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
];

function AdminLayout() {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Check if user is admin
    if (!user || (user.role?.name !== 'Admin' && user.role !== 'Admin')) {
        return <Navigate to="/dang-nhap" replace />;
    }

    return (
        <div className="flex min-h-screen bg-black font-sans text-zinc-100">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 transition-all duration-300",
                sidebarOpen ? "w-64" : "w-16"
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/60">
                    {sidebarOpen && (
                        <Link to="/admin" className="text-xl font-bold tracking-tight">
                            <span className="text-white">Admin</span>
                            <span className="text-primary ml-1">Panel</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || 
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive 
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium" 
                                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "animate-pulse-subtle")} />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/40">
                    <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-zinc-900">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <Button
                            variant="ghost"
                            className="w-full mt-3 justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-9"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                        </Button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300 flex flex-col min-h-screen",
                sidebarOpen ? "ml-64" : "ml-16"
            )}>
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 flex items-center px-8 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60">
                    <div className="flex items-center text-sm font-medium text-zinc-400">
                        <Link to="/" className="hover:text-primary transition-colors">Client</Link>
                        <ChevronRight className="w-4 h-4 mx-2 text-zinc-600" />
                        <span className="text-zinc-100">Administration</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
