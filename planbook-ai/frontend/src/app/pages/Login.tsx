import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle, GraduationCap, Sparkles, Eye, EyeOff, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { authApi } from '../api/authApi';
import { authStorage } from '../api/axiosClient';

type LoginNotice = {
  type: 'locked' | 'expired';
  title: string;
  message: string;
};

const defaultLockedNotice: LoginNotice = {
  type: 'locked',
  title: 'Tài khoản đã bị khóa',
  message: 'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên để được mở lại.',
};

const isLockedLoginError = (message: string, status?: number) => {
  const text = String(message || '').toLowerCase();
  return (
    status === 403 ||
    text.includes('khóa') ||
    text.includes('khoa') ||
    text.includes('vô hiệu') ||
    text.includes('vo hieu') ||
    text.includes('locked') ||
    text.includes('disabled')
  );
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginNotice, setLoginNotice] = useState<LoginNotice | null>(null);

  useEffect(() => {
    try {
      const rawNotice = localStorage.getItem('auth_notice');
      if (!rawNotice) return;
      const parsed = JSON.parse(rawNotice);
      setLoginNotice({
        type: parsed.type === 'expired' ? 'expired' : 'locked',
        title: parsed.title || defaultLockedNotice.title,
        message: parsed.message || defaultLockedNotice.message,
      });
      localStorage.removeItem('auth_notice');
    } catch {
      localStorage.removeItem('auth_notice');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await authApi.login({ email, password });

      const token = (response as any).token || (response as any).accessToken;
      const refreshToken = (response as any).refreshToken;
      if (!token) {
        setErrorMsg('Đăng nhập thành công nhưng không tìm thấy token!');
        return;
      }

      authStorage.saveTokens({
        accessToken: token,
        refreshToken: refreshToken || null,
      });

      // Decode JWT để lấy role THẬT từ backend, không dựa vào dropdown nữa
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(
          atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        ));
        const role = (payload.role || 'teacher').toLowerCase();
        navigate(`/${role}`);
      } catch {
        // Nếu decode thất bại thì về teacher làm mặc định
        navigate('/teacher');
      }

    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error || '';
      if (isLockedLoginError(serverMessage, error.response?.status)) {
        setLoginNotice(defaultLockedNotice);
        setErrorMsg('Tài khoản đã bị khóa.');
      } else {
        setErrorMsg(serverMessage || 'Sai email hoặc mật khẩu!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {loginNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`flex items-start gap-3 px-6 py-5 ${
              loginNotice.type === 'locked'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              <div className={`mt-0.5 rounded-full p-2 ${
                loginNotice.type === 'locked' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{loginNotice.title}</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">{loginNotice.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setLoginNotice(null)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/80 hover:text-gray-700"
                aria-label="Đóng thông báo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-end px-6 py-4">
              <Button
                type="button"
                onClick={() => setLoginNotice(null)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900">PlanbookAI</h1>
                <p className="text-sm text-gray-500">AI Tools Portal for Teachers</p>
              </div>
            </div>
            <p className="text-gray-600">
              Empowering high school teachers with intelligent tools for lesson planning, assessment creation, and grading.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {isLoading ? 'Đang kiểm tra...' : 'Sign In'}
                </Button>

                {/* Hiển thị lỗi nếu có */}
                {errorMsg && (
                  <div className="text-sm font-medium text-red-500 text-center mt-2">
                    {errorMsg}
                  </div>
                )}
              </form>


              <div className="mt-4 text-center text-sm">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Đăng ký ngay
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Powered by AI</p>
                <p className="text-blue-700">
                  PlanbookAI uses Gemini AI to help you create lesson plans, generate exam questions, and automate grading tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1771765764892-91f2ed4ddbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwdGVhY2hlciUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzI2MDgzMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Teacher using technology in classroom"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center max-w-2xl">
            <h2 className="text-5xl font-bold mb-6">Transform Your Teaching Experience</h2>
            <p className="text-xl text-blue-100 mb-8">
              Save hours every week with AI-powered lesson planning, automated grading, and intelligent question bank management.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">90%</div>
                <div className="text-blue-100">Time saved on grading</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">1000+</div>
                <div className="text-blue-100">Questions in database</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-blue-100">Sample lesson plans</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">OCR</div>
                <div className="text-blue-100">Automated grading</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
