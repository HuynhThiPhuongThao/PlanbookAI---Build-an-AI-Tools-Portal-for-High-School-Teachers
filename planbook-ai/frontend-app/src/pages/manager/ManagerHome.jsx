import React, { useState } from 'react';
import {
  TrendingUp, Package, ShoppingCart, CheckCircle2, DollarSign,
  BarChart2, Users, Clock, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Star, Eye, MoreHorizontal, Bell, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, change, positive, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon className={`${color} w-5 h-5`} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const recentOrders = [
  { id: '#ORD-4821', user: 'Nguyễn Thị Lan', pkg: 'Premium Annual', amount: '₫1,200,000', status: 'Thành công', time: '5 phút trước' },
  { id: '#ORD-4820', user: 'Trần Văn Hùng', pkg: 'Basic Monthly', amount: '₫150,000', status: 'Thành công', time: '22 phút trước' },
  { id: '#ORD-4819', user: 'Phạm Thị Mai', pkg: 'Team Plan', amount: '₫3,500,000', status: 'Chờ TT', time: '1 giờ trước' },
  { id: '#ORD-4818', user: 'Lê Quốc Anh', pkg: 'Basic Monthly', amount: '₫150,000', status: 'Thất bại', time: '2 giờ trước' },
  { id: '#ORD-4817', user: 'Hoàng Minh Tuấn', pkg: 'Premium Annual', amount: '₫1,200,000', status: 'Thành công', time: '3 giờ trước' },
];

const approvals = [
  { title: 'Giáo án Toán 12 - Đại số', by: 'GV. Trần Minh', time: '10 phút trước', type: 'Giáo án' },
  { title: 'Bộ câu hỏi Lịch sử 11', by: 'GV. Nguyễn Lan', time: '35 phút trước', type: 'Câu hỏi' },
  { title: 'Template Văn học cơ bản', by: 'Staff. Quốc Anh', time: '1 giờ trước', type: 'Template' },
  { title: 'Đề thi thử Hóa học 12', by: 'GV. Phạm Mai', time: '2 giờ trước', type: 'Đề thi' },
];

const barData = [
  { month: 'T10', value: 32, label: '₫32M' },
  { month: 'T11', value: 28, label: '₫28M' },
  { month: 'T12', value: 50, label: '₫50M' },
  { month: 'T1',  value: 40, label: '₫40M' },
  { month: 'T2',  value: 62, label: '₫62M' },
  { month: 'T3',  value: 48, label: '₫48M' },
];

const statusStyle = {
  'Thành công': 'bg-green-50 text-green-600',
  'Chờ TT':     'bg-yellow-50 text-yellow-600',
  'Thất bại':   'bg-red-50 text-red-500',
};

const ManagerHome = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-white/70 font-medium text-sm uppercase tracking-widest">Manager Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{greeting}, Quản lý! 📈</h1>
          <p className="text-white/80 text-sm mb-5">Tổng quan hoạt động kinh doanh — {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/manager/packages" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Package className="w-4 h-4" /> Quản lý gói
            </Link>
            <Link to="/manager/approvals" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Duyệt ({approvals.length})
            </Link>
            <Link to="/manager/orders" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={DollarSign} label="Doanh thu tháng này" value="₫48.2M" change="+12%" positive color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Users} label="Người dùng trả phí" value="312" change="+5%" positive color="text-teal-600" bg="bg-teal-50" />
        <StatCard icon={ShoppingCart} label="Đơn hàng hôm nay" value="24" change="+8%" positive color="text-cyan-600" bg="bg-cyan-50" />
        <StatCard icon={AlertTriangle} label="Chờ phê duyệt" value="4" change="-2" positive={false} color="text-orange-500" bg="bg-orange-50" />
      </div>

      {/* Revenue Chart + Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-800">Doanh thu 6 tháng gần đây</h2>
              <p className="text-xs text-gray-400 mt-0.5">Đơn vị: triệu đồng</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">+19% so với kỳ trước</span>
              <BarChart2 className="text-gray-300 w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end gap-2 h-44">
            {barData.map((bar, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === i && (
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{bar.label}</span>
                )}
                <div
                  className={`w-full rounded-t-xl transition-all duration-300 ${hoveredBar === i ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-gradient-to-t from-emerald-400/70 to-teal-300/70'}`}
                  style={{ height: `${bar.value / 0.65}%` }}
                />
                <span className="text-xs text-gray-400 font-medium">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell className="text-orange-500 w-5 h-5" />
              <h2 className="font-bold text-gray-800">Chờ phê duyệt</h2>
            </div>
            <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">{approvals.length}</span>
          </div>
          <div className="space-y-3">
            {approvals.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.by} · {a.time}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full flex-shrink-0">{a.type}</span>
              </div>
            ))}
          </div>
          <Link to="/manager/approvals" className="mt-4 block text-center text-sm text-emerald-600 font-bold hover:text-emerald-700 py-2 border border-dashed border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
            Xem tất cả →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-teal-500 w-5 h-5" />
            <h2 className="font-bold text-gray-800">Đơn hàng gần đây</h2>
          </div>
          <Link to="/manager/orders" className="text-sm text-emerald-600 font-bold hover:text-emerald-700">Xem tất cả →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Đơn hàng</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Khách hàng</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Gói</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Số tiền</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{order.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.pkg}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star className="text-amber-400 w-5 h-5" />
            <h2 className="font-bold text-gray-800">Hiệu suất gói dịch vụ</h2>
          </div>
          <Link to="/manager/packages" className="text-sm text-emerald-600 font-bold hover:text-emerald-700">Quản lý →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { name: 'Basic Monthly', count: 142, pct: 80, revenue: '₫21.3M', growth: '+15%' },
            { name: 'Premium Annual', count: 98, pct: 55, revenue: '₫117.6M', growth: '+22%' },
            { name: 'Team Plan', count: 61, pct: 35, revenue: '₫213.5M', growth: '+8%' },
            { name: 'Enterprise', count: 11, pct: 7, revenue: '₫110M', growth: '+3%' },
          ].map((pkg, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50/50 hover:bg-emerald-50/30 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-800">{pkg.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-bold">{pkg.growth}</span>
                  <span className="text-xs text-gray-500">{pkg.count} gói</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${pkg.pct}%` }} />
              </div>
              <p className="text-xs text-gray-400">Doanh thu: <span className="text-emerald-600 font-bold">{pkg.revenue}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
