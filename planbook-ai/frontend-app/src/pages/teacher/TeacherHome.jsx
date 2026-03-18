import React from 'react';

const TeacherHome = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng Giáo viên! 👋</h1>
      <p className="text-gray-600 mb-8">Đây là nơi bạn quản lý giáo án và bài kiểm tra của mình.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Giáo án đã tạo</h3>
          <p className="text-3xl font-bold text-purple-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Đề thi đang đợi</h3>
          <p className="text-3xl font-bold text-blue-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Lớp học quản lý</h3>
          <p className="text-3xl font-bold text-green-600">4</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
