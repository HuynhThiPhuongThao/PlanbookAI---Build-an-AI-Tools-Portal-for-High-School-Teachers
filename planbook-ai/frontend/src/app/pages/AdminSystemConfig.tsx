import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bot, Users, Bell, Wrench, Save, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getFullNameFromToken } from '../utils/jwt';

interface SystemConfig {
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  allowTeacherRegister: boolean;
  maxLessonPlansPerDay: number;
  maxQuestionsPerDay: number;
  systemBanner: string;
  bannerEnabled: boolean;
  maintenanceMode: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  aiModel: 'gemini-2.5-flash',
  aiTemperature: 0.7,
  aiMaxTokens: 2048,
  allowTeacherRegister: true,
  maxLessonPlansPerDay: 10,
  maxQuestionsPerDay: 50,
  systemBanner: '',
  bannerEnabled: false,
  maintenanceMode: false,
};

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function AdminSystemConfig() {
  const navigate = useNavigate();
  const userName = getNameFromToken();
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    void loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosClient.get('/system-config');
      setConfig({ ...DEFAULT_CONFIG, ...response });
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được cấu hình hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await axiosClient.put('/system-config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không lưu được cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setSaved(false);
  };

  const sections = [
    {
      icon: Bot,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      title: 'Cài đặt AI Engine',
      desc: 'Điều chỉnh model và tham số sinh nội dung',
      content: (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gemini Model</label>
            <select
              value={config.aiModel}
              onChange={(e) => update('aiModel', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Temperature: <span className="font-bold text-purple-600">{config.aiTemperature}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={config.aiTemperature}
              onChange={(e) => update('aiTemperature', parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Output Tokens</label>
            <select
              value={config.aiMaxTokens}
              onChange={(e) => update('aiMaxTokens', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={1024}>1,024 token</option>
              <option value={2048}>2,048 token</option>
              <option value={4096}>4,096 token</option>
              <option value={8192}>8,192 token</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      title: 'Giới hạn người dùng',
      desc: 'Kiểm soát mức sử dụng và đăng ký',
      content: (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Cho phép giáo viên tự đăng ký</p>
              <p className="text-xs text-gray-400">Tắt nếu chỉ muốn admin tạo tài khoản</p>
            </div>
            <Toggle checked={config.allowTeacherRegister} onChange={() => update('allowTeacherRegister', !config.allowTeacherRegister)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Giáo án AI tối đa / ngày: <span className="font-bold text-purple-600">{config.maxLessonPlansPerDay}</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={config.maxLessonPlansPerDay}
              onChange={(e) => update('maxLessonPlansPerDay', Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Câu hỏi AI tối đa / ngày: <span className="font-bold text-purple-600">{config.maxQuestionsPerDay}</span>
            </label>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={config.maxQuestionsPerDay}
              onChange={(e) => update('maxQuestionsPerDay', Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      title: 'Thông báo hệ thống',
      desc: 'Banner hiển thị cho toàn bộ người dùng',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Hiển thị banner thông báo</p>
              <p className="text-xs text-gray-400">Banner sẽ hiện trên đầu trang</p>
            </div>
            <Toggle checked={config.bannerEnabled} onChange={() => update('bannerEnabled', !config.bannerEnabled)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung thông báo</label>
            <textarea
              value={config.systemBanner}
              onChange={(e) => update('systemBanner', e.target.value)}
              disabled={!config.bannerEnabled}
              className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Wrench,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      title: 'Bảo trì hệ thống',
      desc: 'Bật tắt chế độ bảo trì',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Chế độ bảo trì</p>
              <p className="text-xs text-gray-400">Khi bật, hệ thống sẽ báo đang bảo trì</p>
            </div>
            <Toggle checked={config.maintenanceMode} onChange={() => update('maintenanceMode', !config.maintenanceMode)} />
          </div>

          {config.maintenanceMode ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-xs font-medium text-red-700">
                Chế độ bảo trì đang bật. Người dùng sẽ bị giới hạn truy cập cho đến khi tắt.
              </p>
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Về Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cấu hình hệ thống</h1>
            <p className="text-gray-600 mt-1">Dữ liệu cấu hình được lưu tập trung ở backend.</p>
          </div>

          <div className="flex items-center gap-2">
            {saved ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Đã lưu
              </span>
            ) : null}
            <Button variant="outline" onClick={handleReset} className="gap-1.5" disabled={saving || loading}>
              <RotateCcw className="w-4 h-4" /> Reset mặc định
            </Button>
            <Button onClick={handleSave} className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700" disabled={saving || loading}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu cấu hình
            </Button>
          </div>
        </div>

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải cấu hình hệ thống...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {sections.map((section) => (
                <Card key={section.title} className={`border ${section.border}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${section.bg} rounded-lg p-2`}>
                        <section.icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription className="text-xs">{section.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>{section.content}</CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardContent className="pb-4 pt-4">
                <p className="text-center text-xs text-gray-500">
                  Cấu hình này đang được đọc/ghi qua API `GET/PUT /api/system-config` của `curriculum-service`.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
