import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { userApi } from '../api/userApi';
import { ShieldAlert, CheckCircle2, XCircle, Loader2, ArrowLeft, MoreVertical } from 'lucide-react';

interface UserData {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

import React from 'react';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName || '';
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

export default function AdminUsers() {
  const realName = useRealUserName();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOption, setErrorOption] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorOption(null);
    try {
      const response = await userApi.getAllUsers();
      // Assume the backend returns an array of UserResponse DTOs directly or wrapped in data
      setUsers(response.data);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách users:', error);
      setErrorOption(error.response?.data?.message || 'Không thể tải danh sách tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserData) => {
    try {
      if (user.active) {
        await userApi.deactivateUser(user.userId);
      } else {
        await userApi.activateUser(user.userId);
      }
      // Re-fetch users to reflect changes accurately from DB
      await fetchUsers();
    } catch (error: any) {
      alert('Thay đổi trạng thái thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <DashboardLayout role="admin" userName={realName}>
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {user.active ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              Hoạt Động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                              Bị Khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => handleToggleStatus(user)}
                            variant={user.active ? "destructive" : "outline"}
                            size="sm"
                            className={!user.active ? "border-green-600 text-green-600 hover:bg-green-50" : ""}
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


