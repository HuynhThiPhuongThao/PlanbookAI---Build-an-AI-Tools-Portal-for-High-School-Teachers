import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Package, ShoppingCart, Clock, CheckCircle, FileCheck,
  Loader2, XCircle, History,
} from 'lucide-react';
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

/* ── badge màu theo trạng thái ── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3" /> Đã duyệt
      </span>
    );
  if (status === 'REJECTED')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" /> Từ chối
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Clock className="w-3 h-3" /> Chờ duyệt
    </span>
  );
}

export default function ManagerDashboard() {
  const realName = useRealUserName();

  /* ── tab ── */
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  /* ── pending ── */
  const [pendingPlans, setPendingPlans] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  /* ── history ── */
  const [historyPlans, setHistoryPlans] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  /* ── firebase toast ── */
  const [fcmToast, setFcmToast] = useState<{ title: string; body: string } | null>(null);

  /* ── fetch pending ── */
  const fetchPending = () => {
    setLoadingPending(true);
    axiosClient.get('/sample-lesson-plans/review/pending')
      .then((data: any) => setPendingPlans(Array.isArray(data) ? data : []))
      .catch(() => setPendingPlans([]))
      .finally(() => setLoadingPending(false));
  };

  /* ── fetch history (lazy — chỉ load khi mở tab) ── */
  const fetchHistory = () => {
    setLoadingHistory(true);
    axiosClient.get('/sample-lesson-plans/review/history')
      .then((data: any) => {
        setHistoryPlans(Array.isArray(data) ? data : []);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryPlans([]))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchPending();

    // Firebase
    import('../firebase').then(({ requestPermission, listenForMessage }) => {
      requestPermission();
      listenForMessage((payload: any) => {
        if (payload?.notification) {
          setFcmToast({ title: payload.notification.title, body: payload.notification.body });
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(() => {});
          setTimeout(() => setFcmToast(null), 5000);
          fetchPending();
        }
      });
    }).catch(e => console.error('Lỗi khi tải Firebase:', e));
  }, []);

  /* Khi chuyển sang tab history lần đầu → load */
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded) fetchHistory();
  }, [activeTab]);

  /* ── approve / reject ── */
  const handleApprove = async (id: number) => {
    try {
      await axiosClient.post(`/sample-lesson-plans/review/${id}/approve`, { reviewNote: 'Duyệt bài' });
      setPendingPlans(p => p.filter(x => x.id !== id));
      setActionMsg('✅ Đã duyệt giáo án!');
      setTimeout(() => setActionMsg(''), 3000);
      // invalidate history cache
      setHistoryLoaded(false);
    } catch { setActionMsg('❌ Lỗi khi duyệt!'); }
  };

  const handleReject = async (id: number) => {
    try {
      await axiosClient.post(`/sample-lesson-plans/review/${id}/reject`, { reviewNote: 'Từ chối bài' });
      setPendingPlans(p => p.filter(x => x.id !== id));
      setActionMsg('🚫 Đã từ chối giáo án!');
      setTimeout(() => setActionMsg(''), 3000);
      setHistoryLoaded(false);
    } catch { setActionMsg('❌ Lỗi khi từ chối!'); }
  };

  return (
    <DashboardLayout role="manager" userName={realName}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Quản lý gói dịch vụ, đơn hàng và duyệt nội dung</p>
        </div>

        {/* Action Toast */}
        {actionMsg && (
          <div className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg w-fit shadow-lg">
            {actionMsg}
          </div>
        )}

        {/* Firebase Toast */}
        {fcmToast && (
          <div className="fixed top-20 right-4 z-50 bg-white border-l-4 border-orange-500 shadow-xl rounded-lg p-4 animate-bounce">
            <h3 className="font-bold text-orange-700 flex items-center">
              <span className="text-xl mr-2">🔔</span> {fcmToast.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{fcmToast.body}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-400">—</span>
              </div>
              <p className="text-sm text-gray-600">Gói dịch vụ đang hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-400">—</span>
              </div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-yellow-600">
                  {loadingPending ? '...' : pendingPlans.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Giáo án chờ duyệt</p>
            </CardContent>
          </Card>
        </div>

        {/* ── TAB DUYỆT GIÁO ÁN ── */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-600" />
                  Duyệt Giáo Án
                </CardTitle>
                <CardDescription>Xem xét và duyệt nội dung do Staff tạo</CardDescription>
              </div>
              {!loadingPending && pendingPlans.length > 0 && activeTab === 'pending' && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  {pendingPlans.length} chờ duyệt
                </Badge>
              )}
            </div>

            {/* Tab buttons */}
            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Chờ Duyệt
                {!loadingPending && pendingPlans.length > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingPlans.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <History className="w-4 h-4" />
                Lịch Sử
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">

            {/* ── Tab: Chờ duyệt ── */}
            {activeTab === 'pending' && (
              loadingPending ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
                </div>
              ) : pendingPlans.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Không có giáo án nào chờ duyệt</p>
                  <p className="text-sm mt-1">Khi Staff gửi giáo án, chúng sẽ hiện ở đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPlans.map((plan) => (
                    <div key={plan.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                          <FileCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{plan.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {plan.topic?.name && `Bài: ${plan.topic.name}`}
                            {plan.staffId && ` · Staff ID: ${plan.staffId}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <Button variant="outline" size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(plan.id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Từ chối
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(plan.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Tab: Lịch sử ── */}
            {activeTab === 'history' && (
              loadingHistory ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải lịch sử...
                </div>
              ) : historyPlans.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Chưa có giáo án nào được xử lý</p>
                  <p className="text-sm mt-1">Các giáo án đã duyệt hoặc từ chối sẽ lưu ở đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyPlans.map((plan) => (
                    <div key={plan.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          plan.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <FileCheck className={`w-5 h-5 ${
                            plan.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{plan.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {plan.topic?.name && `Bài: ${plan.topic.name}`}
                            {plan.staffId && ` · Staff ID: ${plan.staffId}`}
                            {plan.reviewedAt && ` · ${new Date(plan.reviewedAt).toLocaleDateString('vi-VN')}`}
                          </p>
                          {plan.reviewNote && (
                            <p className="text-xs text-gray-400 mt-1 italic">"{plan.reviewNote}"</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 shrink-0">
                        <StatusBadge status={plan.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gói Dịch Vụ</CardTitle>
                  <CardDescription>Quản lý các gói đăng ký</CardDescription>
                </div>
                <Button size="sm">
                  <Package className="w-4 h-4 mr-2" /> Thêm gói
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có dữ liệu gói dịch vụ</p>
                <p className="text-xs text-gray-400">Tính năng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Đơn Hàng Gần Đây</CardTitle>
                  <CardDescription>Các đơn đăng ký mới nhất</CardDescription>
                </div>
                <Button variant="outline" size="sm">Xem tất cả</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có đơn hàng nào</p>
                <p className="text-xs text-gray-400">Tính năng đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
