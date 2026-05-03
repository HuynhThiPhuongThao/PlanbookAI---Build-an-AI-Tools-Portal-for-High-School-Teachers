import React from 'react';
import { Link, useNavigate } from 'react-router';
import { UserRole } from '../types';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import axiosClient from '../api/axiosClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { GraduationCap, LogOut, Settings, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}

export default function DashboardLayout({ children, role, userName: defaultUserName }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [realName, setRealName] = React.useState(defaultUserName);
  const [realRole, setRealRole] = React.useState(role);
  const [realAvatar, setRealAvatar] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Phân tích token để lấy tên mặc định lúc mới đăng nhập
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Tách phần payload của JWT (nằm giữa 2 dấu chấm)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        if (decoded.fullName) setRealName(decoded.fullName);
        if (decoded.role) setRealRole(decoded.role.toLowerCase() as any);
      }
    } catch (e) {
      console.warn("Could not parse JWT token for user info", e);
    }
    
    // 2. Tự động kéo avatar từ DB ngay khi header mount
    //    → tránh trường hợp user đã đổi ảnh từ session trước mà header vẫn hiện chữ initials
    const fetchAvatar = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        // axiosClient interceptor đã unwrap response.data rồi → res chính là data object luôn
        const res: any = await axiosClient.get('/users/me');
        if (res?.avatarUrl) setRealAvatar(res.avatarUrl);
        if (res?.fullName) setRealName(res.fullName);
      } catch (_) { /* silent fail — không ảnh hưởng UI */ }
    };
    fetchAvatar();

    // 3. Lắng nghe tín hiệu cập nhật realtime từ trang UserProfile (khi user vừa bấm Lưu)
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.fullName) setRealName(e.detail.fullName);
      if (e.detail?.avatarUrl !== undefined) setRealAvatar(e.detail.avatarUrl);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // 4. Firebase: Đăng ký Token thiết bị và gửi lên Backend (để nhận thông báo)
    const token = localStorage.getItem('access_token');
    if (token) {
      import('../firebase').then(({ requestPermission }) => {
        requestPermission().then((fcmToken) => {
          if (fcmToken) {
            axiosClient.put('/users/me/fcm-token', { token: fcmToken })
              .then(() => console.log('Đã lưu FCM Token lên server thành công!'))
              .catch(err => console.error('Lỗi lưu FCM Token', err));
          }
        }).catch(err => console.error("Lỗi xin quyền Firebase: ", err));
      }).catch(err => console.error("Lỗi import firebase: ", err));
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const getRoleDisplay = (roleOutput: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      staff: 'Nhân viên',
      teacher: 'Giáo viên',
    };

    if (!roleOutput) return '';
    return roleLabels[roleOutput.toLowerCase()] || roleOutput;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <Link to={`/${realRole}`} className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">PlanbookAI</h1>
                <p className="text-xs text-gray-500">{getRoleDisplay(realRole)}</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3">
                    <Avatar>
                      {realAvatar ? (
                         <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                           <img src={realAvatar} alt={realName} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <AvatarFallback className="bg-blue-100 text-blue-700">
                           {realName && realName.trim() !== '' ? realName.split(' ').map(n => n[0]).join('') : 'U'}
                         </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium">{realName}</p>
                      <p className="text-xs text-gray-500">{getRoleDisplay(realRole)}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
