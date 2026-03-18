import React, { useState } from 'react';
import {
  FileText, Database, Sparkles, PenLine, CheckSquare, Zap,
  Clock, TrendingUp, BookOpen, HelpCircle, Medal, BarChart2,
  Plus, ChevronRight, Calendar, Target, Activity, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: FileText,   label: 'Templates đã tạo',      value: '48',  sub: 'tháng này', change: '+14', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  { icon: Database,   label: 'Câu hỏi trong kho',      value: '892', sub: '+89 tuần này', change: '+89', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { icon: CheckSquare,label: 'Hoàn thành hôm nay',    value: '6',   sub: '/ 9 tasks', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  { icon: Clock,      label: 'Chờ phê duyệt',          value: '3',   sub: 'cần xử lý', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
];

const recentTemplates = [
  { name: 'Giáo án Toán 10 - Hàm số bậc 2', subject: 'Toán học', time: '2 giờ trước', status: 'Đã duyệt', views: 24 },
  { name: 'Template Văn học 11 - Truyện Kiều', subject: 'Ngữ văn', time: 'Hôm qua', status: 'Đã duyệt', views: 18 },
  { name: 'Giáo án Vật lý 12 - Điện xoay chiều', subject: 'Vật lý', time: '2 ngày trước', status: 'Chờ duyệt', views: 0 },
  { name: 'Câu hỏi trắc nghiệm Hóa học 10', subject: 'Hóa học', time: '3 ngày trước', status: 'Đã duyệt', views: 51 },
];

const todos = [
  { task: 'Review 20 câu hỏi Lịch sử mới', done: true, priority: 'cao' },
  { task: 'Cập nhật prompt AI cho môn Hóa học', done: true, priority: 'cao' },
  { task: 'Soạn thêm 15 câu hỏi Địa lý 12', done: false, priority: 'trung bình' },
  { task: 'Duyệt template giáo án từ team', done: false, priority: 'cao' },
  { task: 'Viết hướng dẫn sử dụng OCR', done: false, priority: 'thấp' },
  { task: 'Backup ngân hàng câu hỏi tuần này', done: false, priority: 'thấp' },
];

const priorityStyle = {
  'cao':      'bg-red-50 text-red-500',
  'trung bình': 'bg-yellow-50 text-yellow-600',
  'thấp':     'bg-gray-100 text-gray-500',
};

const subjectColors = {
  'Toán học': 'bg-blue-50 text-blue-600',
  'Ngữ văn':  'bg-pink-50 text-pink-600',
  'Vật lý':   'bg-cyan-50 text-cyan-600',
  'Hóa học':  'bg-emerald-50 text-emerald-600',
};

const StaffHome = () => {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const [checkedTodos, setCheckedTodos] = useState(todos.map(t => t.done));

  const toggleTodo = (i) => {
    setCheckedTodos(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const doneCount = checkedTodos.filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-white/70 font-medium text-sm uppercase tracking-widest">Staff Workspace</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{greeting}, Nhân viên nội dung! 🛠️</h1>
          <p className="text-white/80 text-sm mb-5">Xây dựng nội dung chất lượng cho toàn bộ hệ thống PlanbookAI</p>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-2xl p-4 mb-4 max-w-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Tiến độ hôm nay</span>
              <span className="font-bold">{doneCount}/{todos.length} tasks</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / todos.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/staff/templates" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tạo Template
            </Link>
            <Link to="/staff/bank" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Database className="w-4 h-4" /> Ngân hàng câu hỏi
            </Link>
            <Link to="/staff/prompts" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Prompts
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white p-5 rounded-2xl border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`${s.bg} p-2.5 rounded-xl`}>
                <s.icon className={`${s.color} w-5 h-5`} />
              </div>
              {s.change && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.change} ↑</span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Flame className="text-violet-500 w-5 h-5" /> Công cụ nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/staff/templates', icon: FileText,  label: 'Tạo Template giáo án', desc: 'Soạn mẫu giáo án chuẩn cho giáo viên dùng chung', color: 'from-violet-500 to-purple-600', badge: '14 tuần này' },
            { to: '/staff/bank',      icon: Database,  label: 'Ngân hàng câu hỏi',    desc: 'Thêm câu hỏi chất lượng vào kho kiến thức chung', color: 'from-indigo-500 to-blue-600', badge: '89 câu mới' },
            { to: '/staff/prompts',   icon: Sparkles,  label: 'Quản lý AI Prompts',   desc: 'Tối ưu các prompt AI giúp giáo viên soạn bài hiệu quả', color: 'from-fuchsia-500 to-violet-600', badge: '3 cập nhật' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden relative"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color}`} />
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${item.color}`}>
                <item.icon className="text-white w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 group-hover:text-violet-600 transition-colors mb-1">{item.label}</h3>
              <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-2 py-1 rounded-lg">{item.badge}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Work + Todo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Templates */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <PenLine className="text-violet-500 w-5 h-5" />
              <h2 className="font-bold text-gray-800">Công việc gần đây</h2>
            </div>
            <Link to="/staff/templates" className="text-xs text-violet-600 font-bold hover:text-violet-700">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTemplates.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-violet-500 w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${subjectColors[item.subject] || 'bg-gray-100 text-gray-500'}`}>{item.subject}</span>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.status === 'Đã duyệt' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {item.status}
                  </span>
                  {item.views > 0 && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span>👁️</span> {item.views}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Target className="text-indigo-500 w-5 h-5" />
              <h2 className="font-bold text-gray-800">Công việc hôm nay</h2>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded-full">{doneCount}/{todos.length}</span>
          </div>
          <div className="divide-y divide-gray-50 p-2">
            {todos.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleTodo(i)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checkedTodos[i] ? 'bg-violet-600 border-violet-600' : 'border-gray-300 hover:border-violet-400'}`}>
                  {checkedTodos[i] && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className={`text-sm flex-1 transition-colors ${checkedTodos[i] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.task}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityStyle[item.priority]}`}>{item.priority}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-50">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / todos.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{Math.round((doneCount / todos.length) * 100)}% hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="text-violet-500 w-5 h-5" />
          <h2 className="font-bold text-gray-800">Hiệu suất tuần này</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Templates tạo mới', value: 14, target: 20, color: 'bg-violet-500' },
            { label: 'Câu hỏi thêm vào kho', value: 89, target: 100, color: 'bg-indigo-500' },
            { label: 'Nội dung được duyệt', value: 11, target: 15, color: 'bg-green-500' },
            { label: 'Tasks hoàn thành', value: doneCount, target: todos.length, color: 'bg-orange-400' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
              <p className="text-xs text-gray-500 mb-3">{item.label}</p>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">/ {item.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
