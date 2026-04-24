import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';
import {
  ShieldAlert, CheckCircle2, XCircle, Loader2, ArrowLeft,
  X, Eye, EyeOff, UserPlus,
} from 'lucide-react';
import React from 'react';

interface UserData {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface CreateAccountForm {
  fullName: string;
  email: string;
  password: string;
  role: 'STAFF' | 'MANAGER';
}

/* ─── helper: lấy tên từ JWT ─── */
function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).fullName || '';
  } catch { return ''; }
}
function useRealUserName() {
  const [name, setName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);
  return name;
}

/* ═══════════════════════════════════════════════════════════
   MODAL TẠO TÀI KHOẢN
   ═══════════════════════════════════════════════════════════ */
function CreateAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<CreateAccountForm>({
    fullName: '',
    email: '',
    password: '',
    role: 'STAFF',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form khi đóng/mở lại
  useEffect(() => {
    if (isOpen) {
      setForm({ fullName: '', email: '', password: '', role: 'STAFF' });
      setError(null);
      setSuccess(false);
      setShowPassword(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!form.fullName.trim()) return setError('Vui lòng nhập họ và tên.');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return setError('Email không hợp lệ.');
    if (form.password.length < 6)
      return setError('Mật khẩu phải có ít nhất 6 ký tự.');

    setIsSubmitting(true);
    try {
      await authApi.createInternalAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();   // refresh bảng
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Tạo tài khoản thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tạo Tài Khoản Mới</h2>
                <p className="text-blue-100 text-xs">Dành cho STAFF hoặc MANAGER</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Thông báo lỗi */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Thành công */}
          {success && (
            <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Tạo tài khoản thành công! Đang đóng...</span>
            </div>
          )}

          {/* Họ và Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              disabled={isSubmitting || success}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nhanvien@planbook.edu.vn"
              disabled={isSubmitting || success}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mật Khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                disabled={isSubmitting || success}
                className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Phân quyền */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phân Quyền <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['STAFF', 'MANAGER'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    form.role === r
                      ? r === 'STAFF'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isSubmitting || success ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => setForm({ ...form, role: r })}
                    className="hidden"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.role === r
                        ? r === 'STAFF'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {form.role === r && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${
                      form.role === r
                        ? r === 'STAFF' ? 'text-orange-700' : 'text-purple-700'
                        : 'text-gray-700'
                    }`}>
                      {r}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r === 'STAFF' ? 'Soạn giáo án' : 'Duyệt giáo án'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Tạo Tài Khoản
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRANG CHÍNH AdminUsers
   ═══════════════════════════════════════════════════════════ */
export default function AdminUsers() {
  const realName = useRealUserName();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOption, setErrorOption] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorOption(null);
    try {
      // axiosClient interceptor đã unwrap response.data rồi
      // nên `data` ở đây là array trực tiếp, không cần .data nữa
      const data = await userApi.getAllUsers();
      // Chỉ lấy danh sách nhân sự nội bộ (ADMIN, MANAGER, STAFF), ẩn TEACHER đi
      const internalUsers = (Array.isArray(data) ? data : []).filter(u => u.role !== 'TEACHER');
      setUsers(internalUsers);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách users:', error);
      setErrorOption(error.response?.data?.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (user: UserData) => {
    try {
      if (user.active) {
        await userApi.deactivateUser(user.userId);
      } else {
        await userApi.activateUser(user.userId);
      }
      await fetchUsers();
    } catch (error: any) {
      alert('Thay đổi trạng thái thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <DashboardLayout role="admin" userName={realName}>
      {/* Modal */}
      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Về lại Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
            <p className="text-gray-600">Toàn quyền kiểm soát tài khoản giáo viên, nhân viên trên hệ thống</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <ShieldAlert className="w-4 h-4" />
            Tạo tài khoản STAFF/MANAGER
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Danh Sách Tài Khoản</CardTitle>
            <CardDescription>Cập nhật tự động theo thời gian thực</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-semibold text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : errorOption ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <XCircle className="w-6 h-6" />
                <p className="font-medium">{errorOption}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có người dùng nào trong hệ thống, hoặc họ chưa đăng nhập lần nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-600">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Họ và Tên</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Quyền (Role)</th>
                      <th className="p-4 font-semibold text-center">Trạng Thái</th>
                      <th className="p-4 font-semibold text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-gray-500">#{user.userId}</td>
                        <td className="p-4 font-semibold text-gray-900">{user.fullName || 'Chưa cập nhật'}</td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            user.role === 'ADMIN'   ? 'bg-purple-100 text-purple-700' :
                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700'    :
                            user.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {user.active ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              Hoạt Động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              Bị Khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => handleToggleStatus(user)}
                            variant={user.active ? 'destructive' : 'outline'}
                            size="sm"
                            className={!user.active ? 'border-green-600 text-green-600 hover:bg-green-50' : ''}
                            disabled={user.role === 'ADMIN'}
                          >
                            {user.active ? 'Khóa TK' : 'Mở Khóa'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
