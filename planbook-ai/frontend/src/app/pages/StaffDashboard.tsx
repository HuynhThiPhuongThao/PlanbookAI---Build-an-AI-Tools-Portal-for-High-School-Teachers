import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  FileText, PlusCircle, CheckCircle, Clock,
  TrendingUp, Loader2, XCircle, Send, Pencil, BookOpen,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

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

/* ── badge theo trạng thái ── */
function PlanStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    DRAFT:          { label: 'Nháp',       className: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <Pencil      className="w-3 h-3" /> },
    // Backend dùng PENDING_REVIEW (không phải PENDING)
    PENDING_REVIEW: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock       className="w-3 h-3" /> },
    PENDING:        { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock       className="w-3 h-3" /> },
    APPROVED:       { label: 'Đã duyệt',  className: 'bg-green-100 text-green-700 border-green-200',    icon: <CheckCircle className="w-3 h-3" /> },
    REJECTED:       { label: 'Từ chối',   className: 'bg-red-100 text-red-600 border-red-200',          icon: <XCircle     className="w-3 h-3" /> },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function StaffDashboard() {
  const realName = useRealUserName();
  const navigate = useNavigate();

  const [plans, setPlans]           = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  /* ── load giáo án của staff này ── */
  useEffect(() => {
    axiosClient.get('/sample-lesson-plans/my')
      .then((data: any) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));
  }, []);

  /* click vào giáo án: DRAFT hoặc REJECTED → mở editor với id */
  const handleOpenPlan = (plan: any) => {
    if (plan.status === 'DRAFT' || plan.status === 'REJECTED') {
      navigate(`/staff/lesson-editor?id=${plan.id}`);
    }
    // PENDING_REVIEW / APPROVED → không cho sửa
  };

  /* stats từ danh sách thật — backend dùng PENDING_REVIEW */
  const totalPlans    = plans.length;
  const approvedCount = plans.filter(p => p.status === 'APPROVED').length;
  const pendingCount  = plans.filter(p => p.status === 'PENDING_REVIEW' || p.status === 'PENDING').length;
  const approvalRate  = totalPlans > 0
    ? `${Math.round((approvedCount / totalPlans) * 100)}%`
    : '—';

  const staffStats = [
    { label: 'Giáo án mẫu đã tạo',  icon: FileText,    color: 'text-blue-600',   value: loadingPlans ? '...' : String(totalPlans) },
    { label: 'Đang chờ duyệt',       icon: Clock,       color: 'text-yellow-600', value: loadingPlans ? '...' : String(pendingCount) },
    { label: 'Đã được duyệt',        icon: CheckCircle, color: 'text-green-600',  value: loadingPlans ? '...' : String(approvedCount) },
    { label: 'Tỉ lệ được duyệt',    icon: TrendingUp,  color: 'text-teal-600',   value: loadingPlans ? '...' : approvalRate },
    { label: 'Câu hỏi đã đóng góp',  icon: PlusCircle,  color: 'text-purple-600', value: '0 (Sắp ra mắt)' },
  ];

  return (
    <DashboardLayout role="staff" userName={realName}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân Viên</h1>
          <p className="text-gray-600">Soạn nội dung giáo án mẫu và theo dõi trạng thái phê duyệt</p>
        </div>

        {/* Stats thật từ API */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {staffStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-2xl font-bold text-gray-700">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tạo mới nhanh */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Tạo Giáo Án Mới</h3>
                <p className="text-blue-100 text-sm">Chọn môn → chương → bài, gọi AI gợi ý rồi gửi duyệt</p>
              </div>
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 font-semibold gap-2 shrink-0">
                <Link to="/staff/lesson-editor">
                  <PlusCircle className="w-4 h-4" /> Soạn ngay
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quản lý cấu trúc môn học */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Cấu Trúc Môn Học</h3>
                <p className="text-emerald-100 text-sm">Quản lý danh sách Môn học – Chương – Bài học trong hệ thống</p>
              </div>
              <Button asChild className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold gap-2 shrink-0">
                <Link to="/staff/curriculum">
                  <BookOpen className="w-4 h-4" /> Quản lý
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Giáo Án Của Tôi
                </CardTitle>
                <CardDescription>
                  Click vào giáo án <strong>Nháp</strong> hoặc <strong>Từ chối</strong> để chỉnh sửa và gửi lại
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPlans ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải giáo án...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Bạn chưa có giáo án nào</p>
                <p className="text-sm mt-1">Bấm "Soạn ngay" bên trên để tạo giáo án đầu tiên</p>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => {
                  const editable  = plan.status === 'DRAFT' || plan.status === 'REJECTED';
                  const isPending = plan.status === 'PENDING_REVIEW' || plan.status === 'PENDING';
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleOpenPlan(plan)}
                      title={editable ? 'Bấm để chỉnh sửa' : ''}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        editable
                          ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm'
                          : 'cursor-default bg-gray-50/60 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          plan.status === 'APPROVED'       ? 'bg-green-100'  :
                          plan.status === 'REJECTED'       ? 'bg-red-100'    :
                          isPending                        ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            plan.status === 'APPROVED'     ? 'text-green-600'  :
                            plan.status === 'REJECTED'     ? 'text-red-500'    :
                            isPending                      ? 'text-yellow-600' :
                            'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {plan.title || 'Giáo án chưa đặt tên'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {plan.topic?.name && `Bài: ${plan.topic.name}`}
                            {plan.createdAt && ` · ${new Date(plan.createdAt).toLocaleDateString('vi-VN')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <PlanStatusBadge status={plan.status} />
                        {editable && (
                          <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                            <Pencil className="w-3 h-3" /> Chỉnh sửa
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                            <Send className="w-3 h-3" /> Đã gửi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quy trình */}
        <Card>
          <CardHeader>
            <CardTitle>Quy Trình Làm Việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
              {[
                { step: '①', text: 'Chọn Môn → Chương → Bài' },
                { step: '②', text: 'Gọi AI gợi ý nội dung' },
                { step: '③', text: 'Chỉnh sửa & Lưu nháp' },
                { step: '④', text: 'Gửi Manager duyệt' },
              ].map(({ step, text }) => (
                <div key={step} className="flex flex-col items-center gap-2 bg-blue-50 px-3 py-4 rounded-xl text-center">
                  <span className="text-2xl font-bold text-blue-600">{step}</span>
                  <span className="text-gray-600 text-xs leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
