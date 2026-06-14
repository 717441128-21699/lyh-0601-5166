import { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Filter, Phone, Shield, Calendar, CheckCircle2, XCircle, Pencil, Save, X } from 'lucide-react';
import { api } from '@/utils/api';
import { formatDate, getRoleLabel } from '@/utils/format';
import type { User, UserRole } from '../../shared/types';

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  owner: { label: '业主', color: 'bg-blue-100 text-blue-700' },
  worker: { label: '施工队', color: 'bg-amber-100 text-amber-700' },
  supervisor: { label: '项目监理', color: 'bg-primary-100 text-primary-700' },
  admin: { label: '管理员', color: 'bg-purple-100 text-purple-700' },
};

interface UserFormData {
  name: string;
  phone: string;
  role: UserRole;
}

const emptyForm: UserFormData = { name: '', phone: '', role: 'owner' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      const query = params.toString();
      const data = await api.get<User[]>(`/api/users${query ? `?${query}` : ''}`);
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, phone: user.phone, role: user.role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.role) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, formData);
      } else {
        await api.post('/api/users', formData);
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await api.put(`/api/users/${user.id}`, { status: user.status === 'active' ? 'inactive' : 'active' });
      await fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(
    (u) => !searchText || u.name.includes(searchText) || u.phone.includes(searchText)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleCounts: Record<UserRole, number> = { owner: 0, worker: 0, supervisor: 0, admin: 0 };
  users.forEach((u) => (roleCounts[u.role] += 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理系统用户及角色权限分配</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreateModal}>
          <UserPlus size={18} />
          新增用户
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(roleConfig) as UserRole[]).map((role, idx) => (
          <div
            key={role}
            className="card p-4 card-hover animate-slide-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${roleConfig[role].color.replace(
                  'text-',
                  'bg-',
                )} bg-opacity-10`}
              >
                <Shield size={20} className={roleConfig[role].color.split(' ')[1]} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{roleConfig[role].label}</p>
                <p className="text-xl font-bold text-slate-800">{roleCounts[role]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索用户名或手机号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-base pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-base w-auto"
          >
            <option value="">全部角色</option>
            <option value="owner">业主</option>
            <option value="worker">施工队</option>
            <option value="supervisor">项目监理</option>
            <option value="admin">管理员</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-auto"
          >
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '320ms' }}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">用户信息</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">手机号</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">角色</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">创建时间</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const config = roleConfig[user.role];
              return (
                <tr
                  key={user.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${config.color}`}>{config.label}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`badge ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                        onClick={() => openEditModal(user)}
                        title="编辑"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${
                          user.status === 'active'
                            ? 'text-slate-500 hover:text-red-600'
                            : 'text-slate-500 hover:text-green-600'
                        }`}
                        onClick={() => toggleStatus(user)}
                        title={user.status === 'active' ? '禁用' : '启用'}
                      >
                        {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? '编辑用户' : '新增用户'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
                <input
                  type="text"
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
                <input
                  type="text"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input-base"
                >
                  <option value="owner">业主</option>
                  <option value="worker">施工队</option>
                  <option value="supervisor">项目监理</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={closeModal} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.name || !formData.phone}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
