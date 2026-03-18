import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  School, 
  Phone, 
  ShieldCheck, 
  Calendar,
  Camera,
  Edit2,
  Save,
  XCircle,
  Loader2,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import userApi from '../../api/userApi';
import { authApi } from '../../api/authApi';

const Profile = () => {
  const { userProfile, refreshProfile } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // State quản lý hiển thị Passwords (Mắt)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    schoolName: '',
    bio: '',
    avatarUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const animalAvatars = [
    { name: 'Mèo', emoji: '🐱' },
    { name: 'Chó', emoji: '🐶' },
    { name: 'Gấu Trúc', emoji: '🐼' },
    { name: 'Cáo', emoji: '🦊' },
    { name: 'Thỏ', emoji: '🐰' },
    { name: 'Hổ', emoji: '🐯' },
    { name: 'Gấu', emoji: '🐻' },
    { name: 'Sư Tử', emoji: '🦁' },
    { name: 'Heo', emoji: '🐷' },
  ];

  const BACKEND_URL = 'http://localhost:8082';

  useEffect(() => {
    if (userProfile) {
      // Nếu avatarUrl là đường dẫn tương đối /uploads/... thì thêm prefix backend
      let avatarUrl = userProfile.avatarUrl || '';
      if (avatarUrl.startsWith('/uploads/')) {
        avatarUrl = `${BACKEND_URL}${avatarUrl}`;
      }
      setEditForm({
        fullName: userProfile.fullName || '',
        phoneNumber: userProfile.phoneNumber || '',
        schoolName: userProfile.schoolName || '',
        bio: userProfile.bio || '',
        avatarUrl
      });
    }
  }, [userProfile]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Kiem tra avatarUrl co phai emoji hay khong
  // Anh that luon bat dau bang http, /, hoac data:
  const isEmojiAvatar = (str) => {
    if (!str) return false;
    return !str.startsWith('http') && !str.startsWith('/') && !str.startsWith('data:');
  };


  const handleSave = async () => {
    try {
      setLoading(true);
      await userApi.updateMe(editForm);
      await refreshProfile();
      setIsEditing(false);
      setError(null);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật profile:', err);
      setError('Cập nhật thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      setLoading(true);
      await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = (url) => {
    setEditForm({ ...editForm, avatarUrl: url });
    setShowAvatarPicker(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
      return;
    }

    // Bước 1: Dùng FileReader show preview NGAY - KHÔNG cần backend
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result; // chuỗi base64 data:image/...;base64,...
      setEditForm(prev => ({ ...prev, avatarUrl: dataUrl }));
      setShowAvatarPicker(false);

      // Bước 2: Thử upload lên backend (nếu user-service đang chạy)
      try {
        const response = await userApi.uploadAvatar(file);
        // Upload thành công → cập nhật URL server thay thế base64
        const fullUrl = `http://localhost:8082${response.data.avatarUrl}`;
        setEditForm(prev => ({ ...prev, avatarUrl: fullUrl }));
        await refreshProfile();
      } catch {
        // Upload thất bại → giữ nguyên base64 preview, vẫn lưu đc qua Lưu thay đổi
        console.warn('Backend unavailable, using local preview only.');
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!userProfile && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-gray-500 font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center">
        <p className="text-red-600 font-bold text-xl mb-4">Lỗi kết nối</p>
        <p className="text-red-500 mb-6">{error}</p>
        <button 
          onClick={refreshProfile}
          className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER SECTION */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-lg"></div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-tr from-purple-500 to-blue-500">
              {editForm.avatarUrl ? (
                isEmojiAvatar(editForm.avatarUrl) ? (
                  <span className="text-5xl leading-none select-none">{editForm.avatarUrl}</span>
                ) : (
                  <img
                    src={editForm.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setEditForm(prev => ({ ...prev, avatarUrl: '' }))}
                  />
                )
              ) : (
                <span>{getInitials(userProfile?.fullName)}</span>
              )}
            </div>
            {(isEditing || showAvatarPicker) && (
              <button 
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-purple-600 transition-colors z-20"
              >
                <Camera size={18} />
              </button>
            )}

            {/* Avatar Picker Dropdown */}
            {showAvatarPicker && (
              <div className="absolute top-36 left-0 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-30 w-64 animate-in zoom-in-95 duration-200">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 px-2">Chọn ảnh đại diện</p>
                <div className="grid grid-cols-3 gap-3">
                  {animalAvatars.map(av => (
                    <button 
                      key={av.name} 
                      onClick={() => selectAvatar(av.emoji)}
                      title={av.name}
                      className="w-full aspect-square rounded-xl hover:bg-purple-50 flex items-center justify-center text-3xl transition-all border border-transparent hover:border-purple-200"
                    >
                      {av.emoji}
                    </button>
                  ))}
                  <div className="col-span-3 mt-2 flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer transition-colors w-full">
                      <Upload size={14} /> Tải ảnh từ máy
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    <button 
                      onClick={() => selectAvatar('')}
                      className="py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg w-full transition-colors border border-purple-100"
                    >
                      Dùng chữ cái mặc định
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{userProfile?.fullName || 'Thành viên'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {userProfile?.role || 'GIÁO VIÊN'}
              </span>
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Calendar size={14} /> Ngày gia nhập: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 font-sans">
        {/* LEFT COLUMN: BASIC INFO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsEditing(false); }}
                    className="flex items-center gap-2 text-gray-500 font-bold hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors text-sm"
                  >
                    <XCircle size={16} /> Hủy bỏ
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-purple-600 text-white font-bold hover:bg-purple-700 px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Họ và Tên
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50"
                    placeholder="Nhập họ tên..."
                  />
                ) : (
                  <p className="text-gray-700 font-semibold text-lg">{userProfile?.fullName || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email Liên hệ
                </label>
                <p className="text-gray-500 font-medium py-2">{userProfile?.email}</p>
                <p className="text-[10px] text-gray-400 font-medium italic">* Không thể thay đổi Email</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} /> Số điện thoại
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50"
                    placeholder="VD: 0912345678"
                  />
                ) : (
                  <p className="text-gray-700 font-semibold text-lg">{userProfile?.phoneNumber || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <School size={14} /> Trường học
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.schoolName}
                    onChange={(e) => setEditForm({...editForm, schoolName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50"
                    placeholder="Nhập tên trường..."
                  />
                ) : (
                  <p className="text-gray-700 font-semibold text-lg">{userProfile?.schoolName || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Giới thiệu bản thân</label>
              {isEditing ? (
                <textarea 
                  rows="4"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 resize-none"
                  placeholder="Viết vài dòng giới thiệu về bạn..."
                ></textarea>
              ) : (
                <p className="text-gray-600 leading-relaxed italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {userProfile?.bio ? `"${userProfile.bio}"` : "Giới thiệu ngắn về bản thân bạn..."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & ACTIVITIES */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-8 rounded-3xl border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold">
              <ShieldCheck size={20} />
              <span>Bảo mật tài khoản</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">Trạng thái: <span className="text-green-600 font-bold italic">Bình thường</span></p>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl border border-purple-200 hover:bg-purple-50 transition-all shadow-sm active:scale-95 text-sm"
            >
              Thay đổi mật khẩu
            </button>
          </div>

          {/* CHANGE PASSWORD MODAL */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="text-purple-600" size={24} /> Đổi mật khẩu
                  </h3>
                  <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={24} />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.old ? "text" : "password"}
                        required
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('old')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl mt-4 hover:bg-purple-700 transition-all disabled:bg-purple-300"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" strokeWidth={3} /> : 'Xác nhận thay đổi'}
                  </button>
                </form>
              </div>
            </div>
          ) }

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Thống kê hoạt động</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Giáo án</span>
                <span className="text-xl font-bold text-purple-600">0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase">Đề thi</span>
                <span className="text-xl font-bold text-blue-600">0</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-center">
                <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Cấp độ tài khoản</p>
                <p className="text-sm font-bold text-blue-700">Thành viên mới</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
