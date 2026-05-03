import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Users, Settings, FileText, UserPlus, Database, TrendingUp, Loader2, BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import { userApi } from '../api/userApi';
import { getQuestions } from '../api/questionApi';
import { getSubjects, getCurriculumTemplates } from '../api/curriculumApi';
import { getFullNameFromToken } from '../utils/jwt';

function getNameFromToken(): string {
  return getFullNameFromToken();
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

const ROLE_COLOR: Record<string, string> = {
  ADMIN:   'bg-purple-100 text-purple-700',
  MANAGER: 'bg-indigo-100 text-indigo-700',
  STAFF:   'bg-orange-100 text-orange-700',
  TEACHER: 'bg-blue-100 text-blue-700',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const realName = useRealUserName();

  // ── Real stats state ──
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    totalSubjects: 0,
    totalTemplates: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        // Gọi 4 API song song
        const [usersRes, questionsRes, subjectsRes, templatesRes] = await Promise.allSettled([
          userApi.getAllUsers(),
          getQuestions({ page: 0, size: 1 }),
          getSubjects(),
          getCurriculumTemplates(),
        ]);

        // Users
        if (usersRes.status === 'fulfilled') {
          const allUsers: any[] = Array.isArray(usersRes.value) ? usersRes.value : [];
          setStats(prev => ({
            ...prev,
            totalUsers: allUsers.length,
            totalTeachers: allUsers.filter((u: any) => u.role === 'TEACHER').length,
          }));
          // Lấy 5 user mới nhất (sort theo createdAt desc)
          const sorted = [...allUsers].sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setRecentUsers(sorted.slice(0, 5));
        }

        // Questions — lấy total từ pagination
        if (questionsRes.status === 'fulfilled') {
          const q: any = questionsRes.value;
          const total = q?.totalElements ?? q?.total ?? (Array.isArray(q) ? q.length : 0);
          setStats(prev => ({ ...prev, totalQuestions: total }));
        }

        // Subjects
        if (subjectsRes.status === 'fulfilled') {
          const subjects: any[] = Array.isArray(subjectsRes.value)
            ? subjectsRes.value
            : (subjectsRes.value as any)?.content ?? [];
          setStats(prev => ({ ...prev, totalSubjects: subjects.length }));
        }

        // Templates
        if (templatesRes.status === 'fulfilled') {
          const templates: any[] = Array.isArray(templatesRes.value)
            ? templatesRes.value
            : (templatesRes.value as any)?.content ?? [];
          setStats(prev => ({ ...prev, totalTemplates: templates.length }));
        }
      } catch (e) {
        console.error('Lỗi tải dashboard stats:', e);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Tổng người dùng',      value: stats.totalUsers,    icon: Users,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Giáo viên',            value: stats.totalTeachers, icon: UserPlus,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Câu hỏi ngân hàng',    value: stats.totalQuestions, icon: Database, color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Môn học',              value: stats.totalSubjects,  icon: BookOpen,  color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const adminActions = [
    {
      title: 'Quản lý người dùng',
      description: 'Tạo, chỉnh sửa và phân quyền tài khoản',
      icon: Users,
      action: 'Quản lý',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Chương trình giảng dạy',
      description: 'Thiết kế và quản lý khung chương trình cho giáo án mẫu',
      icon: FileText,
      action: 'Thiết kế',
      onClick: () => navigate('/admin/curriculum'),
    },
    {
      title: 'Doanh thu & Gói dịch vụ',
      description: 'Xem doanh thu, đăng ký gói dịch vụ và tăng trưởng người dùng theo tháng',
      icon: TrendingUp,
      action: 'Theo dõi',
      onClick: () => navigate('/admin/revenue'),
    },
    {
      title: 'Cấu hình hệ thống',
      description: 'Điều chỉnh mô hình AI, giới hạn sử dụng, thông báo và chế độ bảo trì',
      icon: Settings,
      action: 'Cài đặt',
      onClick: () => navigate('/admin/system-config'),
    },
  ];

  return (
    <DashboardLayout role="admin" userName={realName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xin chào, {realName || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600">Trang quản trị hệ thống PlanbookAI</p>
        </div>

        {/* Stats thật từ API */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {loadingStats ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                  ) : (
                    <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Công Cụ Quản Trị</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <action.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={action.onClick}>
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Người dùng mới — dữ liệu thật từ userApi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Người Dùng Mới Đăng Ký</CardTitle>
                <CardDescription>5 tài khoản được tạo gần nhất</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có người dùng nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                        {(user.fullName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.fullName || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLOR[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
