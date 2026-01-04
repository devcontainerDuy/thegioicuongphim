import React, { useState, useEffect, useCallback } from 'react';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/admin/components/AdminHeader';

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
        const newRole = (currentRole === 'Admin' || currentRole === 'admin') ? 'User' : 'Admin';
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
        <div className="space-y-6 fade-in">
             <AdminHeader 
                title="Quản lý Users" 
                description="Danh sách người dùng và phân quyền hệ thống"
            >
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm email hoặc tên..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-primary/50"
                    />
                </div>
            </AdminHeader>

            {/* Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">User</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden md:table-cell">Role</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden lg:table-cell">Favorites</th>
                                    <th className="text-left px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider hidden lg:table-cell">Đã xem</th>
                                    <th className="text-right px-6 py-4 text-zinc-400 text-xs uppercase font-semibold tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold shrink-0">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-zinc-200 font-medium">{user.name || 'N/A'}</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`px-2.5 py-1 text-xs rounded-full border font-medium inline-flex items-center gap-1.5
                                                ${user.role?.name === 'Admin' || user.role === 'Admin' 
                                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'}
                                            `}>
                                                {(user.role?.name === 'Admin' || user.role === 'Admin') && <ShieldCheck className="w-3 h-3" />}
                                                {user.role?.name || user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell text-sm">
                                            {user._count?.favorites || 0} phim
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell text-sm">
                                            {user._count?.watchHistory || 0} phim
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                    onClick={() => handleRoleChange(user.id, user.role?.name || user.role)}
                                                    title="Đổi role"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
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
                                        <td colSpan={5} className="text-center py-16 text-zinc-500">
                                            Không tìm thấy user nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserList;
