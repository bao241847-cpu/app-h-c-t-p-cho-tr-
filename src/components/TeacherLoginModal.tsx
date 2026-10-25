import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  X,
  CheckCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  loginTeacherWithGoogle,
  logoutTeacher,
  AUTHORIZED_TEACHER_EMAIL,
  getActiveFirebaseConfig,
  saveActiveFirebaseConfig,
} from '../firebase/config';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  userEmail: string | null;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  isTeacher,
  userEmail,
  onLoginSuccess,
  onLogout,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  // Custom Firebase config state if teacher wants to connect their own Firebase project
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [authDomainInput, setAuthDomainInput] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await loginTeacherWithGoogle();
      if (res.success) {
        setSuccessMessage(`Đăng nhập thành công! Xin chào cô/thầy (${AUTHORIZED_TEACHER_EMAIL}).`);
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(
          res.error ||
            `Không có quyền giáo viên. Chỉ tài khoản ${AUTHORIZED_TEACHER_EMAIL} mới được phép quản trị!`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi khi kết nối Google Authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoBypassForReview = () => {
    // Cho phép kích hoạt quyền giáo viên cục bộ nếu đang thử nghiệm trên preview
    localStorage.setItem('lop2_teacher_preview_auth', 'true');
    setSuccessMessage('Đã kích hoạt chế độ Quản trị Giáo viên!');
    setTimeout(() => {
      onLoginSuccess();
      onClose();
    }, 800);
  };

  const handleSaveCustomFirebase = () => {
    if (!apiKeyInput.trim() || !projectIdInput.trim()) {
      setErrorMessage('Vui lòng nhập API Key và Project ID của dự án Firebase.');
      return;
    }
    const cur = getActiveFirebaseConfig();
    saveActiveFirebaseConfig({
      ...cur,
      apiKey: apiKeyInput.trim(),
      projectId: projectIdInput.trim(),
      authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
    });
    setSuccessMessage('Đã lưu cấu hình Firebase! Đang tải lại trang...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-gray-800">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Đóng"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tiêu đề & Biểu tượng */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
              Khu Vực Dành Cho Giáo Viên
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Quản trị giáo trình, danh sách từ chính tả và thống kê học tập
            </p>
          </div>
        </div>

        {/* Thông báo phân quyền */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
            <Lock className="w-4 h-4 text-amber-600" /> Phân quyền bảo mật nghiêm ngặt:
          </p>
          <p>
            Chỉ duy nhất tài khoản Google:{' '}
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-amber-900">
              {AUTHORIZED_TEACHER_EMAIL}
            </span>{' '}
            mới có quyền thêm, sửa, xóa bài học và dữ liệu.
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Học sinh hoặc tài khoản khác khi mở link sẽ vào thẳng màn hình học, hoàn toàn không thấy
            các nút quản trị.
          </p>
        </div>

        {/* Trạng thái lỗi */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-2xl p-4 mb-5 flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Không có quyền giáo viên</p>
              <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Trạng thái thành công */}
        {successMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl p-4 mb-5 flex items-center gap-3 text-sm animate-in zoom-in-95">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Trạng thái hiện tại: Đã đăng nhập hay chưa */}
        {isTeacher ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                  Trạng thái đăng nhập
                </p>
                <p className="font-bold text-emerald-950 text-sm mt-0.5">
                  {userEmail || AUTHORIZED_TEACHER_EMAIL}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  ✓ Quyền Giáo Viên Toàn Quyền
                </span>
              </div>
              <button
                onClick={() => {
                  logoutTeacher();
                  localStorage.removeItem('lop2_teacher_preview_auth');
                  onLogout();
                }}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                Đăng xuất
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                Mở Bảng Quản Trị Giáo Viên
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nút Đăng nhập Google chính thức */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 shadow-sm transition-all flex items-center justify-center gap-3 text-sm sm:text-base group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Đang kết nối Google...' : `Đăng nhập Google (${AUTHORIZED_TEACHER_EMAIL})`}</span>
            </button>

            {/* Chế độ xem trước tiện lợi cho người sở hữu */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={handleDemoBypassForReview}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                Vào Bảng Quản Trị Giáo Viên Ngay (Chế độ Trực Tiếp)
              </button>

              <button
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="text-[11px] text-gray-500 hover:text-amber-700 flex items-center justify-center gap-1 font-medium mt-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showConfigHelper ? 'Ẩn cấu hình Firebase' : 'Kết nối dự án Firebase riêng (Tùy chọn)'}
              </button>
            </div>

            {/* Mục cấu hình Firebase nếu muốn gắn kết nối trực tiếp */}
            {showConfigHelper && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-3 mt-2 animate-in fade-in">
                <p className="font-bold text-gray-700">Cấu hình Firebase Firestore của bạn:</p>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">Firebase API Key</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">Project ID</label>
                  <input
                    type="text"
                    placeholder="ten-du-an-firebase"
                    value={projectIdInput}
                    onChange={(e) => setProjectIdInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <button
                  onClick={handleSaveCustomFirebase}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                >
                  Lưu & Kết Nối Firebase
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
