import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Settings, FileText, Shield, UserPlus, Database, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import React from 'react';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const realName = useRealUserName();

  const systemStats = [
    { label: 'Tổng người dùng',    icon: Users,    color: 'text-purple-600' },
    { label: 'Giáo viên đang hoạt động', icon: UserPlus, color: 'text-blue-600' },
    { label: 'Uptime hệ thống',    icon: Shield,   color: 'text-green-600' },
    { label: 'Doanh thu tháng',    icon: Database, color: 'text-orange-600' },
  ];

  const adminActions = [
    {
      title: 'Quản lý Người Dùng',
      description: 'Tạo, chỉnh sửa và phân quyền tài khoản (Teacher, Staff, Manager)',
      icon: Users,
      action: 'Mở quản lý',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Cấu hình Hệ Thống',
      description: 'Cấu hình các thông số vận hành toàn hệ thống',
      icon: Settings,
      action: 'Cấu hình',
      onClick: () => {},
    },
    {
      title: 'Chương Trình Giảng Dạy',
      description: 'Thiết kế và quản lý khung chương trình (Môn, Chương, Bài)',
      icon: FileText,
      action: 'Quản lý',
      onClick: () => {},
    },
    {
      title: 'Bảo Mật & Phân Quyền',
      description: 'Kiểm soát quyền truy cập và nhật ký hoạt động hệ thống',
      icon: Shield,
      action: 'Xem báo cáo',
      onClick: () => {},
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

        {/* Stats — chờ API thật */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-2xl font-bold text-gray-400">—</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp className="w-3 h-3" /> Đang cập nhật...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Công cụ Quản Trị</h2>
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

        {/* Recent Registrations — placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Người Dùng Mới Đăng Ký</CardTitle>
                <CardDescription>Các tài khoản được tạo gần đây</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Vào "Quản lý Người Dùng" để xem danh sách đầy đủ</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
