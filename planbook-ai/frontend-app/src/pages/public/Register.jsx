import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ email, password, fullName });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      // Xử lý báo lỗi chi tiết từ Spring Boot (VD: "Mật khẩu tối thiểu 6 ký tự")
      if (err.response?.data?.errors) {
        // Backend trả về map các lỗi validation
        const errorMessages = Object.values(err.response.data.errors).join(' | ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    // Bọc ngoài cùng: Full màn hình, chia 2 cột trên máy tính (đảo ngược vị trí so với Login cho lạ)
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-white font-sans">
      
      {/* CỘT PHẢI - FORM ĐĂNG KÝ (Chiếm 45% chiều rộng) */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        
        {/* Logo & Tên dự án */}
        <div className="flex items-center justify-center mb-10 mt-8 md:mt-0">
          <div className="bg-purple-600 p-2 rounded-lg mr-3">
             {/* Icon mũ tốt nghiệp */}
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PlanbookAI</h1>
            <p className="text-xs text-gray-500">Teacher Registration</p>
          </div>
        </div>

        {/* Khung Form Đăng ký */}
        <div className="border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create an Account</h2>
          <p className="text-sm text-gray-500 mb-6">Join us to simplify your teaching workflow</p>

          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Họ và Tên */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Nguyen Van A" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">School Email</label>
              <input 
                type="email" 
                placeholder="your.email@school.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Hơn 6 ký tự..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

             {/* Xác nhận mật khẩu */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Nhập lại mật khẩu..." 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            {/* Nút Sign Up */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-lg mt-6 transition-colors ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Processing...' : 'Sign Up as Teacher'}
            </button>
          </form>

          {/* Hướng sang trang Đăng nhập */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>

      {/* CỘT TRÁI - ẢNH NỀN VÀ THỐNG KÊ (Chiếm 55% còn lại) */}
      <div className="hidden md:flex w-[55%] relative group overflow-hidden bg-gray-900 border-r-4 border-purple-500">
        
        {/* Ảnh nền */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop')" }}
        >
          {/* Lớp phủ màn đêm */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/80 via-transparent to-transparent"></div>
        </div>

        {/* Nội dung */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end items-start text-white p-16">
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 max-w-lg">
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              Start Your AI Journey
            </h2>
            <p className="text-md text-gray-200 mb-6">
              "Since using PlanbookAI, creating lesson plans takes me 15 minutes instead of 2 hours. The automated grading is a lifesaver."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 overflow-hidden border-2 border-white flex items-center justify-center font-bold text-xl">
                T
              </div>
              <div>
                <p className="font-semibold">Sarah Jenkins</p>
                <p className="text-xs text-gray-300">High School Chemistry Teacher</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Register;
