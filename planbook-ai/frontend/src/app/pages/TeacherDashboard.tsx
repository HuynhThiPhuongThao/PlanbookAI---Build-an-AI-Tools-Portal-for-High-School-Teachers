import React from 'react';
import { Link, useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen, FileText, ClipboardCheck, ScanLine,
  BarChart3, Sparkles, Clock, TrendingUp, Users, CreditCard, Loader2,
} from 'lucide-react';
import * as curriculumApi from '../api/curriculumApi';
import * as examApi from '../api/examApi';
import { getFullNameFromToken } from '../utils/jwt';

const GENERATED_QUESTION_COUNT_KEY = 'planbookai.generatedQuestionCount';

function getGeneratedQuestionCount() {
  return Number(localStorage.getItem(GENERATED_QUESTION_COUNT_KEY) || 0);
}

function getNameFromToken(): string {
  return getFullNameFromToken('Teacher');
}

interface DashboardStats {
  generatedQuestions: number | null;
  exams: number | null;
  lessonPlans: number | null;
  timeSaved: number | null;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState(getNameFromToken());
  const [stats, setStats] = React.useState<DashboardStats>({
    generatedQuestions: null, exams: null, lessonPlans: null, timeSaved: null,
  });
  const [recentPlans, setRecentPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setUserName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);

  React.useEffect(() => {
    void loadStats();
  }, []);

  React.useEffect(() => {
    const handleGeneratedQuestionsUpdated = () => {
      setStats((prev) => ({
        ...prev,
        generatedQuestions: getGeneratedQuestionCount(),
      }));
    };

    window.addEventListener('generatedQuestionsUpdated', handleGeneratedQuestionsUpdated);
    window.addEventListener('storage', handleGeneratedQuestionsUpdated);

    return () => {
      window.removeEventListener('generatedQuestionsUpdated', handleGeneratedQuestionsUpdated);
      window.removeEventListener('storage', handleGeneratedQuestionsUpdated);
    };
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [examsRes, lessonPlansRes] = await Promise.allSettled([
        examApi.getExams(),
        curriculumApi.getMyLessonPlans(),
      ]);

      // exams
      let examsCount = 0;
      let examQuestionCount = 0;
      if (examsRes.status === 'fulfilled') {
        const eData = examsRes.value as any;
        const exams = Array.isArray(eData) ? eData : [];
        examsCount = exams.length;
        examQuestionCount = exams.reduce((sum, exam) => {
          if (typeof exam.questionCount === 'number') return sum + exam.questionCount;
          if (Array.isArray(exam.questions)) return sum + exam.questions.length;
          if (typeof exam.questionIds === 'string' && exam.questionIds.trim()) {
            return sum + exam.questionIds.split(',').filter(Boolean).length;
          }
          return sum;
        }, 0);
      }

      // lesson plans
      let plansArr: any[] = [];
      if (lessonPlansRes.status === 'fulfilled') {
        plansArr = Array.isArray(lessonPlansRes.value) ? lessonPlansRes.value : [];
      }
      const plansCount = plansArr.length;
      const generatedQuestions = getGeneratedQuestionCount() + examQuestionCount;

      // time saved estimate: each lesson plan ≈ 2h, each exam ≈ 30min, each generated question ≈ 5min
      const timeSaved = Math.round(plansCount * 2 + examsCount * 0.5 + generatedQuestions * (5 / 60));

      setStats({ generatedQuestions, exams: examsCount, lessonPlans: plansCount, timeSaved });
      setRecentPlans(plansArr.slice(0, 4));
    } catch {
      /* keep nulls — UI shows "—" */
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { label: 'Câu hỏi đã tạo',           icon: ClipboardCheck, color: 'text-blue-600',   value: stats.generatedQuestions },
    { label: 'Bài kiểm tra được tạo',     icon: FileText,  color: 'text-purple-600', value: stats.exams },
    { label: 'Giáo án đã soạn',           icon: Users,     color: 'text-green-600',  value: stats.lessonPlans },
    { label: 'Thời gian tiết kiệm (giờ)', icon: Clock,     color: 'text-orange-600', value: stats.timeSaved },
  ];

  const aiTools = [
    { title: 'Giáo Án Của Tôi',           description: 'Quản lý các giáo án bạn đã tạo hoặc lưu',                   icon: BookOpen,      href: '/teacher/lesson-plans', color: 'bg-indigo-500' },
    { title: 'Lập kế hoạch bài học AI',   description: 'Tạo giáo án toàn diện với sự hỗ trợ của AI',                icon: Sparkles,      href: '/lesson-planner',       color: 'bg-blue-500'   },
    { title: 'Người tạo bài tập',          description: 'Tạo bài tập phù hợp với chương trình giảng dạy',            icon: ClipboardCheck, href: '/teacher/exercises',    color: 'bg-green-500'  },
    { title: 'Trình tạo bài kiểm tra',     description: 'Tạo bài kiểm tra trắc nghiệm nhiều biến thể',              icon: FileText,      href: '/teacher/exams',         color: 'bg-purple-500' },
    { title: 'Chấm điểm OCR',              description: 'Tự động chấm điểm bài làm bằng AI nhận dạng hình ảnh',    icon: ScanLine,      href: '/ocr-grading',          color: 'bg-orange-500' },
    { title: 'Kết quả học sinh',            description: 'Xem phân tích và theo dõi tiến độ học sinh',               icon: BarChart3,     href: '/student-results',      color: 'bg-cyan-500'   },
    { title: 'Gói dịch vụ',                 description: 'Đăng ký gói và theo dõi trạng thái sử dụng của tài khoản', icon: CreditCard,    href: '/teacher/packages',     color: 'bg-amber-500'  },
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value !== null ? stat.value.toLocaleString() : '—'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  {loading ? 'Đang tải...' : (stat.value !== null ? 'Cập nhật từ hệ thống' : 'Chưa có dữ liệu')}
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/lesson-planner')}
                >
                  Tạo giáo án ngay →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Công cụ giảng dạy AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiTools.map((tool) => (
              <Link key={tool.title} to={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <CardDescription className="text-xs">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start group-hover:bg-gray-100 text-sm">
                      Mở công cụ →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Lesson Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt Động Gần Đây</CardTitle>
            <CardDescription>Các giáo án bạn đã soạn gần nhất trên PlanbookAI</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
              </div>
            ) : recentPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có hoạt động nào gần đây</p>
                <p className="text-xs text-gray-400">Bắt đầu sử dụng các công cụ để thấy lịch sử tại đây</p>
                <Link to="/lesson-planner">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Sparkles className="w-4 h-4 mr-2" /> Tạo giáo án đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentPlans.map((plan) => (
                  <Link key={plan.id} to={`/teacher/lesson-plans/${plan.id}`} className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{plan.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {plan.topic?.title ? `Chủ đề: ${plan.topic.title}` : 'Giáo án đã lưu'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {plan.status === 'DONE' ? '✅ Hoàn thành' : '📝 Nháp'}
                    </span>
                  </Link>
                ))}
                {stats.lessonPlans && stats.lessonPlans > 4 && (
                  <div className="pt-3">
                    <Link to="/teacher/lesson-plans">
                      <Button variant="ghost" size="sm" className="w-full text-blue-600">
                        Xem tất cả {stats.lessonPlans} giáo án →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
