import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileQuestion,
  FileText,
  Loader2,
  Pencil,
  PlusCircle,
  Settings2,
  Send,
  TrendingUp,
  Trash2,
  XCircle,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import * as questionApi from '../api/questionApi';
import { deleteSampleLessonPlan, submitForReview } from '../api/curriculumApi';
import { getAccessTokenPayload } from '../utils/jwt';

function getTokenPayload(): any {
  return getAccessTokenPayload();
}

function PlanStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Pencil className="w-3 h-3" /> },
    PENDING_REVIEW: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-3 h-3" /> },
    PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-3 h-3" /> },
    APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-600 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function unwrapQuestions(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

export default function StaffDashboard() {
  const payload = getTokenPayload();
  const realName = payload.fullName || '';
  const currentUserId = Number(payload.userId || 0);
  const navigate = useNavigate();
  const location = useLocation();

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [submittingPlanId, setSubmittingPlanId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    const state = location.state as { notice?: string } | null;
    if (state?.notice) {
      setNotice({ message: state.notice, type: 'ok' });
      navigate(location.pathname, { replace: true, state: null });
    }

    axiosClient.get('/sample-lesson-plans/my')
      .then((data: any) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));

    questionApi.getQuestions({ size: 200 })
      .then((data: any) => {
        const list = unwrapQuestions(data);
        const mine = currentUserId > 0 ? list.filter((q) => q.authorId === currentUserId) : list;
        setQuestionCount(mine.length);
      })
      .catch(() => setQuestionCount(0));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const totalPlans = plans.length;
  const approvedCount = plans.filter((p) => p.status === 'APPROVED').length;
  const pendingCount = plans.filter((p) => p.status === 'PENDING_REVIEW' || p.status === 'PENDING').length;
  const approvalRate = totalPlans > 0 ? `${Math.round((approvedCount / totalPlans) * 100)}%` : '—';

  const staffStats = useMemo(() => ([
    { label: 'Giáo án mẫu đã tạo', icon: FileText, color: 'text-blue-600', value: loadingPlans ? '...' : String(totalPlans) },
    { label: 'Đang chờ duyệt', icon: Clock, color: 'text-yellow-600', value: loadingPlans ? '...' : String(pendingCount) },
    { label: 'Đã duyệt', icon: CheckCircle, color: 'text-green-600', value: loadingPlans ? '...' : String(approvedCount) },
    { label: 'Tỉ lệ duyệt', icon: TrendingUp, color: 'text-teal-600', value: loadingPlans ? '...' : approvalRate },
    { label: 'Câu hỏi đã đóng góp', icon: FileQuestion, color: 'text-purple-600', value: String(questionCount) },
  ]), [approvedCount, approvalRate, loadingPlans, pendingCount, questionCount, totalPlans]);

  const handleOpenPlan = (plan: any) => {
    if (plan.status === 'DRAFT' || plan.status === 'REJECTED') {
      navigate(`/staff/lesson-editor?id=${plan.id}`);
    }
  };

  const handleSubmitPlan = async (event: React.MouseEvent, planId: number) => {
    event.stopPropagation();
    setSubmittingPlanId(planId);

    try {
      await submitForReview(planId);
      setPlans((current) =>
        current.map((plan) =>
          String(plan.id) === String(planId) ? { ...plan, status: 'PENDING_REVIEW' } : plan
        )
      );
      setNotice({ message: 'Đã gửi giáo án cho Manager (Quản lý) duyệt.', type: 'ok' });
    } catch {
      setNotice({ message: 'Gửi duyệt thất bại. Vui lòng thử lại.', type: 'err' });
    } finally {
      setSubmittingPlanId(null);
    }
  };

  const handleDeletePlan = async (event: React.MouseEvent, planId: number) => {
    event.stopPropagation();
    const ok = window.confirm('Xóa giáo án mẫu này khỏi danh sách của bạn?');
    if (!ok) return;

    try {
      await deleteSampleLessonPlan(planId);
      setPlans((current) => current.filter((plan) => String(plan.id) !== String(planId)));
      setNotice({ message: 'Đã xóa giáo án mẫu.', type: 'ok' });
    } catch (error: any) {
      setNotice({
        message: error?.response?.data?.message || error?.message || 'Xóa giáo án thất bại. Vui lòng thử lại.',
        type: 'err',
      });
    }
  };

  return (
    <DashboardLayout role="staff" userName={realName}>
      <div className="space-y-8">
        {notice && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            notice.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notice.message}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xin chào, {realName || 'Staff'}! 👋</h1>
          <p className="text-gray-600">Trang tạo giáo án mẫu, đóng góp câu hỏi và theo dõi chế độ duyệt</p>
        </div>

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

        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Soạn giáo án mẫu</h3>
                <p className="text-blue-100 text-sm">Môn học (Hóa) -&gt; Chương -&gt; Bài học</p>
              </div>
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 font-semibold gap-2 shrink-0">
                <Link to="/staff/lesson-editor">
                  <PlusCircle className="w-4 h-4" /> Soạn ngay
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Cấu trúc Môn học</h3>
                  <p className="text-emerald-100 text-sm">Quản lý Môn học - Chương - Bài học</p>
                </div>
                <Button asChild className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold gap-2 shrink-0">
                  <Link to="/staff/curriculum">
                    <BookOpen className="w-4 h-4" /> Quản lý
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0 text-white">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Ngân hàng câu hỏi</h3>
                  <p className="text-purple-100 text-sm">Tạo câu hỏi mẫu theo môn học, chủ đề và độ khó</p>
                </div>
                <Button asChild className="bg-white text-purple-700 hover:bg-purple-50 font-semibold gap-2 shrink-0">
                  <Link to="/staff/question-bank">
                    <FileQuestion className="w-4 h-4" /> Tạo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-slate-700 to-slate-900 border-0 text-white">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Mẫu lời nhắc AI</h3>
                  <p className="text-slate-200 text-sm">Tạo lời nhắc hướng dẫn AI sinh nội dung giáo dục</p>
                </div>
                <Button asChild className="bg-white text-slate-800 hover:bg-slate-100 font-semibold gap-2 shrink-0">
                  <Link to="/staff/prompts">
                    <Settings2 className="w-4 h-4" /> Nhắc AI
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Giáo án của tôi
            </CardTitle>
            <CardDescription>Bản nháp/ Bản bị từ chối có thể mở lại để chỉnh sửa và gửi duyệt lại</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPlans ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có giáo án nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => {
                  const editable = plan.status === 'DRAFT' || plan.status === 'REJECTED';
                  const isPending = plan.status === 'PENDING_REVIEW' || plan.status === 'PENDING';
                  const canDelete = plan.status !== 'APPROVED';
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleOpenPlan(plan)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        editable
                          ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm'
                          : 'cursor-default bg-gray-50/60 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 rounded-lg shrink-0 bg-gray-100">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{plan.title || 'Giao an chua dat ten'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(plan.topic?.title || plan.topic?.name) && `Bai: ${plan.topic?.title || plan.topic?.name}`}
                            {plan.createdAt && ` · ${new Date(plan.createdAt).toLocaleDateString('vi-VN')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <PlanStatusBadge status={plan.status} />
                        {editable && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-green-500 text-green-700 hover:bg-green-50 gap-1.5"
                              onClick={(event) => handleSubmitPlan(event, Number(plan.id))}
                              disabled={String(submittingPlanId) === String(plan.id)}
                            >
                              {String(submittingPlanId) === String(plan.id) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              Gửi duyệt
                            </Button>
                            <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                              <Pencil className="w-3 h-3" /> Chỉnh sửa
                            </span>
                          </>
                        )}
                        {isPending && (
                          <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                            <Send className="w-3 h-3" /> Đã gửi
                          </span>
                        )}
                        {canDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={(event) => handleDeletePlan(event, Number(plan.id))}
                            title="Xóa giáo án"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
