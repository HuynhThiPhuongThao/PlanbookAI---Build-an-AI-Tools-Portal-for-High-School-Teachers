import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Users,
  Settings,
  FileText,
  DollarSign,
  TrendingUp,
  UserPlus,
  Database,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import React from 'react';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName || '';
  } catch { return ''; }
}

function useRealUserName() {
  const [name, setName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);
  return name;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const realName = useRealUserName();

  const systemStats = [
    { label: 'Total Users', value: '1,248', icon: Users, change: '+48 this month' },
    { label: 'Active Teachers', value: '856', icon: UserPlus, change: '68% active rate' },
    { label: 'System Uptime', value: '99.9%', icon: Shield, change: 'Last 30 days' },
    { label: 'Total Revenue', value: '$24.5K', icon: DollarSign, change: '+12% vs last month' },
  ];

  const adminActions = [
    {
      title: 'User Management',
      description: 'Create, update, and manage user accounts and roles',
      icon: Users,
      action: 'Manage Users',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'System Configuration',
      description: 'Configure global system settings and behavior',
      icon: Settings,
      action: 'Configure System',
      onClick: () => {},
    },
    {
      title: 'Curriculum Framework',
      description: 'Design and manage lesson plan templates',
      icon: FileText,
      action: 'Manage Templates',
      onClick: () => {},
    },
    {
      title: 'Revenue Tracking',
      description: 'View financial metrics and subscription data',
      icon: DollarSign,
      action: 'View Analytics',
      onClick: () => {},
    },
  ];

  const recentUsers = [
    { name: 'Trần Văn Minh', role: 'Teacher', status: 'Active', joined: '2026-03-01' },
    { name: 'Lê Thị Hương', role: 'Teacher', status: 'Active', joined: '2026-03-02' },
    { name: 'Phạm Quốc Bảo', role: 'Staff', status: 'Active', joined: '2026-03-05' },
    { name: 'Nguyễn Thu Trang', role: 'Teacher', status: 'Inactive', joined: '2026-02-28' },
  ];

  return (
    <DashboardLayout role="admin" userName={realName}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xin chào, {realName || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600">System administration overview</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Administration Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <action.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={action.onClick}
                  >
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{user.joined}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/users')}>
              View All Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
