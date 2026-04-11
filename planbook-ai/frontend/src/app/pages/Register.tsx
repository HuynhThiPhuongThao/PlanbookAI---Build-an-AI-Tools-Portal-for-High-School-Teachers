import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap, CheckCircle, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email checking states
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'exists'>('idle');
  const [emailCheckMsg, setEmailCheckMsg] = useState('');

  // Debounced email validation (1 giây sau khi user dừng nhập)
  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailCheckStatus('idle');
      setEmailCheckMsg('');
      return;
    }

    setEmailCheckStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const response = await authApi.checkEmailExists(email);
        // Nếu API return 200 = email tồn tại
        if (response.data.exists) {
          setEmailCheckStatus('exists');
          setEmailCheckMsg('Email này đã được đăng ký');
        } else {
          setEmailCheckStatus('available');
          setEmailCheckMsg('Email có sẵn ✓');
        }
      } catch (error: any) {
        // Nếu 404 hoặc error = email chưa đăng ký
        if (error.response?.status === 404) {
          setEmailCheckStatus('available');
          setEmailCheckMsg('Email có sẵn ✓');
        } else {
          setEmailCheckStatus('idle');
          setEmailCheckMsg('');
        }
      }
    }, 1000); // Debounce 1 giây

    return () => clearTimeout(timer);
  }, [email]);

  // Clear error message khi email status thay đổi
  useEffect(() => {
    if (emailCheckStatus !== 'idle' && emailCheckStatus !== 'checking') {
      // Nếu email có status cụ thể (available/exists), clear generic error
      // vì email indicator đã nói rõ tình trạng
      if (errorMsg.includes('Email')) {
        setErrorMsg('');
      }
    }
  }, [emailCheckStatus]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!email || !password || !confirmPassword || !fullName) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check email status - không show error msg nếu email exists, vì email indicator đã hiển thị
    if (emailCheckStatus === 'exists') {
      return; // Block submit silently, email indicator sẽ hướng dẫn user
    }

    if (emailCheckStatus === 'checking') {
      setErrorMsg('Đang kiểm tra email... Vui lòng đợi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API Gateway -> Auth Service
      const response = await authApi.register({
        email,
        password,
        fullName,
        // Role mặc định là TEACHER - chỉ admin có thể thay đổi role sau
      });

      setSuccessMsg('Đăng ký thành công! Chuyển hướng đến đăng nhập...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('=== Register Error ===');
      console.error('Full error:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Left Panel - Register Form */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-2xl font-bold">PlanBookAI</CardTitle>
            </div>
            <CardDescription className="text-base">Tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email *</Label>
                  {emailCheckStatus === 'checking' && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </div>
                  )}
                  {emailCheckStatus === 'available' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Email có sẵn</span>
                    </div>
                  )}
                  {emailCheckStatus === 'exists' && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Email đã được dùng</span>
                    </div>
                  )}
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@planbook.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={
                    emailCheckStatus === 'exists'
                      ? 'border-red-500 focus:border-red-500'
                      : emailCheckStatus === 'available'
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ít nhất 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  {successMsg}
                </div>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-10"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
              </Button>


            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Đăng nhập
              </button>
            </p>
          </CardContent>
        </Card>

        {/* Right Panel - Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 text-white bg-gradient-to-b from-transparent to-black/30 rounded-lg p-8">
          <div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              🎓 Công cụ AI<br />cho Giáo viên<br />Hiệu Năng
            </h2>
            <p className="text-lg opacity-95 leading-relaxed">
              Tiết kiệm thời gian lên kế hoạch bài học, tạo đề thi, và chấm điểm tự động.
              Hãy để AI đảm nhận công việc nhàm chán để mày tập trung vào những điều quan trọng -
              dạy học sinh hiệu quả.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl font-black mb-2">90%</div>
              <p className="text-sm font-medium opacity-90">Tiết kiệm<br />thời gian chấm</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl font-black mb-2">1000+</div>
              <p className="text-sm font-medium opacity-90">Câu hỏi<br />trong ngân hàng</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl font-black mb-2">50+</div>
              <p className="text-sm font-medium opacity-90">Kế hoạch<br />bài học mẫu</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl font-black mb-2">OCR</div>
              <p className="text-sm font-medium opacity-90">Chấm điểm<br />tự động</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 text-sm">
            <p className="font-semibold mb-2">✨ Tính năng nổi bật:</p>
            <ul className="space-y-1 text-opacity-90 text-white">
              <li>• Lập kế hoạch bài học tự động với AI Gemini</li>
              <li>• Tạo đề thi & câu hỏi trong vài giây</li>
              <li>• Chấm điểm bài tự luận bằng OCR + AI</li>
              <li>• Quản lý lớp học trực tuyến</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
