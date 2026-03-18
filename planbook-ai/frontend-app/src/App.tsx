import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TeacherHome from './pages/teacher/TeacherHome';
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import ManagerHome from './pages/manager/ManagerHome';
import StaffHome from './pages/staff/StaffHome';
import Profile from './pages/shared/Profile';

// Component để điều hướng từ trang chủ "/" dựa trên role
const RootRedirect = () => {
  const role = localStorage.getItem('userRole') as 'TEACHER' | 'ADMIN' | 'MANAGER' | 'STAFF' | null;
  if (!role) return <Navigate to="/login" replace />;

  const routes = {
    TEACHER: '/teacher',
    ADMIN: '/admin',
    MANAGER: '/manager',
    STAFF: '/staff'
  };

  return <Navigate to={routes[role] || '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<RootRedirect />} />

          <Route path="teacher" element={
            <ProtectedRoute allowedRoles={['TEACHER']}><TeacherHome /></ProtectedRoute>
          } />

          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminHome /></ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>
          } />

          <Route path="manager" element={
            <ProtectedRoute allowedRoles={['MANAGER']}><ManagerHome /></ProtectedRoute>
          } />

          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['STAFF']}><StaffHome /></ProtectedRoute>
          } />

          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/unauthorized" element={<div className="p-20 text-center"><h1>403 - Unauthorized</h1><p>Bạn không có quyền truy cập trang này!</p></div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
