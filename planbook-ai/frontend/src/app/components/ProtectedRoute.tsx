import { Navigate, Outlet } from "react-router";

// =====================================================================
// ProtectedRoute — Chặn truy cập thẳng URL mà chưa đăng nhập
//
// Cách hoạt động:
//   - Đọc access_token từ localStorage
//   - Nếu không có → redirect về trang Login (/)
//   - Nếu có → cho qua, render trang bình thường
//
// Bonus: kiểm tra role để chặn Teacher vào /admin, Staff vào /manager...
// =====================================================================

function getTokenPayload(): { role?: string } | null {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Dùng cho tất cả route cần đăng nhập
export function RequireAuth() {
  const payload = getTokenPayload();
  if (!payload) {
    // Chưa login → đá về trang Login
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// Dùng cho route chỉ dành cho 1 role cụ thể
// allowedRoles: ['ADMIN'] | ['MANAGER'] | ['STAFF', 'ADMIN'] ...
export function RequireRole({ allowedRoles }: { allowedRoles: string[] }) {
  const payload = getTokenPayload();

  if (!payload) {
    return <Navigate to="/" replace />;
  }

  const role = payload.role || '';
  if (!allowedRoles.includes(role)) {
    // Đã login nhưng sai role → đá về trang phù hợp với role
    if (role === 'TEACHER') return <Navigate to="/teacher" replace />;
    if (role === 'STAFF') return <Navigate to="/staff" replace />;
    if (role === 'MANAGER') return <Navigate to="/manager" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
