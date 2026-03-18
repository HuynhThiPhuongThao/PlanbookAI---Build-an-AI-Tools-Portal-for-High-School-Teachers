import React from 'react';
import { Users, GraduationCap, ShieldAlert, Activity, TrendingUp, FileWarning, Settings2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5`}>
    <div className={`${bg} p-3 rounded-xl`}>
      <Icon className={`${color} w-6 h-6`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon: Icon, label, desc, color }) => (
  <Link to={to} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4 group">
    <div className={`${color} p-2.5 rounded-xl`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  </Link>
);

const AdminHome = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 opacity-80" />
          <span className="text-white/70 font-medium text-sm uppercase tracking-widest">Admin Portal</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">{greeting}, Quản trị viên! 🔐</h1>
        <p className="text-white/80 text-sm">Toàn quyền kiểm soát hệ thống PlanbookAI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Tổng người dùng" value="248" color="text-red-600" bg="bg-red-50" />
        <StatCard icon={GraduationCap} label="Giáo viên đang hoạt động" value="183" color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Activity} label="Phiên đăng nhập hôm nay" value="91" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={FileWarning} label="Báo cáo chờ duyệt" value="7" color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink to="/admin/users" icon={Users} label="Quản lý người dùng" desc="Thêm, sửa, xóa tài khoản người dùng" color="bg-red-500" />
          <QuickLink to="/admin/curriculum" icon={GraduationCap} label="Quản lý chương trình học" desc="Cập nhật tài liệu, môn học, cấp học" color="bg-orange-500" />
          <QuickLink to="/admin/logs" icon={Activity} label="Nhật ký hệ thống" desc="Theo dõi hoạt động và lỗi xảy ra" color="bg-blue-500" />
          <QuickLink to="/admin/settings" icon={Settings2} label="Cài đặt hệ thống" desc="Cấu hình chung, giới hạn dịch vụ" color="bg-purple-500" />
          <QuickLink to="/admin/users" icon={ShieldAlert} label="Quản lý phân quyền" desc="Cấp và thu hồi quyền truy cập" color="bg-rose-500" />
          <QuickLink to="/admin/logs" icon={Eye} label="Giám sát realtime" desc="Dashboard theo dõi hệ thống realtime" color="bg-indigo-500" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
          <span className="text-xs text-gray-400">Hôm nay</span>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Người dùng mới đăng ký', user: 'nguyen.gv@truong.edu.vn', time: '5 phút trước', dot: 'bg-green-400' },
            { action: 'Báo cáo nội dung bị gắn cờ', user: 'ID: lesson_4829', time: '22 phút trước', dot: 'bg-yellow-400' },
            { action: 'Tài khoản bị khóa tự động', user: 'tran.user@gmail.com', time: '1 giờ trước', dot: 'bg-red-400' },
            { action: 'Gói Premium được kích hoạt', user: 'dinh.gv@pthn.edu.vn', time: '2 giờ trước', dot: 'bg-blue-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.action}</p>
                <p className="text-xs text-gray-500">{item.user}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
