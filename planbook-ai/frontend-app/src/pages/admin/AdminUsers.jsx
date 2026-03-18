import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ChevronDown, Search, UserCheck, UserX, RefreshCw, X } from 'lucide-react';
import userApi from '../../api/userApi';

const ROLES = ['TEACHER', 'STAFF', 'MANAGER', 'ADMIN'];
const ROLE_STYLES = {
  TEACHER: 'bg-blue-50 text-blue-700',
  STAFF: 'bg-violet-50 text-violet-700',
  MANAGER: 'bg-emerald-50 text-emerald-700',
  ADMIN: 'bg-red-50 text-red-700',
};

// Modal tạo user mới
const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ email: '', fullName: '', role: 'TEACHER', phoneNumber: '', schoolName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName) { setError('Email và Họ tên là bắt buộc'); return; }
    setLoading(true); setError('');
    try {
      const res = await userApi.createUser(form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tạo tài khoản mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email *</label>
            <input type="email" required placeholder="nguyen.gv@school.edu.vn" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Họ và tên *</label>
            <input type="text" required placeholder="Nguyễn Văn A" value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Mật khẩu <span className="text-gray-400 normal-case font-normal">(mặc định: Planbook@2026)</span>
            </label>
            <input type="password" placeholder="Để trống = dùng mật khẩu mặc định" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Vai trò</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Số điện thoại</label>
            <input type="text" placeholder="0912345678" value={form.phoneNumber}
              onChange={e => setForm({...form, phoneNumber: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Trường</label>
            <input type="text" placeholder="Tên trường học" value={form.schoolName}
              onChange={e => setForm({...form, schoolName: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [changingRole, setChangingRole] = useState(null); // userId đang đổi role

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleChangeRole = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      const res = await userApi.changeRole(userId, newRole);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, role: res.data.role } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Đổi role thất bại');
    } finally { setChangingRole(null); }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      await userApi.toggleStatus(userId, !currentActive);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, active: !currentActive } : u));
    } catch (err) {
      alert('Thay đổi trạng thái thất bại');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-red-500 w-7 h-7" /> Quản lý người dùng
          </h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} tài khoản trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadUsers} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Plus size={16} /> Tạo tài khoản
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text" placeholder="Tìm theo email hoặc tên..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200">
          <option value="ALL">Tất cả role</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải danh sách...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Không tìm thấy tài khoản nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trường</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.avatarUrl && !user.avatarUrl.startsWith('http') && !user.avatarUrl.startsWith('/') && !user.avatarUrl.startsWith('data:')
                            ? <span>{user.avatarUrl}</span>
                            : (user.fullName?.charAt(0) || '?').toUpperCase()
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{user.fullName || '—'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={user.role}
                          disabled={changingRole === user.userId}
                          onChange={e => handleChangeRole(user.userId, e.target.value)}
                          className={`appearance-none cursor-pointer pl-3 pr-7 py-1.5 rounded-full text-xs font-bold border-0 ${ROLE_STYLES[user.role] || 'bg-gray-100 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-purple-300`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.active ? '● Hoạt động' : '○ Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.schoolName || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.userId, user.active)}
                          title={user.active ? 'Khóa tài khoản' : 'Mở tài khoản'}
                          className={`p-2 rounded-xl transition-colors ${user.active ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'}`}
                        >
                          {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(newUser) => setUsers(prev => [newUser, ...prev])}
        />
      )}
    </div>
  );
};

export default AdminUsers;
