import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TeacherBillingPage from './pages/teacher/BillingPage';
import ManagerPackagesPage from './pages/manager/PackagesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar đơn giản */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">PlanbookAI Package</h1>
              <div className="flex gap-6 text-sm">
                <Link to="/teacher/billing" className="hover:text-blue-600">Teacher - Billing</Link>
                <Link to="/manager/packages" className="hover:text-blue-600">Manager - Packages</Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/teacher/billing" element={<TeacherBillingPage />} />
          <Route path="/manager/packages" element={<ManagerPackagesPage />} />
          <Route path="/" element={
            <div className="container mx-auto py-20 text-center">
              <h1 className="text-5xl font-bold mb-6">Package Service Frontend</h1>
              <p className="text-xl text-gray-600 mb-10">
                Chọn vai trò để test chức năng
              </p>
              <div className="flex justify-center gap-6">
                <Link 
                  to="/teacher/billing" 
                  className="btn btn-primary px-8 py-4 text-lg"
                >
                  Teacher - Xem & Mua gói
                </Link>
                <Link 
                  to="/manager/packages" 
                  className="btn btn-secondary px-8 py-4 text-lg"
                >
                  Manager - Quản lý gói
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
