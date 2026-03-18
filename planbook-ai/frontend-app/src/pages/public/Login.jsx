import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.login({ email, password });
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      if (response.data.role) {
        localStorage.setItem('userRole', response.data.role);
      }
      // Chuyển hướng
      alert('Login successful!');
      navigate('/'); // Tạm thời redirect về trang chủ báo thành công
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).join(' | ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    // Bọc ngoài cùng: Full màn hình, chia 2 cột trên máy tính
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* CỘT TRÁI - FORM ĐĂNG NHẬP (Chiếm 45% chiều rộng) */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        
        {/* Logo & Tên dự án (Góc trên cùng - hoặc gom vào giữa cũng được) */}
        <div className="flex items-center justify-center mb-10 mt-8 md:mt-0">
          <div className="bg-purple-600 p-2 rounded-lg mr-3">
             {/* Icon mũ tốt nghiệp giả lập */}
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PlanbookAI</h1>
            <p className="text-xs text-gray-500">AI Tools Portal for Teachers</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mb-8 max-w-sm mx-auto">
          Empowering high school teachers with intelligent tools for lesson planning, assessment creation, and grading.
        </p>

        {/* Khung Form có viền tròn - Giống trong Figma */}
        <div className="border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to access your dashboard</p>

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Chọn Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Login as</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                <option>Teacher</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
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
                  placeholder="••••••••" 
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center text-sm text-gray-700 font-medium">
                <input type="checkbox" className="w-4 h-4 mr-2 rounded text-purple-600 border-gray-300 focus:ring-purple-500" />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">Forgot password?</a>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            {/* Nút Sign In (Màu tím bo góc) */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-lg mt-4 transition-colors ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-6">
              New to PlanbookAI?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>

        {/* Cục thông báo Powered by AI */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <div className="text-blue-500 mt-1">✨</div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Powered by AI</h4>
            <p className="text-xs text-blue-600/80 leading-relaxed mt-1">
              PlanbookAI uses Gemini AI to help you create lesson plans, generate exam questions, and automate grading tasks.
            </p>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI - ẢNH NỀN VÀ THỐNG KÊ (Chiếm 55% còn lại) */}
      <div className="hidden md:flex w-[55%] relative group overflow-hidden bg-gray-900">
        
        {/* Mày phải tự tìm 1 cái ảnh đập vào đây. Tạm thời tao lấy ảnh Placeholder giả lập cô giáo VR.
            Nếu có ảnh thật, sài: style={{backgroundImage: "url('/src/assets/hinh.jpg')"}} 
        */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop')" }}
        >
          {/* Lớp phủ sương mù nhẹ */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
        </div>

        {/* Nội dung đè lên text to bự */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-white px-12 text-center">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Transform Your<br/>Teaching Experience
          </h2>
          <p className="text-lg text-gray-200 mb-12 max-w-md drop-shadow-md">
            Save hours every week with AI-powered lesson planning, automated grading, and intelligent question bank management.
          </p>

          {/* Dàn Grid 4 khối kính mờ (Glassmorphism) như trên hình */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            
            {/* Box 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-left hover:bg-white/20 transition-all">
              <h3 className="text-3xl font-bold mb-1">90%</h3>
              <p className="text-sm text-gray-200">Time saved on grading</p>
            </div>
            
            {/* Box 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-left hover:bg-white/20 transition-all">
              <h3 className="text-3xl font-bold mb-1">1000+</h3>
              <p className="text-sm text-gray-200">Questions in database</p>
            </div>
            
            {/* Box 3 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-left hover:bg-white/20 transition-all">
              <h3 className="text-3xl font-bold mb-1">50+</h3>
              <p className="text-sm text-gray-200">Sample lesson plans</p>
            </div>
            
            {/* Box 4 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-left hover:bg-white/20 transition-all">
              <h3 className="text-3xl font-bold mb-1">OCR</h3>
              <p className="text-sm text-gray-200">Automated grading</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
