import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Package,
  ShoppingCart,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export default function ManagerDashboard() {
  const managerStats = [
    { label: 'Active Packages', value: '8', icon: Package, change: '2 pending approval' },
    { label: 'Total Orders', value: '156', icon: ShoppingCart, change: '+12 this week' },
    { label: 'Pending Reviews', value: '23', icon: Clock, change: '5 urgent' },
    { label: 'Revenue (MTD)', value: '$12.4K', icon: DollarSign, change: '+18% growth' },
  ];

  const packages = [
    { name: 'Basic Plan', price: '$9.99/mo', users: 45, status: 'Active' },
    { name: 'Professional Plan', price: '$19.99/mo', users: 89, status: 'Active' },
    { name: 'Premium Plan', price: '$29.99/mo', users: 34, status: 'Active' },
    { name: 'Enterprise Plan', price: '$49.99/mo', users: 12, status: 'Active' },
  ];

  const pendingApprovals = [
    { type: 'Lesson Plan', title: 'Introduction to Organic Chemistry', author: 'Nguyễn Staff', submitted: '2 hours ago' },
    { type: 'Question Bank', title: '20 Questions - Atomic Structure', author: 'Trần Staff', submitted: '5 hours ago' },
    { type: 'Prompt Template', title: 'Exercise Generator v2', author: 'Lê Staff', submitted: '1 day ago' },
    { type: 'Lesson Plan', title: 'Chemical Bonding Advanced', author: 'Phạm Staff', submitted: '1 day ago' },
  ];

  const recentOrders = [
    { id: 'ORD-1234', customer: 'Nguyễn High School', package: 'Professional', amount: '$199.90', date: '2026-03-04', status: 'Completed' },
    { id: 'ORD-1235', customer: 'Trần Văn School', package: 'Premium', amount: '$299.90', date: '2026-03-03', status: 'Processing' },
    { id: 'ORD-1236', customer: 'Lê Thị Academy', package: 'Basic', amount: '$99.90', date: '2026-03-02', status: 'Completed' },
  ];

  return (
    <DashboardLayout role="manager" userName="Manager Phạm Đức">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Package management, orders, and content approval
          </p>
        </div>

        {/* Manager Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {managerStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Content Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Content Approvals</CardTitle>
                <CardDescription>Review and approve content created by staff</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <FileCheck className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <p className="font-medium text-gray-900">{item.title}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        By {item.author} • {item.submitted}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription Packages</CardTitle>
                  <CardDescription>Manage service packages</CardDescription>
                </div>
                <Button size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  New Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packages.map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-sm text-gray-600">{pkg.users} active users</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{pkg.price}</p>
                      <Badge className="bg-green-100 text-green-700">{pkg.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest subscription orders</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <Badge className={order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.customer}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{order.package} Plan</span>
                      <span className="font-bold text-gray-900">{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
