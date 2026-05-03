import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, CheckCircle, CreditCard, Loader2, Package,
  ReceiptText, X, Copy, Check, Banknote, ShieldCheck, RefreshCw,
} from 'lucide-react';
import * as packageApi from '../api/packageApi';
import { getFullNameFromToken } from '../utils/jwt';

/* ─── helpers ─────────────────────────────────────────────── */

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function formatCurrency(value: number | string | undefined) {
  const amount = Number(value || 0);
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getStatusBadge(status: string) {
  if (status === 'ACTIVE') return 'bg-green-100 text-green-700';
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
  if (status === 'REJECTED') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

function getStatusLabel(status: string) {
  if (status === 'ACTIVE') return '✅ Đang hoạt động';
  if (status === 'PENDING') return '⏳ Chờ xác nhận';
  if (status === 'REJECTED') return '❌ Bị từ chối';
  if (status === 'EXPIRED') return '⌛ Hết hạn';
  if (status === 'CANCELLED') return '🚫 Đã huỷ';
  return status;
}

function isPaidPackage(pkg: packageApi.PackageItem) {
  return pkg.active !== false && pkg.name?.toLowerCase() !== 'free' && Number(pkg.price || 0) > 0;
}

function getPackageFeatures(name: string) {
  switch (name.toLowerCase()) {
    case 'plus':
      return [
        'Tạo giáo án AI tối đa 50 lần mỗi tháng',
        'Tạo đề thi và bài tập cơ bản',
        'Lưu trữ giáo án và đề thi đã tạo',
      ];
    case 'team':
      return [
        'Dùng chung tài nguyên cho nhóm giáo viên',
        'Quản lý thành viên và phân quyền nhóm',
        'Chia sẻ giáo án, đề thi và câu hỏi nội bộ',
      ];
    case 'pro':
      return [
        'Tạo giáo án, đề thi và bài tập không giới hạn',
        'Chấm điểm OCR nâng cao và xuất báo cáo',
        'Ưu tiên xử lý AI và hỗ trợ demo đầy đủ',
      ];
    default:
      return [
        'Tạo giáo án AI',
        'Tạo đề thi tự động',
        'Quản lý tài nguyên dạy học',
      ];
  }
}

const DEMO_TRANSFER_AMOUNT = 5000;
const DEMO_QR_IMAGE = '/payment/pr_bank.jpg';

function buildDemoVietQrUrl(transferNote: string) {
  const params = new URLSearchParams({
    amount: String(DEMO_TRANSFER_AMOUNT),
    addInfo: transferNote,
    accountName: 'LE VAN KHOI',
  });
  return `https://img.vietqr.io/image/MB-0329279225-compact2.png?${params.toString()}`;
}

/* ─── payment modal ───────────────────────────────────────── */

interface PaymentModalProps {
  pkg: packageApi.PackageItem;
  onSuccess: () => void;
  onClose: () => void;
}

type ModalStep = 'creating' | 'qr' | 'waiting' | 'done' | 'error';

interface CancelConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function CancelConfirmDialog({
  title,
  description,
  confirmLabel = 'Hủy đơn',
  isLoading = false,
  onConfirm,
  onClose,
}: CancelConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-red-50 p-2 text-red-600">
            <X className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Giữ lại
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ pkg, onSuccess, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<ModalStep>('creating');
  const [subId, setSubId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const transferNote = subId ? `PLANBOOK ${subId}` : '';
  const qrUrl = transferNote ? buildDemoVietQrUrl(transferNote) : DEMO_QR_IMAGE;

  // Step 1: auto-create subscription khi modal mở
  useEffect(() => {
    void createSubscription();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (subId && step === 'qr') {
      startPolling();
    }
  }, [subId, step]);

  const createSubscription = async () => {
    setStep('creating');
    try {
      const sub = await packageApi.subscribePackage(pkg.id, 'BANK_TRANSFER');
      setSubId(sub.id);
      setStep('qr');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tạo được đăng ký.');
      setStep('error');
    }
  };

  // Polling — check mỗi 3s xem subscription đã ACTIVE chưa (SePay tự detect)
  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      setPollCount((c) => c + 1);
      try {
        const list = await packageApi.getMySubscriptions();
        const found = list.find((s) => s.id === subId);
        if (found?.status === 'ACTIVE') {
          stopPolling();
          setStep('done');
        }
      } catch { /* ignore polling errors */ }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCancelOrder = async () => {
    stopPolling();
    if (!subId) {
      onClose();
      return;
    }

    setIsCancelling(true);
    try {
      await packageApi.cancelSubscription(subId);
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không hủy được đơn đăng ký.');
      setStep('error');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button
      type="button"
      onClick={() => copy(text, field)}
      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors shrink-0"
    >
      {copiedField === field ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  const bankRows = subId ? [
    { label: 'Ngân hàng', value: 'MB Bank', field: 'bank' },
    { label: 'Số tài khoản', value: '0329279225', field: 'acc' },
    { label: 'Chủ tài khoản', value: 'LE VAN KHOI', field: 'name' },
    { label: 'Số tiền demo', value: formatCurrency(DEMO_TRANSFER_AMOUNT), field: 'amount' },
    { label: 'Nội dung chuyển khoản ⚠️', value: transferNote,          field: 'note'   },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {showCancelConfirm ? (
        <CancelConfirmDialog
          title="Hủy đơn thanh toán?"
          description="Đơn đang chờ SePay xác nhận sẽ được hủy và bạn có thể tạo đơn mới sau."
          confirmLabel="Hủy đơn"
          isLoading={isCancelling}
          onConfirm={handleCancelOrder}
          onClose={() => setShowCancelConfirm(false)}
        />
      ) : null}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">Thanh toán qua ngân hàng</p>
              <p className="text-blue-200 text-xs">VietQR · SePay auto-detect</p>
            </div>
          </div>
          {step !== 'creating' && step !== 'waiting' && (
            <button
              type="button"
              onClick={step === 'qr' ? () => setShowCancelConfirm(true) : onClose}
              className="text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* ── Creating ── */}
          {step === 'creating' && (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">Đang khởi tạo đơn hàng...</p>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div className="py-6 space-y-4">
              <p className="text-red-600 text-center font-medium">{errorMsg}</p>
              <Button variant="outline" className="w-full" onClick={onClose}>Đóng</Button>
            </div>
          )}

          {/* ── QR ── */}
          {step === 'qr' && subId && (
            <>
              {/* Package info */}
              <div className="text-center mb-4">
                <p className="text-gray-500 text-xs mb-1">{pkg.name}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.price)}</p>
                <p className="text-xs text-gray-400">{pkg.durationDays} ngày · Chuyển khoản demo <strong className="text-blue-600">{formatCurrency(DEMO_TRANSFER_AMOUNT)}</strong></p>
              </div>

              {/* QR */}
              <div className="flex justify-center mb-4">
                <div className="border-4 border-blue-600 rounded-xl p-2 bg-white shadow-lg">
                  <img
                    src={qrUrl}
                    alt="VietQR"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        DEMO_QR_IMAGE;
                    }}
                  />
                </div>
              </div>

              {/* Bank details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm mb-4">
                {bankRows.map(({ label, value, field }) => (
                  <div key={field} className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 shrink-0 w-28 text-xs">{label}</span>
                    <div className="flex items-center gap-1 flex-1 justify-end">
                      <span className={`font-semibold text-gray-900 text-right truncate ${field === 'note' ? 'text-blue-700 font-bold' : ''}`}>
                        {value}
                      </span>
                      <CopyBtn text={value} field={field} />
                    </div>
                  </div>
                ))}
              </div>

              {/* note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-800">
                ⚠️ <strong>Nhập đúng nội dung chuyển khoản: <span className="text-blue-700">{transferNote}</span></strong> — SePay dùng mã này để xác nhận đơn hàng tự động.
              </div>

              <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm font-medium text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang tự động chờ SePay xác nhận giao dịch
                {pollCount > 0 && <span className="text-blue-500">({pollCount})</span>}
              </div>

              <Button
                variant="outline"
                className="mt-3 w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
              >
                {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                Hủy đơn thanh toán
              </Button>
            </>
          )}

          {/* ── Waiting (SePay polling) ── */}
          {step === 'waiting' && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
              <p className="font-semibold text-gray-900">Đang chờ SePay xác nhận...</p>
              <p className="text-gray-400 text-sm text-center">
                Hệ thống đang kiểm tra giao dịch{' '}
                <span className="font-mono text-blue-600">{transferNote}</span>
                <br />
                Kiểm tra lần {pollCount}...
              </p>
              <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => { stopPolling(); setStep('qr'); }}>
                Quay lại
              </Button>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 text-xl">Kích hoạt thành công! 🎉</p>
              <p className="text-gray-500 text-sm text-center">
                Gói <strong>{pkg.name}</strong> đã được kích hoạt.
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 mt-2"
                onClick={() => { onSuccess(); onClose(); }}
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Hoàn tất
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── main page ────────────────────────────────────────────── */

export default function TeacherPackages() {
  const userName = getNameFromToken();
  const [packages, setPackages] = useState<packageApi.PackageItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<packageApi.SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingPkg, setPayingPkg] = useState<packageApi.PackageItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancellingSubId, setCancellingSubId] = useState<number | null>(null);
  const [confirmCancelSubId, setConfirmCancelSubId] = useState<number | null>(null);

  const activePackageIds = useMemo(
    () =>
      new Set(
        subscriptions
          .filter((s) => s.status === 'ACTIVE' || s.status === 'PENDING')
          .map((s) => s.packageId),
      ),
    [subscriptions],
  );

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [pkgList, subList] = await Promise.all([
        packageApi.getPackages(),
        packageApi.getMySubscriptions(),
      ]);
      setPackages((Array.isArray(pkgList) ? pkgList : []).filter(isPaidPackage));
      setSubscriptions(Array.isArray(subList) ? subList : []);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const handleCancelSubscription = async (id: number) => {
    setCancellingSubId(id);
    setErrorMsg('');
    try {
      await packageApi.cancelSubscription(id);
      await loadData();
      setConfirmCancelSubId(null);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không hủy được đơn đăng ký.');
    } finally {
      setCancellingSubId(null);
    }
  };

  return (
    <DashboardLayout role="teacher" userName={userName}>
      {payingPkg && (
        <PaymentModal
          pkg={payingPkg}
          onSuccess={loadData}
          onClose={() => setPayingPkg(null)}
        />
      )}

      {confirmCancelSubId ? (
        <CancelConfirmDialog
          title="Hủy đơn đăng ký?"
          description="Đơn đang chờ thanh toán sẽ được hủy khỏi lịch sử chờ xác nhận."
          confirmLabel="Hủy đơn"
          isLoading={cancellingSubId === confirmCancelSubId}
          onConfirm={() => handleCancelSubscription(confirmCancelSubId)}
          onClose={() => setConfirmCancelSubId(null)}
        />
      ) : null}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/teacher">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gói dịch vụ</h1>
            <p className="text-gray-600">Thanh toán qua chuyển khoản — SePay tự xác nhận.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Package cards */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" /> Gói hiện có
                  </CardTitle>
                  <CardDescription>
                    Quét QR chuyển <strong>{formatCurrency(DEMO_TRANSFER_AMOUNT)}</strong> demo với đúng nội dung CK - SePay tự kích hoạt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {packages.length === 0 ? (
                    <p className="py-10 text-center text-gray-500">Chưa có gói nào. Liên hệ Admin.</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {packages.map((pkg) => {
                        const subscribed = activePackageIds.has(pkg.id);
                        const mySub = subscriptions.find(
                          (s) => s.packageId === pkg.id && (s.status === 'ACTIVE' || s.status === 'PENDING'),
                        );
                        const features = getPackageFeatures(pkg.name);
                        return (
                          <div
                            key={pkg.id}
                            className={`rounded-2xl border-2 p-5 transition-all ${
                              subscribed
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                                <p className="text-sm text-gray-500">{pkg.description || 'Không có mô tả'}</p>
                              </div>
                              {subscribed && (
                                <Badge className={getStatusBadge(mySub?.status || 'ACTIVE')}>
                                  {getStatusLabel(mySub?.status || 'ACTIVE')}
                                </Badge>
                              )}
                            </div>

                            <div className="mb-3">
                              <span className="text-2xl font-bold text-purple-700">{formatCurrency(pkg.price)}</span>
                              <span className="ml-1 text-sm text-gray-500">/ {pkg.durationDays} ngày</span>
                            </div>

                            <ul className="mb-4 space-y-1 text-sm text-gray-600">
                              {features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <Button
                              className={`w-full font-semibold ${
                                subscribed
                                  ? 'bg-gray-100 text-gray-500 cursor-default'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                              }`}
                              disabled={subscribed}
                              onClick={() => !subscribed && setPayingPkg(pkg)}
                            >
                              {subscribed ? (
                                <><ShieldCheck className="mr-2 h-4 w-4" /> {getStatusLabel(mySub?.status || 'ACTIVE')}</>
                              ) : (
                                <><CreditCard className="mr-2 h-4 w-4" /> Đăng ký & Thanh toán</>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SePay info */}
              <Card className="border-indigo-200 bg-indigo-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3 text-sm text-indigo-800">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Tích hợp SePay — auto-detect chuyển khoản</p>
                      <p className="text-indigo-700">
                        Hệ thống dùng SePay để tự động nhận diện giao dịch theo <em>nội dung chuyển khoản</em>.
                        Số tiền demo chỉ <strong>{formatCurrency(DEMO_TRANSFER_AMOUNT)}</strong> - kích hoạt ngay khi ngân hàng báo về.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-blue-600" /> Lịch sử đăng ký
                </CardTitle>
                <CardDescription>Các gói bạn đã đăng ký.</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">Chưa có đăng ký nào.</p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((item) => (
                      <div key={item.id} className="rounded-lg border p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 truncate">{item.packageName}</p>
                          <Badge className={`${getStatusBadge(item.status)} shrink-0 text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{formatCurrency(item.packagePrice)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
                          {' → '}
                          {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
                        </p>
                        {item.paymentMethod && (
                          <p className="text-xs text-gray-400 mt-0.5">💳 {item.paymentMethod}</p>
                        )}
                        {item.status === 'PENDING' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 h-8 w-full border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmCancelSubId(item.id)}
                            disabled={cancellingSubId === item.id}
                          >
                            {cancellingSubId === item.id ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="mr-2 h-3.5 w-3.5" />
                            )}
                            Hủy đơn
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
