import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // Lấy dữ liệu từ localStorage (do mình lưu ở Login.jsx)
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole'); // Đảm bảo lúc Login mình cũng lưu role này vào localStorage

  if (!accessToken) {
    // Nếu chưa đăng nhập, đá về trang Login nhưng giữ lại URL hiện tại để login xong quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Nếu role không hợp lệ (VD: Teacher cố vào Admin), đá về trang chủ (hoặc trang báo lỗi)
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
