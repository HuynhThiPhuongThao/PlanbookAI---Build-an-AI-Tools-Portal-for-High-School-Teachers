import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Package, ShoppingCart, Clock, CheckCircle, FileCheck, Loader2,
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

export default function ManagerDashboard() {
  const realName = useRealUserName();
  const [pendingPlans, setPendingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    axiosClient.get('/sample-lesson-plans?status=PENDING')
      .then((data: any) => setPendingPlans(Array.isArray(data) ? data : []))
      .catch(() => setPendingPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await axiosClient.put(`/sample-lesson-plans/${id}/approve`);
      setPendingPlans(p => p.filter(x => x.id !== id));
      setActionMsg('Đã duyệt!'); setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('Lỗi khi duyệt!'); }
  };

  const handleReject = async (id: number) => {
    try {
      await axiosClient.put(`/sample-lesson-plans/${id}/reject`);
      setPendingPlans(p => p.filter(x => x.id !== id));
      setActionMsg('Đã từ chối!'); setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('Lỗi khi từ chối!'); }
  };

  return (
    <DashboardLayout role="manager" userName={realName}>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Quản lý gói dịch vụ, đơn hàng và duyệt nội dung</p>
        </div>

        {/* Toast */}
        {actionMsg && (
          <div className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg w-fit">
            {actionMsg}
          </div>
        )}

        {/* Thống kê — hiện số thật từ API (tạm để trống, chờ API) */}
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
                  {loading ? '...' : pendingPlans.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Giáo án chờ duyệt</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Content Approvals — DỮ LIỆU THẬT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-600" />
                  Giáo Án Chờ Duyệt
                </CardTitle>
                <CardDescription>Xem xét và duyệt nội dung do Staff tạo</CardDescription>
              </div>
              {!loading && pendingPlans.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  {pendingPlans.length} chờ duyệt
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
              </div>
            ) : pendingPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Không có giáo án nào chờ duyệt</p>
                <p className="text-sm">Khi Staff gửi giáo án, chúng sẽ hiện ở đây</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPlans.map((plan) => (
                  <div key={plan.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                      <FileCheck className="w-5 h-5 text-orange-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Giáo Án Mẫu</Badge>
                          <p className="font-medium text-gray-900 truncate">{plan.title}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {plan.topic?.name && `Bài: ${plan.topic.name}`}
                          {plan.staffId && ` • Staff ID: ${plan.staffId}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleReject(plan.id)}>
                        Từ chối
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(plan.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />Duyệt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Packages */}
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

          {/* Recent Orders */}
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
