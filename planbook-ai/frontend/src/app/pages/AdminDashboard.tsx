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

export default function AdminDashboard() {
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
    },
    {
      title: 'System Configuration',
      description: 'Configure global system settings and behavior',
      icon: Settings,
      action: 'Configure System',
    },
    {
      title: 'Curriculum Framework',
      description: 'Design and manage lesson plan templates',
      icon: FileText,
      action: 'Manage Templates',
    },
    {
      title: 'Revenue Tracking',
      description: 'View financial metrics and subscription data',
      icon: DollarSign,
      action: 'View Analytics',
    },
  ];

  const recentUsers = [
    { name: 'Trần Văn Minh', role: 'Teacher', status: 'Active', joined: '2026-03-01' },
    { name: 'Lê Thị Hương', role: 'Teacher', status: 'Active', joined: '2026-03-02' },
    { name: 'Phạm Quốc Bảo', role: 'Staff', status: 'Pending', joined: '2026-03-03' },
    { name: 'Nguyễn Thu Hà', role: 'Teacher', status: 'Active', joined: '2026-03-04' },
  ];

  return (
    <DashboardLayout role="admin" userName="Admin Nguyễn Thanh">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            System overview and administrative controls
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrative Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">{item.action}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Latest users added to the system</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user.joined}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-600">Healthy</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">45ms</div>
              <p className="text-sm text-gray-600 mt-2">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">342</div>
              <p className="text-sm text-gray-600 mt-2">Currently online users</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
