import { Link } from 'react-router';
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen, FileText, ClipboardCheck, ScanLine,
  Database, BarChart3, Sparkles, Clock, TrendingUp, Users,
} from 'lucide-react';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return 'Teacher';
    return JSON.parse(atob(token.split('.')[1])).fullName || 'Teacher';
  } catch { return 'Teacher'; }
}

export default function TeacherDashboard() {
  const [userName, setUserName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setUserName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);

  const quickStats = [
    { label: 'Câu hỏi đã tạo',       icon: Database, color: 'text-blue-600' },
    { label: 'Bài kiểm tra được tạo', icon: FileText,  color: 'text-purple-600' },
    { label: 'Học sinh được chấm điểm', icon: Users,   color: 'text-green-600' },
    { label: 'Thời gian tiết kiệm (giờ)', icon: Clock, color: 'text-orange-600' },
  ];

  const aiTools = [
    { title: 'Giáo Án Của Tôi',           description: 'Quản lý các giáo án bạn đã tạo hoặc lưu',                     icon: BookOpen,      href: '/teacher/lesson-plans', color: 'bg-indigo-500' },
    { title: 'Lập kế hoạch bài học AI',   description: 'Tạo giáo án toàn diện với sự hỗ trợ của AI',                  icon: Sparkles,      href: '/lesson-planner',   color: 'bg-blue-500' },
    { title: 'Người tạo bài tập',          description: 'Tạo bài tập phù hợp với chương trình giảng dạy',              icon: ClipboardCheck, href: '/exercise-creator', color: 'bg-green-500' },
    { title: 'Trình tạo bài kiểm tra',     description: 'Tạo bài kiểm tra trắc nghiệm nhiều biến thể',                icon: FileText,      href: '/exam-generator',   color: 'bg-purple-500' },
    { title: 'Chấm điểm OCR',              description: 'Tự động chấm điểm bài làm bằng AI nhận dạng hình ảnh',        icon: ScanLine,      href: '/ocr-grading',      color: 'bg-orange-500' },
    { title: 'Ngân hàng câu hỏi',          description: 'Quản lý và tổ chức kho câu hỏi của bạn',                      icon: Database,      href: '/question-bank',    color: 'bg-pink-500' },
    { title: 'Kết quả học sinh',            description: 'Xem phân tích và theo dõi tiến độ học sinh',                  icon: BarChart3,     href: '/student-results',  color: 'bg-cyan-500' },
  ];

  return (
    <DashboardLayout role="teacher" userName={userName}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {userName}! 👋
          </h1>
          <p className="text-gray-600">Đây là những gì đang xảy ra với các lớp học của bạn ngày hôm nay</p>
        </div>

        {/* Stats — chờ API thật */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
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

        {/* AI Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Trợ giảng được hỗ trợ bởi AI</h3>
                <p className="text-blue-100 mb-4">
                  Tiết kiệm tới 10 giờ mỗi tuần với các công cụ thông minh được hỗ trợ bởi Gemini AI.
                </p>
                <Button variant="secondary" size="sm">Tìm hiểu thêm</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Công cụ giảng dạy AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool) => (
              <Link key={tool.title} to={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start group-hover:bg-gray-100">
                      Mở công cụ →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity — placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt Động Gần Đây</CardTitle>
            <CardDescription>Các thao tác mới nhất của bạn trên PlanbookAI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Chưa có hoạt động nào gần đây</p>
              <p className="text-xs text-gray-400">Bắt đầu sử dụng các công cụ để thấy lịch sử tại đây</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
