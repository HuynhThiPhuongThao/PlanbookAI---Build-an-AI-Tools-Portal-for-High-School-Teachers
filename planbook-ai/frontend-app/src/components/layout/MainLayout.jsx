import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:8082';

// Kiem tra emoji hay URL that
const isEmojiAvatar = (url) => {
  if (!url) return false;
  // Emoji la ky tu Unicode, khong bat dau voi http//, /, data:
  return !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:');
};

// Chuan hoa URL: them backend prefix neu la duong dan tuong doi
const resolveAvatarUrl = (url) => {
  if (!url) return null;
  if (isEmojiAvatar(url)) return url; // emoji, giu nguyen
  if (url.startsWith('/')) return BACKEND_URL + url; // relative path
  return url; // full URL
};
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  UserSquare2, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Package,
  CheckCircle2,
  ChevronRight,
  User
} from 'lucide-react';
import userApi from '../../api/userApi';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy data từ localStorage làm fallback ban đầu
  const userRole = localStorage.getItem('userRole') || 'TEACHER';

  // Fetch thông tin profile thật từ Backend
  const fetchProfile = async () => {
    try {
      const response = await userApi.getMe();
      setUserProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile in layout:', err);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  // Hàm lấy chữ cái đầu (Initials) - Giống Google
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const menuConfigs = {
    TEACHER: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
      { name: 'Lesson Plans', icon: FileText, path: '/teacher/lesson-plans' },
      { name: 'Question Bank', icon: Database, path: '/teacher/question-bank' },
      { name: 'Exam Creation', icon: ClipboardList, path: '/teacher/exams' },
      { name: 'OCR Grading', icon: Sparkles, path: '/teacher/grading' },
    ],
    ADMIN: [
      { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'User Management', icon: Users, path: '/admin/users' },
      { name: 'Curriculum', icon: GraduationCap, path: '/admin/curriculum' },
      { name: 'System Logs', icon: ClipboardList, path: '/admin/logs' },
      { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
    MANAGER: [
      { name: 'Manager Dashboard', icon: LayoutDashboard, path: '/manager' },
      { name: 'Packages', icon: Package, path: '/manager/packages' },
      { name: 'Orders', icon: ClipboardList, path: '/manager/orders' },
      { name: 'Approvals', icon: CheckCircle2, path: '/manager/approvals' },
    ],
    STAFF: [
      { name: 'Staff Dashboard', icon: LayoutDashboard, path: '/staff' },
      { name: 'Lesson Templates', icon: FileText, path: '/staff/templates' },
      { name: 'Shared Bank', icon: Database, path: '/staff/bank' },
      { name: 'AI Prompts', icon: Sparkles, path: '/staff/prompts' },
    ]
  };

  const currentMenu = menuConfigs[userRole] || menuConfigs.TEACHER;

  // Thêm link Profile vào cuối menu cho tất cả roles
  const commonMenu = [
    { name: 'Profile', icon: User, path: '/profile' }
  ];
  const finalMenu = [...currentMenu, ...commonMenu];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-purple-600 p-1.5 rounded-lg flex-shrink-0">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl text-gray-900 truncate">PlanbookAI</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {finalMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {userProfile?.fullName || 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{userRole}</p>
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-white font-bold hover:scale-105 transition-all bg-gradient-to-tr from-purple-500 to-blue-500">
              {(() => {
                const avatar = resolveAvatarUrl(userProfile?.avatarUrl);
                if (!avatar) return <span>{getInitials(userProfile?.fullName)}</span>;
                if (isEmojiAvatar(userProfile?.avatarUrl)) return <span className="text-xl">{avatar}</span>;
                return <img src={avatar} alt="Avatar" className="w-full h-full object-cover"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
              })()}
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ userProfile, refreshProfile: fetchProfile }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
