import React from 'react';
import { Link, useNavigate } from 'react-router';
import { UserRole } from '../types';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import axiosClient, { authStorage } from '../api/axiosClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Bell, CheckCircle, Clock, GraduationCap, LogOut, Settings, User, XCircle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}

type FirebaseToastType = 'CONTENT_SUBMITTED' | 'CONTENT_APPROVED' | 'CONTENT_REJECTED' | 'GENERAL';

type FirebaseToast = {
  title: string;
  body: string;
  type: FirebaseToastType;
};

type FirebaseNotificationItem = FirebaseToast & {
  id: string;
  receivedAt: string;
  read: boolean;
};

const firebaseToastStyles: Record<FirebaseToastType, {
  label: string;
  border: string;
  badge: string;
  iconWrap: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  CONTENT_SUBMITTED: {
    label: 'Can duyet',
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    iconWrap: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: Clock,
  },
  CONTENT_APPROVED: {
    label: 'Da duyet',
    border: 'border-l-green-500',
    badge: 'bg-green-100 text-green-700',
    iconWrap: 'bg-green-100',
    iconColor: 'text-green-600',
    Icon: CheckCircle,
  },
  CONTENT_REJECTED: {
    label: 'Tu choi',
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
    iconWrap: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: XCircle,
  },
  GENERAL: {
    label: 'Thong bao',
    border: 'border-l-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    iconWrap: 'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon: Bell,
  },
};

function normalizeFirebaseToastType(type?: string): FirebaseToastType {
  if (type === 'CONTENT_SUBMITTED' || type === 'CONTENT_APPROVED' || type === 'CONTENT_REJECTED') {
    return type;
  }
  return 'GENERAL';
}

function getFirebaseFallbackTitle(type: FirebaseToastType) {
  if (type === 'CONTENT_SUBMITTED') return 'Co noi dung can duyet';
  if (type === 'CONTENT_APPROVED') return 'Noi dung da duoc duyet';
  if (type === 'CONTENT_REJECTED') return 'Noi dung bi tu choi';
  return 'Thong bao PlanbookAI';
}

export default function DashboardLayout({ children, role, userName: defaultUserName }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [realName, setRealName] = React.useState(defaultUserName);
  const [realRole, setRealRole] = React.useState(role);
  const [realAvatar, setRealAvatar] = React.useState<string | null>(null);
  const [firebaseToast, setFirebaseToast] = React.useState<FirebaseToast | null>(null);
  const [notifications, setNotifications] = React.useState<FirebaseNotificationItem[]>([]);
  const firebaseToastTimer = React.useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const unreadNotificationCount = notifications.filter((item) => !item.read).length;

  React.useEffect(() => {
    // 1. Parse token for initial user info.
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Decode the JWT payload.
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
    
    // 2. Load profile details when the header mounts.
    // Keep the header synced after profile changes.
    const fetchAvatar = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        // axiosClient unwraps response.data.
        const res: any = await axiosClient.get('/users/me');
        if (res?.avatarUrl) setRealAvatar(res.avatarUrl);
        if (res?.fullName) setRealName(res.fullName);
      } catch (_) { /* silent fail */ }
    };
    fetchAvatar();

    // 3. Listen for profile updates from the profile page.
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.fullName) setRealName(e.detail.fullName);
      if (e.detail?.avatarUrl !== undefined) setRealAvatar(e.detail.avatarUrl);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // 4. Register the FCM token and listen for foreground notifications.
    const token = localStorage.getItem('access_token');
    let unsubscribeFirebase: undefined | (() => void);
    if (token) {
      import('../firebase').then(({ requestPermission, listenForMessage }) => {
        requestPermission().then((fcmToken) => {
          if (fcmToken) {
            axiosClient.put('/users/me/fcm-token', { token: fcmToken })
              .then(() => console.log('Da luu FCM Token len server thanh cong!'))
              .catch(err => console.error('Loi luu FCM Token', err));
          }
        }).catch(err => console.error('Loi xin quyen Firebase: ', err));

        unsubscribeFirebase = listenForMessage((payload: any) => {
          const type = normalizeFirebaseToastType(payload?.data?.type);
          const toast: FirebaseToast = {
            type,
            title: payload?.notification?.title || getFirebaseFallbackTitle(type),
            body: payload?.notification?.body || payload?.data?.lessonPlanTitle || 'Co thong bao moi tu PlanbookAI.',
          };

          setFirebaseToast(toast);
          setNotifications((current) => [
            {
              ...toast,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              receivedAt: new Date().toISOString(),
              read: false,
            },
            ...current,
          ].slice(0, 20));
          window.dispatchEvent(new CustomEvent('firebaseNotificationReceived', { detail: payload }));

          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(() => {});

          if (firebaseToastTimer.current) window.clearTimeout(firebaseToastTimer.current);
          firebaseToastTimer.current = window.setTimeout(() => setFirebaseToast(null), 6000);
        });
      }).catch(err => console.error('Loi import firebase: ', err));
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      unsubscribeFirebase?.();
      if (firebaseToastTimer.current) window.clearTimeout(firebaseToastTimer.current);
    };
  }, []);

  const handleLogout = () => {
    authStorage.clearTokens();
    navigate('/');
  };

  const markNotificationsAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const formatNotificationTime = (value: string) => {
    try {
      return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getRoleDisplay = (roleOutput: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Quan tri vien',
      manager: 'Quan ly',
      staff: 'Nhan vien',
      teacher: 'Giao vien',
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
              <DropdownMenu onOpenChange={(open) => open && markNotificationsAsRead()}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationCount > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <DropdownMenuLabel className="px-0 py-0">Thong bao</DropdownMenuLabel>
                    {notifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Xoa het
                      </button>
                    ) : null}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      Chua co thong bao nao.
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.map((item) => {
                        const cfg = firebaseToastStyles[item.type];
                        const ItemIcon = cfg.Icon;
                        return (
                          <div key={item.id} className="rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 rounded-lg p-2 ${cfg.iconWrap}`}>
                                <ItemIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
                                    {cfg.label}
                                  </span>
                                  <span className="shrink-0 text-[11px] text-gray-400">
                                    {formatNotificationTime(item.receivedAt)}
                                  </span>
                                </div>
                                <p className="mt-1 truncate text-sm font-semibold text-gray-900">{item.title}</p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{item.body}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
                  <DropdownMenuLabel>Tai khoan cua toi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Ho so
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cai dat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Dang xuat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {firebaseToast && (() => {
        const cfg = firebaseToastStyles[firebaseToast.type];
        const ToastIcon = cfg.Icon;
        return (
          <div className={`fixed top-20 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-gray-200 border-l-4 ${cfg.border} bg-white p-4 shadow-xl`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${cfg.iconWrap}`}>
                <ToastIcon className={`h-5 w-5 ${cfg.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">{firebaseToast.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{firebaseToast.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setFirebaseToast(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Dong thong bao"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
