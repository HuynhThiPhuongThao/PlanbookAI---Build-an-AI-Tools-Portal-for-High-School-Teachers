import { useState } from "react";

const PACKAGES = [
  {
    id: 1, name: "Free", price: 0, duration: 30,
    features: ["Tối đa 5 giáo án/tháng", "Ngân hàng câu hỏi hạn chế", "Xuất PDF cơ bản"],
    color: "#64748b", highlight: false,
  },
  {
    id: 2, name: "Pro AI", price: 99000, duration: 30,
    features: ["Giáo án không giới hạn", "AI sinh câu hỏi tự động", "OCR chấm điểm tự động", "Báo cáo phân tích học sinh", "Hỗ trợ ưu tiên 24/7"],
    color: "#f59e0b", highlight: true,
  },
  {
    id: 3, name: "School", price: 499000, duration: 30,
    features: ["Tất cả tính năng Pro AI", "Quản lý nhiều lớp/giáo viên", "Dashboard trường học", "API tích hợp hệ thống", "Đào tạo & onboarding"],
    color: "#a855f7", highlight: false,
  },
];

const HISTORY = [
  { id: "INV-2025-04", date: "01/04/2025", pkg: "Pro AI", amount: 99000, status: "SUCCESS" },
  { id: "INV-2025-03", date: "01/03/2025", pkg: "Pro AI", amount: 99000, status: "SUCCESS" },
  { id: "INV-2025-02", date: "01/02/2025", pkg: "Free", amount: 0, status: "SUCCESS" },
  { id: "INV-2025-01", date: "01/01/2025", pkg: "Free", amount: 0, status: "SUCCESS" },
];

const fmt = (n) =>
  n === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const STATUS_MAP = {
  SUCCESS: { label: "Thành công", color: "#10b981", bg: "#d1fae520" },
  PENDING: { label: "Đang xử lý", color: "#f59e0b", bg: "#fef3c720" },
  FAILED: { label: "Thất bại", color: "#ef4444", bg: "#fee2e220" },
};

export default function TeacherBilling() {
  const [currentPkg] = useState(PACKAGES[1]); // Pro AI
  const [renewDate] = useState("01/05/2025");
  const [daysLeft] = useState(7);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setConfirmUpgrade(false);
    setUpgradeTarget(null);
    showToast(`Đăng ký gói "${upgradeTarget.name}" thành công! Hệ thống sẽ gửi email xác nhận.`);
  };

  const urgency = daysLeft <= 7;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        color: "#fafafa",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 999,
            background: "#14532d",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            borderLeft: "4px solid #10b981",
            maxWidth: 340,
          }}
        >
          ✓ {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {confirmUpgrade && upgradeTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 16,
              padding: 36,
              maxWidth: 420,
              width: "90%",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
              Xác nhận đăng ký
            </div>
            <div
              style={{
                background: "#09090b",
                border: "1px solid #3f3f46",
                borderRadius: 10,
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 4 }}>Gói dịch vụ</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: upgradeTarget.color }}>
                {upgradeTarget.name}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                {fmt(upgradeTarget.price)}
                {upgradeTarget.price > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#71717a" }}>/tháng</span>
                )}
              </div>
            </div>
            <p style={{ color: "#a1a1aa", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Bạn sẽ được thanh toán tự động vào đầu mỗi kỳ. Có thể huỷ bất cứ lúc nào trước ngày gia hạn.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmUpgrade(false)}
                style={{
                  flex: 1,
                  padding: 11,
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                  background: "transparent",
                  color: "#a1a1aa",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Huỷ
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: 11,
                  border: "none",
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${upgradeTarget.color}, ${upgradeTarget.color}cc)`,
                  color: "#000",
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 13,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Đang xử lý..." : "Xác nhận thanh toán →"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            TEACHER › Billing
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Gói dịch vụ của bạn
          </h1>
          <p style={{ margin: "8px 0 0", color: "#71717a", fontSize: 13 }}>
            Quản lý đăng ký, xem lịch sử thanh toán và nâng cấp gói PlanbookAI
          </p>
        </div>

        {/* Current plan card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1c1400, #1a1a0a)",
            border: `1px solid ${currentPkg.color}55`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0, right: 0,
              width: 200, height: 200,
              background: `radial-gradient(circle, ${currentPkg.color}18 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Gói hiện tại
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: currentPkg.color }}>{currentPkg.name}</div>
                <span
                  style={{
                    padding: "3px 10px",
                    background: `${currentPkg.color}22`,
                    border: `1px solid ${currentPkg.color}55`,
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    color: currentPkg.color,
                    letterSpacing: "0.08em",
                  }}
                >
                  ĐANG HOẠT ĐỘNG
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
                {fmt(currentPkg.price)}
                {currentPkg.price > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#71717a" }}>/tháng</span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12 }}>
                {currentPkg.features.map((f, i) => (
                  <span key={i} style={{ fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: currentPkg.color, fontSize: 10 }}>✓</span> {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Renewal info */}
            <div
              style={{
                background: urgency ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${urgency ? "#ef444455" : "#3f3f46"}`,
                borderRadius: 12,
                padding: "20px 24px",
                minWidth: 200,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Gia hạn sau</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: urgency ? "#ef4444" : "#fafafa", lineHeight: 1 }}>
                {daysLeft}
              </div>
              <div style={{ fontSize: 12, color: "#71717a", marginBottom: 8 }}>ngày</div>
              <div style={{ fontSize: 11, color: "#71717a" }}>Ngày gia hạn: {renewDate}</div>
              {urgency && (
                <div style={{ marginTop: 10, fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                  ⚠ Sắp hết hạn!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade section */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Nâng cấp gói
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {PACKAGES.map((pkg) => {
              const isCurrent = pkg.id === currentPkg.id;
              return (
                <div
                  key={pkg.id}
                  style={{
                    background: isCurrent ? "#18180a" : "#18181b",
                    border: `1px solid ${isCurrent ? pkg.color + "66" : "#27272a"}`,
                    borderRadius: 14,
                    padding: 22,
                    position: "relative",
                    transition: "border-color .2s, transform .15s",
                    cursor: isCurrent ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.borderColor = pkg.color + "88"; }}
                  onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.borderColor = "#27272a"; }}
                >
                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "3px 10px",
                        background: `${pkg.color}22`,
                        border: `1px solid ${pkg.color}55`,
                        borderRadius: 20,
                        fontSize: 9,
                        fontWeight: 700,
                        color: pkg.color,
                        letterSpacing: "0.08em",
                      }}
                    >
                      GÓI HIỆN TẠI
                    </div>
                  )}
                  {pkg.highlight && !isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "3px 10px",
                        background: `${pkg.color}22`,
                        border: `1px solid ${pkg.color}55`,
                        borderRadius: 20,
                        fontSize: 9,
                        fontWeight: 700,
                        color: pkg.color,
                        letterSpacing: "0.08em",
                      }}
                    >
                      ⭐ PHỔ BIẾN
                    </div>
                  )}

                  <div style={{ fontSize: 18, fontWeight: 800, color: pkg.color, marginBottom: 4 }}>{pkg.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
                    {fmt(pkg.price)}
                    {pkg.price > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: "#71717a" }}>/tháng</span>}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <span style={{ color: pkg.color, fontSize: 11 }}>✓</span>
                        <span style={{ fontSize: 12, color: "#a1a1aa" }}>{f}</span>
                      </div>
                    ))}
                    {pkg.features.length > 3 && (
                      <div style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>+{pkg.features.length - 3} tính năng khác</div>
                    )}
                  </div>
                  <button
                    disabled={isCurrent}
                    onClick={() => { setUpgradeTarget(pkg); setConfirmUpgrade(true); }}
                    style={{
                      width: "100%",
                      padding: "9px",
                      border: isCurrent ? `1px solid ${pkg.color}44` : "none",
                      borderRadius: 8,
                      background: isCurrent ? "transparent" : `linear-gradient(135deg, ${pkg.color}, ${pkg.color}cc)`,
                      color: isCurrent ? pkg.color : "#000",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: isCurrent ? "default" : "pointer",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {isCurrent ? "Đang sử dụng" : pkg.price > currentPkg.price ? "Nâng cấp →" : "Chuyển sang gói này"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing history */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Lịch sử thanh toán
          </h2>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #27272a" }}>
                  {["Mã hoá đơn", "Ngày", "Gói dịch vụ", "Số tiền", "Trạng thái"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#52525b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((inv) => {
                  const s = STATUS_MAP[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid #1a1a1f" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f23")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "13px 16px", fontSize: 13, fontFamily: "monospace", color: "#a1a1aa" }}>{inv.id}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#a1a1aa" }}>{inv.date}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#fafafa", fontWeight: 600 }}>{inv.pkg}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: inv.amount === 0 ? "#52525b" : "#fafafa" }}>
                        {fmt(inv.amount)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.color}44`,
                          }}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}