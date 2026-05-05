import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  FileCheck,
  Loader2,
  XCircle,
  History,
  Eye,
  X,
  Plus,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { promptApi, type PromptTemplate } from "../api/promptApi";
import {
  formatPromptContentForDisplay,
  getPromptNameLabel,
  getPromptTypeLabel,
} from "../utils/promptDisplay";
import { getFullNameFromToken } from "../utils/jwt";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

type LessonPlan = {
  id: number;
  title: string;
  content?: string;
  topic?: { title?: string; name?: string };
  staffId?: number;
  status?: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
};

type ManagerPackage = {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  usersCount: number;
  isActive: boolean;
  highlight: boolean;
};

type PackageEditor = {
  isNew: boolean;
  pkg: ManagerPackage;
};

type PackageToast = {
  msg: string;
  type: "success" | "warn" | "error";
};

type RecentOrder = {
  id: string;
  subscriptionId: number;
  user: string;
  pkg: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  rawStatus?: string;
};

type PackageApiDto = {
  id: number;
  name: string;
  price: number | string;
  durationDays: number;
  description?: string;
  active?: boolean;
  highlight?: boolean;
};

type SubscriptionApiDto = {
  id: number;
  userId: number;
  packageId: number;
  packageName: string;
  packagePrice?: number | string;
  status: string;
};

const INITIAL_PACKAGES: ManagerPackage[] = [
  {
    id: 1,
    name: "Plus",
    price: 99000,
    duration: 30,
    description: "Gói cá nhân cho giáo viên muốn sử dụng AI hàng ngày",
    features: ["Tạo giáo án AI 50 lần mỗi tháng", "Tạo đề thi và bài tập cơ bản", "Lưu trữ giáo án và đề thi đã tạo"],
    usersCount: 128,
    isActive: true,
    highlight: false,
  },
  {
    id: 2,
    name: "Team",
    price: 299000,
    duration: 30,
    description: "Gói cho tổ chuyên môn hoặc nhóm giáo viên",
    features: ["Dùng chung tài nguyên", "Quản lý thành viên", "Chia sẻ giáo án và đề thi", "Báo cáo nhóm"],
    usersCount: 42,
    isActive: true,
    highlight: true,
  },
  {
    id: 3,
    name: "Pro",
    price: 499000,
    duration: 30,
    description: "Gói nâng cao cho giáo viên cần sử dụng đầy đủ công cụ AI",
    features: ["AI không giới hạn", "Chấm điểm OCR nâng cao", "Báo cáo học sinh", "Ưu tiên xử lý"],
    usersCount: 12,
    isActive: true,
    highlight: false,
  },
];

const RECENT_ORDERS: RecentOrder[] = [
  { id: "ORD-2026-0421", subscriptionId: 0, user: "Nguyễn Thị Lan", pkg: "Plus", amount: 99000, status: "SUCCESS" },
  { id: "ORD-2026-0420", subscriptionId: 0, user: "Trần Văn Minh", pkg: "Pro", amount: 499000, status: "SUCCESS" },
  { id: "ORD-2026-0419", subscriptionId: 0, user: "Lê Thị Hoa", pkg: "Team", amount: 299000, status: "SUCCESS" },
  { id: "ORD-2026-0418", subscriptionId: 0, user: "Phạm Đức Long", pkg: "Plus", amount: 99000, status: "PENDING" },
];

function formatCurrency(value: number) {
  if (value === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function useRealUserName() {
  const [name, setName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => {
      if (e.detail?.fullName) setName(e.detail.fullName);
    };
    window.addEventListener("profileUpdated", h);
    return () => window.removeEventListener("profileUpdated", h);
  }, []);
  return name;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3" /> Đã duyệt
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" /> Từ chối
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
      <Clock className="w-3 h-3" /> Chờ duyệt
    </span>
  );
}

function formatLessonPlanContent(content?: string) {
  if (!content) {
    return "Không có nội dung chi tiết.";
  }

  try {
    const parsed = JSON.parse(content);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (!parsed || typeof parsed !== "object") {
      return String(parsed ?? "");
    }

    const lines: string[] = [];

    if (parsed.title) lines.push(`Tiêu đề: ${parsed.title}`);
    if (parsed.topic) lines.push(`Bài học: ${parsed.topic}`);
    if (parsed.grade) lines.push(`Khối lớp: ${parsed.grade}`);
    if (parsed.duration || parsed.durationMinutes) {
      lines.push(`Thời lượng: ${parsed.duration || parsed.durationMinutes} phút`);
    }

    if (Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
      lines.push("");
      lines.push("Mục tiêu:");
      parsed.objectives.forEach((item: string, index: number) => lines.push(`${index + 1}. ${item}`));
    }

    if (Array.isArray(parsed.activities) && parsed.activities.length > 0) {
      lines.push("");
      lines.push("Hoạt động dạy học:");
      parsed.activities.forEach((item: any, index: number) => {
        const time = item?.time ? ` (${item.time} phút)` : "";
        const name = item?.activity || item?.title || `Hoạt động ${index + 1}`;
        lines.push(`${index + 1}. ${name}${time}`);
        if (item?.description) {
          lines.push(`   ${item.description}`);
        }
      });
    }

    if (parsed.assessment) {
      lines.push("");
      lines.push(`Danh gia: ${parsed.assessment}`);
    }

    if (parsed.homework) {
      lines.push("");
      lines.push(`Bai tap: ${parsed.homework}`);
    }

    if (parsed.notes) {
      lines.push("");
      lines.push(`Ghi chu: ${parsed.notes}`);
    }

    return lines.join("\n").trim() || JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

export default function ManagerDashboard() {
  const realName = useRealUserName();

  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [pendingPlans, setPendingPlans] = useState<LessonPlan[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [rejectingPlan, setRejectingPlan] = useState<LessonPlan | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [historyPlans, setHistoryPlans] = useState<LessonPlan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [pendingPrompts, setPendingPrompts] = useState<PromptTemplate[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  const [packages, setPackages] = useState<ManagerPackage[]>(INITIAL_PACKAGES);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(RECENT_ORDERS);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageEditor, setPackageEditor] = useState<PackageEditor | null>(null);
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageDeleteTarget, setPackageDeleteTarget] = useState<ManagerPackage | null>(null);
  const [packageToast, setPackageToast] = useState<PackageToast | null>(null);

  const activePackageCount = packages.filter((pkg) => pkg.isActive).length;
  const totalOrders = recentOrders.length;

  const showPackageToast = (msg: string, type: PackageToast["type"] = "success") => {
    setPackageToast({ msg, type });
    setTimeout(() => setPackageToast(null), 3000);
  };

  const fetchPending = (showLoading = true) => {
    if (showLoading) setLoadingPending(true);
    axiosClient
      .get("/sample-lesson-plans/review/pending")
      .then((data: any) => setPendingPlans(Array.isArray(data) ? data : []))
      .catch(() => setPendingPlans([]))
      .finally(() => {
        if (showLoading) setLoadingPending(false);
      });
  };

  const fetchPendingPrompts = (showLoading = true) => {
    if (showLoading) setLoadingPrompts(true);
    promptApi
      .getPending()
      .then((items) => setPendingPrompts(Array.isArray(items) ? items : []))
      .catch(() => setPendingPrompts([]))
      .finally(() => {
        if (showLoading) setLoadingPrompts(false);
      });
  };

  const fetchHistory = () => {
    setLoadingHistory(true);
    axiosClient
      .get("/sample-lesson-plans/review/history")
      .then((data: any) => {
        setHistoryPlans(Array.isArray(data) ? data : []);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryPlans([]))
      .finally(() => setLoadingHistory(false));
  };

  const fetchPackageData = async () => {
    setLoadingPackages(true);
    try {
      const [packageRes, subscriptionRes] = await Promise.all([
        axiosClient.get("/packages"),
        axiosClient.get("/subscriptions"),
      ]);

      const packageList: PackageApiDto[] = Array.isArray(packageRes) ? packageRes : [];
      const subscriptionList: SubscriptionApiDto[] = Array.isArray(subscriptionRes) ? subscriptionRes : [];

      setPackages(packageList.map((pkg) => {
        const usersCount = subscriptionList.filter((sub) => sub.packageId === pkg.id).length;
        const description = pkg.description || "";
        return {
          id: pkg.id,
          name: pkg.name,
          price: Number(pkg.price || 0),
          duration: pkg.durationDays,
          description,
          features: description ? [description] : ["Chua co mo ta"],
          usersCount,
          isActive: pkg.active !== false,
          highlight: pkg.highlight === true,
        };
      }));

      setRecentOrders(subscriptionList
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(0, 8)
        .map((order) => ({
          id: `SUB-${order.id}`,
          subscriptionId: order.id,
          user: `User #${order.userId}`,
          pkg: order.packageName,
          amount: Number(order.packagePrice || 0),
          status: order.status === "ACTIVE" ? "SUCCESS" : order.status === "PENDING" ? "PENDING" : "FAILED",
          rawStatus: order.status,
        })));
    } catch {
      showPackageToast("Không tải được dữ liệu gói cước, đang sử dụng dữ liệu tạm", "warn");
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchPendingPrompts();
    fetchPackageData();

    const handleFirebaseNotification = (event: Event) => {
      const payload = (event as CustomEvent<any>).detail;
      const type = payload?.data?.type;
      const contentKind = payload?.data?.contentKind;
      if (type === "CONTENT_SUBMITTED") {
        if (!contentKind || contentKind === "LESSON_PLAN") fetchPending(false);
        if (!contentKind || contentKind === "PROMPT") fetchPendingPrompts(false);
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPending(false);
        fetchPendingPrompts(false);
      }
    }, 5000);

    window.addEventListener("firebaseNotificationReceived", handleFirebaseNotification as EventListener);
    return () => {
      window.removeEventListener("firebaseNotificationReceived", handleFirebaseNotification as EventListener);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "history" && !historyLoaded) fetchHistory();
  }, [activeTab, historyLoaded]);

  const handleApprove = async (id: number) => {
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/sample-lesson-plans/review/${id}/approve`, { reviewNote: "Duyệt bài" });
      setPendingPlans((prev) => prev.filter((item) => item.id !== id));
      setActionMsg("Đã duyệt giáo án");
      setTimeout(() => setActionMsg(""), 3000);
      setHistoryLoaded(false);
      setSelectedPlan(null);
    } catch {
      setActionMsg("Lỗi khi duyệt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectDialog = (plan: LessonPlan) => {
    setRejectingPlan(plan);
    setRejectReason("");
    setRejectReasonError("");
  };

  const closeRejectDialog = () => {
    if (isSubmitting) return;
    setRejectingPlan(null);
    setRejectReason("");
    setRejectReasonError("");
  };

  const handleReject = async () => {
    if (!rejectingPlan) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectReasonError("Cần nhập lý do từ chối để Staff biết cần sửa gì.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosClient.put(`/sample-lesson-plans/review/${rejectingPlan.id}/reject`, { reviewNote: reason });
      setPendingPlans((prev) => prev.filter((item) => item.id !== rejectingPlan.id));
      setActionMsg("Đã từ chối giáo án");
      setTimeout(() => setActionMsg(""), 3000);
      setHistoryLoaded(false);
      setSelectedPlan(null);
      setRejectingPlan(null);
      setRejectReason("");
      setRejectReasonError("");
    } catch {
      setActionMsg("Lỗi khi từ chối");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewPrompt = async (id: number, approved: boolean) => {
    try {
      if (approved) {
        await promptApi.approve(id, "Duyệt mẫu lời nhắc");
      } else {
        await promptApi.reject(id, "Nội dung prompt cần chỉnh sửa");
      }
      setActionMsg(approved ? "Đã duyệt mẫu lời nhắc" : "Đã từ chối mẫu lời nhắc");
      setTimeout(() => setActionMsg(""), 3000);
      fetchPendingPrompts();
    } catch {
      setActionMsg("Lỗi khi duyệt mẫu lời nhắc");
      setTimeout(() => setActionMsg(""), 3000);
    }
  };

  const openCreatePackage = () => {
    setPackageEditor({
      isNew: true,
      pkg: {
        id: 0,
        name: "",
        price: 0,
        duration: 30,
        description: "",
        features: [""],
        usersCount: 0,
        isActive: true,
        highlight: false,
      },
    });
  };

  const openEditPackage = (pkg: ManagerPackage) => {
    setPackageEditor({
      isNew: false,
      pkg: { ...pkg, features: [...pkg.features] },
    });
  };

  const updatePackageEditor = (updater: (pkg: ManagerPackage) => ManagerPackage) => {
    setPackageEditor((prev) => {
      if (!prev) return prev;
      return { ...prev, pkg: updater(prev.pkg) };
    });
  };

  const updatePackageFeature = (index: number, value: string) => {
    updatePackageEditor((pkg) => ({
      ...pkg,
      features: pkg.features.map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const addPackageFeature = () => {
    updatePackageEditor((pkg) => ({ ...pkg, features: [...pkg.features, ""] }));
  };

  const removePackageFeature = (index: number) => {
    updatePackageEditor((pkg) => ({
      ...pkg,
      features: pkg.features.filter((_, idx) => idx !== index),
    }));
  };

  const savePackage = async () => {
    if (!packageEditor) return;
    const normalizedName = packageEditor.pkg.name.trim();
    if (!normalizedName) {
      showPackageToast("Tên gói không được để trống", "error");
      return;
    }

    setPackageSaving(true);
    try {
      const cleanedFeatures = packageEditor.pkg.features.map((item) => item.trim()).filter(Boolean);
      const normalizedPackage: ManagerPackage = {
        ...packageEditor.pkg,
        name: normalizedName,
        description: packageEditor.pkg.description.trim(),
        features: cleanedFeatures.length > 0 ? cleanedFeatures : ["Chưa có tính năng"],
      };

      const payload = {
        name: normalizedPackage.name,
        price: normalizedPackage.price,
        durationDays: normalizedPackage.duration,
        description: normalizedPackage.description || normalizedPackage.features.join("; "),
        active: normalizedPackage.isActive,
        highlight: normalizedPackage.highlight,
      };

      if (packageEditor.isNew) {
        await axiosClient.post("/packages", payload);
      } else {
        await axiosClient.put(`/packages/${normalizedPackage.id}`, payload);
      }

      showPackageToast(packageEditor.isNew ? "Đã tạo gói mới" : "Đã cập nhật gói");
      setPackageEditor(null);
      await fetchPackageData();
    } catch {
      showPackageToast("Lỗi khi lưu gói cước", "error");
    } finally {
      setPackageSaving(false);
    }
  };

  const togglePackageActive = async (id: number) => {
    const target = packages.find((item) => item.id === id);
    if (!target) return;

    try {
      await axiosClient.put(`/packages/${id}`, {
        name: target.name,
        price: target.price,
        durationDays: target.duration,
        description: target.description,
        active: !target.isActive,
        highlight: target.highlight,
      });
      showPackageToast("Đã cập nhật trạng thái gói", "warn");
      await fetchPackageData();
    } catch {
      showPackageToast("Lỗi khi cập nhật trạng thái gói", "error");
    }
  };

  const deletePackage = async () => {
    if (!packageDeleteTarget) return;
    try {
      await axiosClient.delete(`/packages/${packageDeleteTarget.id}`);
      showPackageToast(`Đã tắt gói ${packageDeleteTarget.name}`, "warn");
      setPackageDeleteTarget(null);
      await fetchPackageData();
    } catch {
      showPackageToast("Lỗi khi xóa gói", "error");
    }
  };

  const reviewSubscription = async (subscriptionId: number, approved: boolean) => {
    if (!subscriptionId) return;

    try {
      await axiosClient.put(`/subscriptions/${subscriptionId}/${approved ? "approve" : "reject"}`);
      showPackageToast(approved ? "Đã kích hoạt đăng ký" : "Đã từ chối đăng ký", approved ? "success" : "warn");
      await fetchPackageData();
    } catch {
      showPackageToast("Lỗi khi xử lý đăng ký", "error");
    }
  };

  return (
    <DashboardLayout role="manager" userName={realName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển Manager</h1>
          <p className="text-gray-600">Quản lý gói cước, đơn hàng và duyệt nội dung</p>
        </div>

        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlan.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedPlan.topic?.title || selectedPlan.topic?.name) && `Chủ đề: ${selectedPlan.topic?.title || selectedPlan.topic?.name} · `}
                    Người tạo (Staff ID): {selectedPlan.staffId}
                  </p>
                </div>
                <button
                  onClick={() => !isSubmitting && setSelectedPlan(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 border-b pb-3 mb-4">Nội dung giáo án</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {formatLessonPlanContent(selectedPlan.content)}
                  </pre>
                </div>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedPlan(null)} disabled={isSubmitting}>
                  Đóng
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => openRejectDialog(selectedPlan)}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(selectedPlan.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Duyệt bài
                </Button>
              </div>
            </div>
          </div>
        )}

        {rejectingPlan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Lý do từ chối</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Gửi phản hồi để Staff biết cần chỉnh sửa giáo án "{rejectingPlan.title}".
                </p>
              </div>
              <div className="space-y-2 px-6 py-4">
                <Textarea
                  value={rejectReason}
                  onChange={(event) => {
                    setRejectReason(event.target.value);
                    if (rejectReasonError) setRejectReasonError("");
                  }}
                  placeholder="Ví dụ: Nội dung hoạt động chưa rõ, cần bổ sung mục tiêu và cách đánh giá..."
                  className="min-h-32"
                  disabled={isSubmitting}
                />
                {rejectReasonError ? <p className="text-sm text-red-600">{rejectReasonError}</p> : null}
              </div>
              <div className="flex justify-end gap-2 border-t px-6 py-4">
                <Button variant="outline" onClick={closeRejectDialog} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleReject} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          </div>
        )}

        {packageEditor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{packageEditor.isNew ? "Tạo gói mới" : "Cập nhật gói"}</h2>
                <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500" onClick={() => setPackageEditor(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={packageEditor.pkg.name}
                      onChange={(e) => updatePackageEditor((pkg) => ({ ...pkg, name: e.target.value }))}
                      placeholder="VD: Pro AI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND / 30 ngày)</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={packageEditor.pkg.price}
                      onChange={(e) => updatePackageEditor((pkg) => ({ ...pkg, price: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    value={packageEditor.pkg.description}
                    onChange={(e) => updatePackageEditor((pkg) => ({ ...pkg, description: e.target.value }))}
                    placeholder="Mô tả ngắn cho gói"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Tính năng</label>
                    <Button type="button" variant="outline" size="sm" onClick={addPackageFeature}>
                      <Plus className="w-4 h-4 mr-1" /> Thêm dòng
                    </Button>
                  </div>
                  {packageEditor.pkg.features.map((feature, index) => (
                    <div key={`feature-${index}`} className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={feature}
                        onChange={(e) => updatePackageFeature(index, e.target.value)}
                        placeholder="Nhập tính năng"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => removePackageFeature(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={packageEditor.pkg.highlight}
                      onChange={(e) => updatePackageEditor((pkg) => ({ ...pkg, highlight: e.target.checked }))}
                    />
                    Đánh dấu nổi bật
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={packageEditor.pkg.isActive}
                      onChange={(e) => updatePackageEditor((pkg) => ({ ...pkg, isActive: e.target.checked }))}
                    />
                    Đang kích hoạt
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPackageEditor(null)} disabled={packageSaving}>
                  Hủy
                </Button>
                <Button type="button" onClick={savePackage} disabled={packageSaving}>
                  {packageSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Lưu gói
                </Button>
              </div>
            </div>
          </div>
        )}

        {packageDeleteTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa gói đăng ký</h3>
              <p className="text-sm text-gray-600 mb-6">
                Bạn chắc chắn muốn xóa gói <span className="font-semibold">{packageDeleteTarget.name}</span>?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPackageDeleteTarget(null)}>
                  Hủy
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={deletePackage}>
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}

        {actionMsg && <div className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg w-fit shadow-lg">{actionMsg}</div>}

        {packageToast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm shadow-lg border ${packageToast.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : packageToast.type === "warn"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}
          >
            {packageToast.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-700">{loadingPackages ? "..." : activePackageCount}</span>
              </div>
              <p className="text-sm text-gray-600">Gói đang kích hoạt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">{loadingPackages ? "..." : totalOrders}</span>
              </div>
              <p className="text-sm text-gray-600">Đơn hàng gần đây</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-700">{loadingPending ? "..." : pendingPlans.length}</span>
              </div>
              <p className="text-sm text-gray-600">Giáo án chờ duyệt</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-600" />
                  Duyệt giáo án
                </CardTitle>
                <CardDescription>Xem xét nội dung do staff gửi lên</CardDescription>
              </div>
              {!loadingPending && pendingPlans.length > 0 && activeTab === "pending" && (
                <Badge className="bg-yellow-100 text-yellow-700">{pendingPlans.length} chờ duyệt</Badge>
              )}
            </div>

            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "pending"
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Clock className="w-4 h-4" />
                Chờ duyệt
                {!loadingPending && pendingPlans.length > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingPlans.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "history"
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <History className="w-4 h-4" />
                Lịch sử
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {activeTab === "pending" &&
              (loadingPending ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
                </div>
              ) : pendingPlans.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Không có giáo án chờ duyệt</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                          <FileCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{plan.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {(plan.topic?.title || plan.topic?.name) && `Bai: ${plan.topic?.title || plan.topic?.name}`}
                            {plan.staffId && ` · Staff ID: ${plan.staffId}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <Button
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-0"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Xem và duyệt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "history" &&
              (loadingHistory ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải lịch sử...
                </div>
              ) : historyPlans.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Chưa có giáo án đã xử lý</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${plan.status === "APPROVED" ? "bg-green-100" : "bg-red-100"}`}>
                          <FileCheck className={`w-5 h-5 ${plan.status === "APPROVED" ? "text-green-600" : "text-red-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{plan.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {(plan.topic?.title || plan.topic?.name) && `Bai: ${plan.topic?.title || plan.topic?.name}`}
                            {plan.staffId && ` · Staff ID: ${plan.staffId}`}
                            {plan.reviewedAt && ` · ${new Date(plan.reviewedAt).toLocaleDateString("vi-VN")}`}
                          </p>
                          {plan.reviewNote && <p className="text-xs text-gray-400 mt-1 italic">"{plan.reviewNote}"</p>}
                        </div>
                      </div>
                      <div className="ml-4 shrink-0">
                        <StatusBadge status={plan.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duyệt mẫu giáo án AI</CardTitle>
            <CardDescription>Prompt do Staff tạo hoặc chỉnh sửa trước khi được dùng cho Gemini</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPrompts ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...
              </div>
            ) : pendingPrompts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Không có mẫu giáo án chờ duyệt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPrompts.map((prompt) => (
                  <div key={prompt.id} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline">{getPromptNameLabel(prompt.name)}</Badge>
                          <Badge variant="outline">{getPromptTypeLabel(prompt.type)}</Badge>
                          <Badge>v{prompt.version}</Badge>
                        </div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white border rounded-lg p-3 max-h-44 overflow-y-auto">
                          {formatPromptContentForDisplay(prompt.content, prompt.name)}
                        </pre>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReviewPrompt(prompt.id, true)}>
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReviewPrompt(prompt.id, false)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Quản lý gói cước
                  </CardTitle>
                  <CardDescription>Thêm, sửa, bật/tắt và xóa gói đăng ký</CardDescription>
                </div>
                <Button size="sm" onClick={openCreatePackage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo gói
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative overflow-hidden rounded-xl border p-4 transition-all ${pkg.highlight
                        ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-purple-50 shadow-lg ring-2 ring-amber-100"
                        : "border-gray-200 bg-white"
                      }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          {pkg.highlight ? (
                            <Badge className="bg-amber-500 text-white shadow-sm">
                              <Sparkles className="mr-1 h-3 w-3" />
                              Nổi bật
                            </Badge>
                          ) : null}
                          <Badge className={pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {pkg.isActive ? "Đang kích hoạt" : "Tạm tắt"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{pkg.description || "Không có mô tả"}</p>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {formatCurrency(pkg.price)} / {pkg.duration} ngày · {pkg.usersCount} user
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pkg.features.map((feature, idx) => (
                            <span key={`${pkg.id}-${idx}`} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditPackage(pkg)}>
                          <Pencil className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => togglePackageActive(pkg.id)}>
                          {pkg.isActive ? "Tắt" : "Bật"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setPackageDeleteTarget(pkg)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Đơn hàng gần đây
              </CardTitle>
              <CardDescription>Danh sách giao dịch mới nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900">{order.id}</p>
                      <Badge
                        className={
                          order.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.user}</p>
                    <p className="text-sm text-gray-500">
                      {order.pkg} · <span className="font-medium text-gray-700">{formatCurrency(order.amount)}</span>
                    </p>
                    {order.status === "PENDING" && order.subscriptionId > 0 ? (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 px-3 text-xs text-white hover:bg-green-700"
                          onClick={() => reviewSubscription(order.subscriptionId, true)}
                        >
                          Duyệt thanh toán
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => reviewSubscription(order.subscriptionId, false)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    ) : null}
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


