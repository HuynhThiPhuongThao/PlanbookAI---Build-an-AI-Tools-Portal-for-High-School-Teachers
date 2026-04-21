import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Sparkles, PlusCircle, CheckCircle, Clock, TrendingUp, Database } from 'lucide-react';
import { Link } from 'react-router';
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

export default function StaffDashboard() {
  const realName = useRealUserName();

  const staffStats = [
    { label: 'Giáo án mẫu đã tạo', icon: FileText,     color: 'text-blue-600' },
    { label: 'Câu hỏi đã thêm',    icon: Database,     color: 'text-green-600' },
    { label: 'Prompt đã phát triển', icon: Sparkles,    color: 'text-purple-600' },
    { label: 'Tỉ lệ được duyệt',   icon: CheckCircle,  color: 'text-teal-600' },
  ];

  const tools = [
    {
      title: 'Soạn Giáo Án Mẫu',
      description: 'Chọn môn → chương → bài, gọi AI gợi ý nội dung, rồi gửi Manager duyệt',
      icon: FileText,
      color: 'bg-blue-500',
      action: 'Mở công cụ',
      href: '/staff/lesson-editor',
    },
    {
      title: 'Quản lý Prompt AI',
      description: 'Tạo và chỉnh sửa các mẫu câu lệnh để AI sinh nội dung chuẩn hơn',
      icon: Sparkles,
      color: 'bg-purple-500',
      action: 'Mở công cụ',
      href: '/staff/prompts',
    },
  ];

  return (
    <DashboardLayout role="staff" userName={realName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân Viên</h1>
          <p className="text-gray-600">Soạn nội dung giáo án mẫu và quản lý AI Prompts</p>
        </div>

        {/* Stats — chờ API thật */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffStats.map((stat) => (
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

        {/* Tools */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Công cụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={item.href}>
                      <PlusCircle className="w-4 h-4 mr-2" />{item.action}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Content — placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nội Dung Gần Đây</CardTitle>
                  <CardDescription>Các giáo án bạn đã tạo</CardDescription>
                </div>
                <Button variant="outline" size="sm">Xem tất cả</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có nội dung nào gần đây</p>
                <p className="text-xs text-gray-400">Bắt đầu soạn giáo án để thấy lịch sử tại đây</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quy trình làm việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                {['① Chọn Môn → Chương → Bài', '② Gọi AI gợi ý nội dung', '③ Chỉnh sửa & Lưu nháp', '④ Gửi Manager duyệt'].map((step) => (
                  <div key={step} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
