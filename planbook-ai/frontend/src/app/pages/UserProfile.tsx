import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';
import { Camera, Edit2, Save, X, Loader2, Lock } from 'lucide-react';
import { getAccessTokenPayload } from '../utils/jwt';

// Helper: giải mã JWT để lấy role mà thềm cần layout đúng khi chưa load xong profile
function getRoleFromToken(): string {
  const payload = getAccessTokenPayload();
  return (payload.role || 'teacher').toLowerCase();
}

interface ProfileData {
  userId: number;
  email: string;
  fullName: string;
  role: 'TEACHER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'STUDENT';
  avatarUrl: string | null;
  phoneNumber: string;
  schoolName: string;
  subjectSpecialty: string;
  bio: string;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State quản lý Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  // State copy ra để chứa data đang edit (FormData)
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});
  // Trạng thái preview ảnh khi chọn file local (chứa Base64)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State đổi mật khẩu (Chỉ Teacher mới thấy UI này)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isSavingPw, setIsSavingPw] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getMe();
      setProfile(data as any);
      setEditForm(data as any);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    // Khi bấm Edit, luôn đồng bộ form với profile hiện tại phòng hờ
    setEditForm(profile || {});
    setAvatarPreview(null); // Xóa preview nếu có
    setIsEditing(true);
    setSuccess('');
    setError('');
  };

  const handleCancelClick = () => {
    // Hủy bỏ việc chỉnh sửa, xóa hết các thay đổi chưa lưu
    setEditForm(profile || {});
    setAvatarPreview(null);
    setIsEditing(false);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Gửi request cập nhật (avatarPreview chính là ảnh Base64)
      const data = await userApi.updateProfile({
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        schoolName: editForm.schoolName,
        subjectSpecialty: editForm.subjectSpecialty,
        bio: editForm.bio,
        avatarUrl: avatarPreview || profile.avatarUrl || null
      });

      // Backend trả về profile đã lưu
      setProfile(data as any);
      setIsEditing(false);
      setSuccess('Cập nhật hồ sơ thành công!');

      // Báo hiệu cho DashboardLayout cập nhật tên và avatar ngay lập tức
      const updatedData = data as any;
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          fullName: updatedData.fullName || editForm.fullName,
          avatarUrl: updatedData.avatarUrl || avatarPreview || null
        }
      }));

      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
      setError('Lưu thất bại. Vui lòng kiểm tra lại đường truyền.');
    } finally {
      setSaving(false);
    }
  };

  // ----- Xử lý Upload Ảnh Đại Diện -----
  const handleAvatarClick = () => {
    if (!isEditing) return; // Chỉ cho duyệt file khi đang ở chế độ Edit
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giả lập hiệu ứng tải ảnh
    setIsUploading(true);

    // Đọc file thành Data URL (Base64) để lưu vào DB và preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setTimeout(() => {
        setAvatarPreview(result); // Hiển thị preview ngay lập tức
        setIsUploading(false);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    const tokenRole = getRoleFromToken();
    return (
      <DashboardLayout role={tokenRole as any} userName="...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    const tokenRole = getRoleFromToken();
    return (
      <DashboardLayout role={tokenRole as any} userName="">
        <div className="text-center text-red-500 mt-10">{error}</div>
      </DashboardLayout>
    );
  }

  // Fallback avatar là chữ cái đầu
  const userInitial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U';
  // Ảnh hiển thị: ưu tiên Ảnh vừa chọn (preview) -> Ảnh trong DataBase -> Rỗng (dùng Fallback)
  const currentDisplayAvatar = avatarPreview || profile.avatarUrl || '';

  return (
    <DashboardLayout role={profile.role.toLowerCase() as any} userName={profile.fullName}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Banner + Avatar Section */}
        <div className="relative">
          {/* Cover background */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm" />

          <div className="absolute -bottom-12 left-8 flex items-end gap-4">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-white">
                <AvatarImage src={currentDisplayAvatar} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-700">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              {/* Icon đổi ảnh hiển thị khi đang Edit Mode */}
              {isEditing && (
                <div
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
            </div>

            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-sm font-medium text-gray-500">{profile.role}</p>
            </div>
          </div>

          {/* Nút bật tắt chế độ Edit góc phải */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={handleEditClick} className="shadow-sm">
                <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelClick} className="bg-white/90">
                  <X className="w-4 h-4 mr-2" /> Hủy
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="shadow-sm bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Cục để chọn file (ẩn) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Thông báo */}
        {error && <div className="mt-16 bg-red-50 text-red-600 p-3 rounded border border-red-100 text-sm">{error}</div>}
        {success && <div className="mt-16 bg-green-50 text-green-600 p-3 rounded border border-green-100 text-sm">{success}</div>}

        {/* Form chi tiết */}
        <div className={error || success ? "mt-4" : "mt-16"}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin của bạn để thuận tiện liên lạc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Hàng 1: Email (Luôn khóa) & Tên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email đăng nhập</Label>
                  <Input id="email" value={profile.email} disabled className="bg-gray-100 cursor-not-allowed text-gray-500" />
                  <p className="text-xs text-gray-400">Email không thể thay đổi</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={isEditing ? editForm.fullName || '' : profile.fullName || ''}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-gray-50 border-transparent focus-visible:ring-0" : ""}
                  />
                </div>
              </div>

              {/* Hàng 2: SĐT và Trường học (Ẩn trường học nếu không phải Teacher/Student) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={isEditing ? editForm.phoneNumber || '' : profile.phoneNumber || ''}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Nhập số điện thoại..."
                    className={!isEditing ? "bg-gray-50 border-transparent focus-visible:ring-0" : ""}
                  />
                </div>

                {['TEACHER', 'STUDENT'].includes(profile.role) && (
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Tên trường công tác</Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      value={isEditing ? editForm.schoolName || '' : profile.schoolName || ''}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="Nhập tên trường..."
                      className={!isEditing ? "bg-gray-50 border-transparent focus-visible:ring-0" : ""}
                    />
                  </div>
                )}
              </div>

              {/* Hàng 3: Chuyên môn (Ẩn nếu không phải Teacher/Student) */}
              {['TEACHER', 'STUDENT'].includes(profile.role) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="subjectSpecialty">Môn giảng dạy/Chuyên môn</Label>
                    <Input
                      id="subjectSpecialty"
                      name="subjectSpecialty"
                      value={isEditing ? editForm.subjectSpecialty || '' : profile.subjectSpecialty || ''}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="Ví dụ: Toán, Lý, Hóa..."
                      className={!isEditing ? "bg-gray-50 border-transparent focus-visible:ring-0" : ""}
                    />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ==== ĐỔI MẬT KHẨU — Mọi role đều được đổi ==== */}
        <div>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </div>
                <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pwError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{pwSuccess}</p>}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại..."
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Tối thiểu 6 ký tự..."
                      value={pwForm.newPassword}
                      onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu mới..."
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button
                  onClick={async () => {
                    setPwError('');
                    setPwSuccess('');
                    if (!pwForm.currentPassword || !pwForm.newPassword) {
                      setPwError('Vui lòng điền đầy đủ thông tin.');
                      return;
                    }
                    if (pwForm.newPassword !== pwForm.confirmPassword) {
                      setPwError('Mật khẩu xác nhận không khớp!');
                      return;
                    }
                    if (pwForm.newPassword.length < 6) {
                      setPwError('Mật khẩu mới phải ít nhất 6 ký tự.');
                      return;
                    }
                    try {
                      setIsSavingPw(true);
                      await authApi.changePassword({
                        currentPassword: pwForm.currentPassword,
                        newPassword: pwForm.newPassword
                      });
                      setPwSuccess('Đổi mật khẩu thành công!');
                      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    } catch (e: any) {
                      setPwError(e?.response?.data?.message || e?.message || 'Mật khẩu hiện tại không đúng.');
                    } finally {
                      setIsSavingPw(false);
                    }
                  }}
                  disabled={isSavingPw}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingPw ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                  Xác nhận đổi mật khẩu
                </Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
