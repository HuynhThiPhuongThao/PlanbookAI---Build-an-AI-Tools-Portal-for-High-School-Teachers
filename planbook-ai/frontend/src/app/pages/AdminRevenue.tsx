import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, TrendingUp, Package, AlertCircle, Loader2, ShoppingCart, DollarSign } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getFullNameFromToken } from '../utils/jwt';

type PackageDto = {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  durationDays: number;
  active?: boolean;
};

type SubscriptionDto = {
  id: number;
  userId: number;
  packageName: string;
  packagePrice?: number | string;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
};

type RevenueSummary = {
  totalPackages: number;
  activePackages: number;
  totalSubscriptions: number;
  pendingSubscriptions: number;
  activeSubscriptions: number;
  estimatedRevenue: number | string;
};

function getNameFromToken(): string {
  return getFullNameFromToken();
}

const fmt = (value: number | string) => {
  const n = Number(value || 0);
  return n === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export default function AdminRevenue() {
  const navigate = useNavigate();
  const userName = getNameFromToken();

  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceDown, setServiceDown] = useState(false);

  useEffect(() => {
    void loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const [packageList, subscriptionList, summaryData] = await Promise.all([
        axiosClient.get('/packages'),
        axiosClient.get('/subscriptions'),
        axiosClient.get('/packages/revenue-summary'),
      ]);

      setPackages(Array.isArray(packageList) ? packageList : []);
      setSubscriptions(Array.isArray(subscriptionList) ? subscriptionList : []);
      setSummary(summaryData as RevenueSummary);
      setServiceDown(false);
    } catch {
      setServiceDown(true);
    } finally {
      setLoading(false);
    }
  };

  const recentSubscriptions = useMemo(
    () => subscriptions.slice().sort((a, b) => b.id - a.id).slice(0, 8),
    [subscriptions],
  );

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Về lại bảng điều khiển
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Doanh thu & Gói dịch vụ</h1>
          <p className="text-gray-600 mt-1">Dữ liệu gói dịch vụ, đăng ký và doanh thu</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : serviceDown ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">Không gọi được package-service</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Kiểm tra container `package-service` và gateway route `/api/packages/**`, `/api/subscriptions/**`.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <Package className="h-8 w-8 text-purple-600" />
                    <span className="text-3xl font-bold text-purple-700">{summary?.activePackages || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">Gói đăng ký đang hoạt động</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-700">{summary?.totalSubscriptions || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">Đăng ký dịch vụ</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold text-green-700">{summary?.pendingSubscriptions || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">Đơn đăng ký chờ xử lý</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <DollarSign className="h-8 w-8 text-orange-600" />
                    <span className="text-xl font-bold text-orange-700">{fmt(summary?.estimatedRevenue || 0)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Doanh thu ước tính</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Danh sách gói dịch vụ
                </CardTitle>
                <CardDescription>Các gói dịch vụ hiện có</CardDescription>
              </CardHeader>
              <CardContent>
                {packages.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">Chưa có gói dịch vụ nào.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="rounded-xl border border-gray-200 p-4 transition hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                          <span className="font-bold text-purple-600">{fmt(pkg.price)}</span>
                        </div>
                        <p className="mb-3 text-sm text-gray-500">{pkg.description || 'Không có mô tả'}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Thời hạn: {pkg.durationDays} ngày</span>
                          <Badge className={pkg.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {pkg.active !== false ? 'Đang bán' : 'Đã tắt'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Đơn đăng ký gần đây</CardTitle>
                <CardDescription>Các đơn đăng ký mới nhất từ người dùng.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSubscriptions.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">Chưa có đơn đăng ký nào.</div>
                ) : (
                  <div className="space-y-3">
                    {recentSubscriptions.map((sub) => (
                      <div key={sub.id} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">SUB-{sub.id} · User #{sub.userId}</p>
                            <p className="text-sm text-gray-600">{sub.packageName} · {fmt(sub.packagePrice || 0)}</p>
                          </div>
                          <Badge className={sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : sub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
