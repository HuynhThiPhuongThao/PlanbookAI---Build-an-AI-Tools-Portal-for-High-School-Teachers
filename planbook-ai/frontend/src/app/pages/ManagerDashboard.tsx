import { useState } from "react";

const INIT_PACKAGES = [
  {
    id: 1, name: "Free", price: 0, duration: 30, description: "Gói cơ bản dành cho giáo viên mới bắt đầu",
    features: ["Tối đa 5 giáo án/tháng", "Ngân hàng câu hỏi hạn chế", "Xuất PDF cơ bản"],
    usersCount: 342, isActive: true, highlight: false,
  },
  {
    id: 2, name: "Pro AI", price: 99000, duration: 30, description: "Sức mạnh AI đầy đủ cho giáo viên chuyên nghiệp",
    features: ["Giáo án không giới hạn", "AI sinh câu hỏi tự động", "OCR chấm điểm tự động", "Báo cáo phân tích học sinh", "Hỗ trợ ưu tiên 24/7"],
    usersCount: 128, isActive: true, highlight: true,
  },
  {
    id: 3, name: "School", price: 499000, duration: 30, description: "Giải pháp toàn trường, quản lý tập trung",
    features: ["Tất cả tính năng Pro AI", "Quản lý nhiều lớp/giáo viên", "Dashboard trường học", "API tích hợp hệ thống", "Đào tạo & onboarding"],
    usersCount: 12, isActive: true, highlight: false,
  },
];

const fmt = (n) => n === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function PackageManage() {
  const [packages, setPackages] = useState(INIT_PACKAGES);
  const [editing, setEditing] = useState(null); // { pkg, isNew }
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => setEditing({
    isNew: true,
    pkg: { id: null, name: "", price: 0, duration: 30, description: "", features: [""], isActive: true, highlight: false, usersCount: 0 }
  });

  const openEdit = (pkg) => setEditing({ isNew: false, pkg: { ...pkg, features: [...pkg.features] } });

  const handleSave = async () => {
    const { pkg, isNew } = editing;
    if (!pkg.name.trim()) { showToast("Tên gói không được để trống", "error"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    if (isNew) {
      setPackages(prev => [...prev, { ...pkg, id: Date.now() }]);
      showToast("Gói mới đã được tạo thành công!");
    } else {
      setPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
      showToast("Cập nhật gói thành công!");
    }
    setSaving(false);
    setEditing(null);
  };

  const handleToggle = async (id) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    const pkg = packages.find(p => p.id === id);
    showToast(`Gói "${pkg.name}" ${pkg.isActive ? "đã tắt" : "đã bật"}.`, "warn");
  };

  const handleDelete = async () => {
    setPackages(prev => prev.filter(p => p.id !== deleteConfirm.id));
    showToast(`Đã xoá gói "${deleteConfirm.name}".`, "warn");
    setDeleteConfirm(null);
  };

  const updateFeature = (idx, val) => {
    setEditing(prev => ({ ...prev, pkg: { ...prev.pkg, features: prev.pkg.features.map((f, i) => i === idx ? val : f) } }));
  };

  const addFeature = () => setEditing(prev => ({ ...prev, pkg: { ...prev.pkg, features: [...prev.pkg.features, ""] } }));
  const removeFeature = (idx) => setEditing(prev => ({ ...prev, pkg: { ...prev.pkg, features: prev.pkg.features.filter((_, i) => i !== idx) } }));

  const totalRevenue = packages.reduce((s, p) => s + p.price * p.usersCount, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#f0f6fc" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56,189,248,0.08) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "#134e4a" : toast.type === "warn" ? "#431407" : "#450a0a", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", borderLeft: `4px solid ${toast.type === "success" ? "#14b8a6" : toast.type === "warn" ? "#fb923c" : "#ef4444"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 14, padding: 32, maxWidth: 380, width: "90%" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#ef4444" }}>Xoá gói "{deleteConfirm.name}"?</div>
            <p style={{ color: "#8b949e", marginBottom: 24 }}>Hành động này không thể hoàn tác. Hiện có {deleteConfirm.usersCount} người đang dùng gói này.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "8px 18px", border: "1px solid #30363d", borderRadius: 6, background: "transparent", color: "#8b949e", cursor: "pointer" }}>Huỷ</button>
              <button onClick={handleDelete} style={{ padding: "8px 18px", border: "none", borderRadius: 6, background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Xoá</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 16, padding: 36, width: 520, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setEditing(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 18 }}>✕</button>
            <h2 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 700, color: "#38bdf8" }}>
              {editing.isNew ? "Tạo gói mới" : `Chỉnh sửa: ${editing.pkg.name}`}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b949e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tên gói *</label>
                <input value={editing.pkg.name} onChange={e => setEditing(p => ({ ...p, pkg: { ...p.pkg, name: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#f0f6fc", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b949e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Giá (VND/tháng)</label>
                <input type="number" min="0" value={editing.pkg.price} onChange={e => setEditing(p => ({ ...p, pkg: { ...p.pkg, price: Number(e.target.value) } }))}
                  style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#f0f6fc", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b949e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mô tả</label>
              <textarea value={editing.pkg.description} onChange={e => setEditing(p => ({ ...p, pkg: { ...p.pkg, description: e.target.value } }))} rows={2}
                style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#f0f6fc", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b949e", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tính năng</label>
              {editing.pkg.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input value={f} onChange={e => updateFeature(i, e.target.value)}
                    style={{ flex: 1, padding: "7px 10px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, color: "#f0f6fc", fontSize: 13, outline: "none" }} />
                  <button onClick={() => removeFeature(i)} style={{ padding: "0 10px", border: "none", background: "#1f2937", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>−</button>
                </div>
              ))}
              <button onClick={addFeature} style={{ marginTop: 6, padding: "6px 14px", border: "1px dashed #30363d", borderRadius: 6, background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 12 }}>+ Thêm tính năng</button>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#8b949e" }}>
                <input type="checkbox" checked={editing.pkg.highlight} onChange={e => setEditing(p => ({ ...p, pkg: { ...p.pkg, highlight: e.target.checked } }))} />
                Đánh dấu nổi bật (Recommended)
              </label>
            </div>

            <button onClick={handleSave} disabled={saving}
              style={{ width: "100%", padding: 12, background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", border: "none", borderRadius: 8, color: "#0d1117", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Đang lưu..." : editing.isNew ? "Tạo gói" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>MANAGER › Packages</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Quản lý gói cước</h1>
            <p style={{ margin: "8px 0 0 0", color: "#8b949e", fontSize: 13 }}>Cấu hình giá và tính năng cho các gói dịch vụ PlanbookAI</p>
          </div>
          <button onClick={openNew}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", border: "none", borderRadius: 9, color: "#0d1117", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: "0.03em" }}>
            + Tạo gói mới
          </button>
        </div>

        {/* Revenue banner */}
        <div style={{ background: "linear-gradient(135deg, #0c2035, #0a1929)", border: "1px solid #1d4ed8", borderRadius: 14, padding: "20px 28px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#60a5fa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Doanh thu tháng này (ước tính)</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.03em" }}>{fmt(totalRevenue)}</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {packages.filter(p => p.isActive).map(p => (
              <div key={p.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f6fc" }}>{p.usersCount}</div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{ background: "#161b22", border: `1px solid ${pkg.highlight ? "#0ea5e9" : "#30363d"}`, borderRadius: 16, overflow: "hidden", position: "relative", opacity: pkg.isActive ? 1 : 0.55, transition: "all .2s" }}>
              {pkg.highlight && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)" }} />
              )}
              {!pkg.isActive && (
                <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 10px", background: "#1f2937", border: "1px solid #374151", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em" }}>TẮT</div>
              )}
              {pkg.highlight && pkg.isActive && (
                <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 10px", background: "#0c2a3f", border: "1px solid #0ea5e9", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.08em" }}>⭐ NỔI BẬT</div>
              )}

              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 4, fontSize: 11, color: "#8b949e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Gói</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{pkg.name}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: pkg.highlight ? "#38bdf8" : "#f0f6fc", marginBottom: 8 }}>
                  {fmt(pkg.price)}
                  {pkg.price > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "#8b949e" }}>/tháng</span>}
                </div>
                <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#8b949e", lineHeight: 1.5 }}>{pkg.description}</p>

                <div style={{ marginBottom: 16 }}>
                  {pkg.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "#38bdf8", flexShrink: 0, marginTop: 1, fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#c9d1d9" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #21262d", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#8b949e" }}>{pkg.usersCount} người dùng</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleToggle(pkg.id)}
                      style={{ padding: "5px 12px", border: `1px solid ${pkg.isActive ? "#374151" : "#166534"}`, borderRadius: 6, background: "transparent", color: pkg.isActive ? "#6b7280" : "#22c55e", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      {pkg.isActive ? "Tắt" : "Bật"}
                    </button>
                    <button onClick={() => openEdit(pkg)}
                      style={{ padding: "5px 12px", border: "1px solid #30363d", borderRadius: 6, background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      Sửa
                    </button>
                    <button onClick={() => setDeleteConfirm(pkg)}
                      style={{ padding: "5px 12px", border: "1px solid #7f1d1d", borderRadius: 6, background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input, textarea { color-scheme: dark; }
      `}</style>
    </div>
  );
}