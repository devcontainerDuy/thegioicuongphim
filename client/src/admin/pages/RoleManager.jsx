import React, { useState, useEffect } from 'react';
import adminService from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import AdminHeader from '@/admin/components/AdminHeader';

function RoleManager() {
    // ... (state remains same)
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedPermissions: []
    });

    const initData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                adminService.getRoles(),
                adminService.getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (error) {
            toast.error('Lỗi tải dữ liệu roles/permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initData();
    }, []);

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                selectedPermissions: role.permissions?.map(p => p.slug) || []
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                selectedPermissions: []
            });
        }
        setIsModalOpen(true);
    };

    const handlePermissionToggle = (slug) => {
        setFormData(prev => {
            const current = prev.selectedPermissions;
            if (current.includes(slug)) {
                return { ...prev, selectedPermissions: current.filter(p => p !== slug) };
            } else {
                return { ...prev, selectedPermissions: [...current, slug] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                permissions: formData.selectedPermissions
            };

            if (editingRole) {
                await adminService.updateRole(editingRole.id, payload);
                toast.success('Cập nhật role thành công');
            } else {
                await adminService.createRole(payload);
                toast.success('Tạo role thành công');
            }
            setIsModalOpen(false);
            initData();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (role) => {
        if (role.name === 'Admin') return toast.error('Không thể xóa role Admin');
        if (!window.confirm(`Xóa role "${role.name}"?`)) return;

        try {
            await adminService.deleteRole(role.id);
            toast.success('Đã xóa role');
            initData();
        } catch (error) {
            toast.error('Lỗi xóa role');
        }
    };

    // Permission Management State
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [newPermission, setNewPermission] = useState({ slug: '', description: '' });

    const handleCreatePermission = async (e) => {
        e.preventDefault();
        try {
            await adminService.createPermission(newPermission);
            toast.success('Tạo Permission thành công');
            setNewPermission({ slug: '', description: '' });
            initData(); // Refresh list
        } catch (error) {
            toast.error('Lỗi tạo Permission');
        }
    };

    const handleDeletePermission = async (id) => {
        if (!window.confirm('Xóa permission này? Các Role đang dùng sẽ bị mất quyền này.')) return;
        try {
            await adminService.deletePermission(id);
            toast.success('Xóa Permission thành công');
            initData();
        } catch (error) {
            toast.error('Lỗi xóa Permission');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 fade-in">
            <AdminHeader 
                title="Quản lý Phân quyền" 
                description="Danh sách Roles và Permissions của hệ thống"
            >
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPermissionModalOpen(true)} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                        Quản lý Permissions
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Tạo Role
                    </Button>
                </div>
            </AdminHeader>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{role.name}</h3>
                                    <p className="text-xs text-zinc-500">{role._count?.users || 0} users</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleOpenModal(role)} className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                {role.name !== 'Admin' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(role)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-zinc-400 min-h-[40px]">
                            {role.description || 'Chưa có mô tả'}
                        </p>

                        <div className="pt-4 border-t border-zinc-800">
                            <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Quyền hạn ({role.permissions?.length || 0})</p>
                            <div className="flex flex-wrap gap-1.5">
                                {role.permissions?.slice(0, 5).map(p => (
                                    <span key={p.id} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                                        {p.slug}
                                    </span>
                                ))}
                                {(role.permissions?.length || 0) > 5 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700">
                                        +{role.permissions.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Management Modal */}
            {isPermissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Quản lý Permissions System</h2>
                            <button onClick={() => setIsPermissionModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                             {/* Create Form */}
                             <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-4">
                                <h3 className="font-semibold text-white">Thêm Permission Mới</h3>
                                <form onSubmit={handleCreatePermission} className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 space-y-1.5 w-full">
                                        <Label>Slug (Mã quyền)</Label>
                                        <Input 
                                            value={newPermission.slug}
                                            onChange={(e) => setNewPermission({...newPermission, slug: e.target.value})}
                                            placeholder="ex: movie.create" 
                                            className="bg-black/50"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1.5 w-full">
                                        <Label>Mô tả</Label>
                                        <Input 
                                            value={newPermission.description}
                                            onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
                                            placeholder="Mô tả quyền hạn..." 
                                            className="bg-black/50"
                                        />
                                    </div>
                                    <Button type="submit" disabled={!newPermission.slug} className="bg-primary text-white whitespace-nowrap">
                                        <Plus className="w-4 h-4 mr-2" /> Thêm
                                    </Button>
                                </form>
                             </div>

                             {/* Permission List Table */}
                             <div>
                                <h3 className="font-semibold text-white mb-4">Danh sách Permissions hiện có ({permissions.length})</h3>
                                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-zinc-400 bg-zinc-950 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Slug</th>
                                                <th className="px-4 py-3">Mô tả</th>
                                                <th className="px-4 py-3 text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800">
                                            {permissions.map(perm => (
                                                <tr key={perm.id} className="hover:bg-zinc-800/50">
                                                    <td className="px-4 py-3 font-medium text-white">{perm.slug}</td>
                                                    <td className="px-4 py-3 text-zinc-400">{perm.description}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => handleDeletePermission(perm.id)}
                                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {permissions.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-500 italic">
                                                        Chưa có dữ liệu permissions.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingRole ? `Sửa Role: ${editingRole.name}` : 'Tạo Role Mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {/* ... Modal Body ... */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Tên Role</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ví dụ: Editor"
                                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Mô tả</Label>
                                <Input 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Mô tả chức năng của role này..."
                                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-zinc-300">Phân quyền</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {permissions.map(perm => (
                                        <div 
                                            key={perm.id}
                                            onClick={() => handlePermissionToggle(perm.slug)}
                                            className={`
                                                flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                                ${formData.selectedPermissions.includes(perm.slug) 
                                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/10' 
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'}
                                            `}
                                        >
                                            <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center
                                                ${formData.selectedPermissions.includes(perm.slug) ? 'bg-primary border-primary' : 'border-zinc-600'}
                                            `}>
                                                {formData.selectedPermissions.includes(perm.slug) && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{perm.slug}</p>
                                                <p className="text-xs opacity-70 truncate">{perm.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {permissions.length === 0 && (
                                        <p className="text-zinc-500 text-sm italic col-span-2">Chưa có permission nào trong hệ thống.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button onClick={handleSubmit} className="bg-primary text-white">
                                <Save className="w-4 h-4 mr-2" /> Lưu lại
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoleManager;
