import { useState, useEffect } from "react";

// Mock data
const MONTHLY_REVENUE = [
  { month: "T11/24", free: 0, pro: 4158000, school: 998000, total: 5156000 },
  { month: "T12/24", free: 0, pro: 5148000, school: 1497000, total: 6645000 },
  { month: "T1/25", free: 0, pro: 6534000, school: 1996000, total: 8530000 },
  { month: "T2/25", free: 0, pro: 7722000, school: 2495000, total: 10217000 },
  { month: "T3/25", free: 0, pro: 9801000, school: 2994000, total: 12795000 },
  { month: "T4/25", free: 0, pro: 12672000, school: 4990000, total: 17662000 },
];

const PKG_STATS = [
  { name: "Free", users: 342, revenue: 0, color: "#64748b", pct: 71 },
  { name: "Pro AI", users: 128, revenue: 12672000, color: "#f59e0b", pct: 26 },
  { name: "School", users: 10, revenue: 4990000, color: "#a855f7", pct: 2 },
];

const RECENT_ORDERS = [
  { id: "ORD-2025-0421", user: "Nguyễn Thị Lan", email: "lan.nguyen@thptnd.edu.vn", pkg: "Pro AI", amount: 99000, date: "21/04/2025", status: "SUCCESS" },
  { id: "ORD-2025-0420", user: "Trần Văn Minh", email: "minh.tv@thptcva.edu.vn", pkg: "School", amount: 499000, date: "20/04/2025", status: "SUCCESS" },
  { id: "ORD-2025-0419", user: "Lê Thị Hoa", email: "hoa.lt@thptlqd.edu.vn", pkg: "Pro AI", amount: 99000, date: "19/04/2025", status: "SUCCESS" },
  { id: "ORD-2025-0418", user: "Phạm Đức Long", email: "long.pd@thpttw.edu.vn", pkg: "Pro AI", amount: 99000, date: "18/04/2025", status: "PENDING" },
  { id: "ORD-2025-0417", user: "Hoàng Thị Mai", email: "mai.ht@thpttv.edu.vn", pkg: "School", amount: 499000, date: "17/04/2025", status: "SUCCESS" },
];

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtShort = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
};

const STATUS_MAP = {
  SUCCESS: { label: "Thành công", color: "#10b981" },
  PENDING: { label: "Đang xử lý", color: "#f59e0b" },
  FAILED: { label: "Thất bại", color: "#ef4444" },
};

export default function AdminRevenue() {
  const [period, setPeriod] = useState("6m");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const currentMonth = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const prevMonth = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
  const growth = (((currentMonth.total - prevMonth.total) / prevMonth.total) * 100).toFixed(1);
  const totalAllTime = MONTHLY_REVENUE.reduce((s, m) => s + m.total, 0);
  const totalUsers = PKG_STATS.reduce((s, p) => s + p.users, 0);
  const paidUsers = PKG_STATS.filter((p) => p.revenue > 0).reduce((s, p) => s + p.users, 0);

  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.total));

  const CHART_H = 180;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080810",
        fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              ADMIN › Revenue
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>
              Dashboard Doanh thu
            </h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
              Theo dõi doanh thu và tăng trưởng người dùng PlanbookAI theo thời gian thực
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 10, padding: 4 }}>
            {["3m", "6m", "1y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 7,
                  border: "none",
                  background: period === p ? "#a855f7" : "transparent",
                  color: period === p ? "#fff" : "#64748b",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "all .2s",
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            {
              label: "Doanh thu tháng này",
              value: fmt(currentMonth.total),
              sub: `+${growth}% so với tháng trước`,
              subColor: "#10b981",
              icon: "₫",
              color: "#a855f7",
              gradient: "linear-gradient(135deg, #1e0a2e, #120818)",
              border: "#a855f755",
            },
            {
              label: "Tổng doanh thu",
              value: fmt(totalAllTime),
              sub: "Từ khi ra mắt",
              subColor: "#64748b",
              icon: "∑",
              color: "#3b82f6",
              gradient: "linear-gradient(135deg, #0c1a2e, #080e1a)",
              border: "#3b82f655",
            },
            {
              label: "Người dùng trả phí",
              value: paidUsers,
              sub: `/${totalUsers} tổng người dùng`,
              subColor: "#64748b",
              icon: "◈",
              color: "#f59e0b",
              gradient: "linear-gradient(135deg, #1c1000, #100b00)",
              border: "#f59e0b55",
            },
            {
              label: "Tăng trưởng MoM",
              value: `+${growth}%`,
              sub: "So tháng trước",
              subColor: "#10b981",
              icon: "↗",
              color: "#10b981",
              gradient: "linear-gradient(135deg, #001f10, #000d08)",
              border: "#10b98155",
            },
          ].map((kpi, i) => (
            <div
              key={i}
              style={{
                background: kpi.gradient,
                border: `1px solid ${kpi.border}`,
                borderRadius: 14,
                padding: "22px 24px",
                transform: animated ? "translateY(0)" : "translateY(16px)",
                opacity: animated ? 1 : 0,
                transition: `all .5s ease ${i * 0.08}s`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {kpi.label}
                </div>
                <span style={{ fontSize: 18, color: kpi.color, opacity: 0.7 }}>{kpi.icon}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: kpi.color, marginBottom: 4 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: kpi.subColor }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
          {/* Bar chart */}
          <div style={{ background: "#0e0e1c", border: "1px solid #1e1e2e", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Doanh thu theo tháng</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>6 tháng gần nhất</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[{ color: "#f59e0b", label: "Pro AI" }, { color: "#a855f7", label: "School" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: CHART_H + 30 }}>
              {MONTHLY_REVENUE.map((m, i) => {
                const totalH = animated ? (m.total / maxRevenue) * CHART_H : 0;
                const proH = animated ? (m.pro / maxRevenue) * CHART_H : 0;
                const schoolH = animated ? (m.school / maxRevenue) * CHART_H : 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{fmtShort(m.total)}</div>
                    <div style={{ width: "100%", display: "flex", gap: 3, alignItems: "flex-end", height: CHART_H }}>
                      <div
                        style={{
                          flex: 1,
                          height: proH,
                          background: "linear-gradient(180deg, #f59e0b, #d97706)",
                          borderRadius: "4px 4px 0 0",
                          transition: `height .7s cubic-bezier(.34,1.56,.64,1) ${i * 0.07}s`,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: schoolH,
                          background: "linear-gradient(180deg, #a855f7, #7c3aed)",
                          borderRadius: "4px 4px 0 0",
                          transition: `height .7s cubic-bezier(.34,1.56,.64,1) ${i * 0.07 + 0.05}s`,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", fontWeight: 500 }}>{m.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package breakdown */}
          <div style={{ background: "#0e0e1c", border: "1px solid #1e1e2e", borderRadius: 16, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Phân bổ gói</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 24 }}>Người dùng theo gói dịch vụ</div>

            {/* Donut-style viz */}
            <div style={{ display: "flex", gap: 6, height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
              {PKG_STATS.map((p) => (
                <div
                  key={p.name}
                  style={{
                    width: animated ? `${p.pct}%` : "0%",
                    background: p.color,
                    transition: `width .8s cubic-bezier(.34,1.56,.64,1)`,
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>

            {PKG_STATS.map((pkg, i) => (
              <div
                key={pkg.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < PKG_STATS.length - 1 ? "1px solid #1e1e2e" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: pkg.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{pkg.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{pkg.users} người dùng · {pkg.pct}%</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: pkg.color }}>
                    {pkg.revenue === 0 ? "—" : fmtShort(pkg.revenue) + "đ"}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>tháng này</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: "14px 16px", background: "#12121e", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Conversion Rate (Free → Paid)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                {((paidUsers / totalUsers) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div style={{ background: "#0e0e1c", border: "1px solid #1e1e2e", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Đơn hàng gần đây</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>5 giao dịch mới nhất</div>
            </div>
            <button
              style={{
                padding: "7px 16px",
                border: "1px solid #1e1e2e",
                borderRadius: 8,
                background: "transparent",
                color: "#a855f7",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Xem tất cả →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                {["Mã đơn", "Người dùng", "Gói", "Số tiền", "Ngày", "Trạng thái"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#475569",
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
              {RECENT_ORDERS.map((order) => {
                const s = STATUS_MAP[order.status];
                const pkg = PKG_STATS.find((p) => p.name === order.pkg);
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #12121e", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#131320")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                      {order.id}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{order.user}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{order.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: `${pkg?.color || "#64748b"}22`,
                          color: pkg?.color || "#64748b",
                          border: `1px solid ${pkg?.color || "#64748b"}44`,
                        }}
                      >
                        {order.pkg}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700 }}>
                      {fmt(order.amount)}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>{order.date}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}