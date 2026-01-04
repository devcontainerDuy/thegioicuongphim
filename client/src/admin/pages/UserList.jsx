import React, { useState, useEffect, useCallback } from 'react';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.getUsers(page, 20, search);
            setUsers(result.items || []);
        } catch (error) {
            toast.error('Lỗi tải danh sách users');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Đổi role thành "${newRole}"?`)) return;
        try {
            await adminService.updateUserRole(id, newRole);
            toast.success('Đã cập nhật role');
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi cập nhật role');
        }
    };

    const handleDelete = async (id, email) => {
        if (!window.confirm(`Xóa user "${email}"?`)) return;
        try {
            await adminService.deleteUser(id);
            toast.success('Đã xóa user');
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi xóa user');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-white">Quản lý Users</h1>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Tìm email hoặc tên..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-10 bg-zinc-900 border-zinc-800"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium">User</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden md:table-cell">Role</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden lg:table-cell">Favorites</th>
                                <th className="text-left px-4 py-3 text-zinc-400 text-sm font-medium hidden lg:table-cell">Đã xem</th>
                                <th className="text-right px-4 py-3 text-zinc-400 text-sm font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-800/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                                {user.name?.charAt(0) || user.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name || 'N/A'}</p>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            user.role === 'admin' 
                                                ? 'bg-primary/20 text-primary' 
                                                : 'bg-zinc-800 text-zinc-300'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">
                                        {user._count?.favorites || 0}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell">
                                        {user._count?.watchHistory || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-zinc-400 hover:text-white"
                                                onClick={() => handleRoleChange(user.id, user.role)}
                                                title="Đổi role"
                                            >
                                                {user.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => handleDelete(user.id, user.email)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!users.length && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                                        Không có user nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default UserList;
