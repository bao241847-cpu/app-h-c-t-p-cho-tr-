import React from 'react';
import {
  Star,
  Flame,
  BookOpen,
  Volume2,
  VolumeX,
  Shield,
  Eye,
  LogOut,
  Sparkles,
  Share2,
  Check,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { AUTHORIZED_TEACHER_EMAIL } from '../firebase/config';

interface HeaderProps {
  stars: number;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenNotebook: () => void;
  mistakesCount: number;
  isTeacher: boolean;
  teacherEmail: string | null;
  isPreviewingAsStudent: boolean;
  onTogglePreviewAsStudent: () => void;
  onOpenTeacherAdmin: () => void;
  onOpenTeacherLogin: () => void;
  onTeacherLogout: () => void;
  onCopyStudentLink: () => void;
  copySuccess: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  streak,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenNotebook,
  mistakesCount,
  isTeacher,
  teacherEmail,
  isPreviewingAsStudent,
  onTogglePreviewAsStudent,
  onOpenTeacherAdmin,
  onOpenTeacherLogin,
  onTeacherLogout,
  onCopyStudentLink,
  copySuccess,
}) => {
  return (
    <header className="space-y-3 mb-6">
      {/* 1. THANH QUẢN TRỊ GIÁO VIÊN (CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP VỚI bao241847@gmail.com) */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-2.5 sm:p-3.5 shadow-md flex flex-wrap items-center justify-between gap-2.5 text-xs font-bold animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] opacity-90 uppercase tracking-wider block">
                Chế độ Giáo Viên
              </span>
              <span className="text-sm font-black text-white">
                {teacherEmail || AUTHORIZED_TEACHER_EMAIL}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Xem Như Học Sinh */}
            <button
              onClick={onTogglePreviewAsStudent}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isPreviewingAsStudent
                  ? 'bg-white text-amber-900 border-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isPreviewingAsStudent ? 'Đang xem như Học Sinh' : 'Xem như Học Sinh'}</span>
            </button>

            {/* Nút Bảng Quản Trị Giáo Viên */}
            <button
              onClick={onOpenTeacherAdmin}
              className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-amber-700" />
              <span>Bảng Quản Trị</span>
            </button>

            {/* Nút Copy Link Gửi Học Sinh */}
            <button
              onClick={onCopyStudentLink}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Sao chép link gửi cho phụ huynh và học sinh"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'Đã sao chép link!' : 'Copy link học sinh'}</span>
            </button>

            {/* Nút Đăng xuất */}
            <button
              onClick={onTeacherLogout}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
              title="Đăng xuất giáo viên"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. THANH TIÊU ĐỀ CHÍNH VÀ TIỆN ÍCH DÀNH CHO HỌC SINH */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-200 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Tiêu đề ứng dụng */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md border-2 border-amber-200">
            🐝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                Bé Luyện Chính Tả Lớp 2
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-300">
                Lớp 2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Nghe cô đọc - gõ từng chữ - chấm chính xác từng dấu thanh
            </p>
          </div>
        </div>

        {/* Cụm tiện ích Học sinh: Sao ⭐, Chuỗi 🔥, Sổ từ khó 📖, Quy tắc 💡, Loa 🔊 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sao thưởng của bé */}
          <div
            className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-300 px-3 py-1.5 rounded-2xl text-amber-900 shadow-xs"
            title="Số sao thưởng bé đã đạt được"
          >
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
            <span className="text-sm sm:text-base font-black">{stars}</span>
            <span className="text-[11px] font-bold text-amber-700 hidden sm:inline">Sao</span>
          </div>

          {/* Chuỗi liên tiếp */}
          <div
            className="flex items-center gap-1 bg-orange-50 border-2 border-orange-300 px-3 py-1.5 rounded-2xl text-orange-900 shadow-xs"
            title="Số ngày hoặc câu đúng liên tiếp"
          >
            <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
            <span className="text-sm sm:text-base font-black">{streak}</span>
          </div>

          {/* Sổ từ khó của bé */}
          <button
            onClick={onOpenNotebook}
            className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 px-3.5 py-1.5 rounded-2xl text-sky-900 font-bold text-xs sm:text-sm shadow-xs transition-all relative"
            title="Mở sổ từ khó để ôn lại"
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Sổ Từ Khó</span>
            {mistakesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {mistakesCount}
              </span>
            )}
          </button>

          {/* Tra cứu quy tắc chính tả */}
          <button
            onClick={onOpenRules}
            className="p-2 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 rounded-2xl text-xs font-bold transition-colors"
            title="Tra cứu mẹo phân biệt l/n, ch/tr, s/x..."
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Bật / tắt âm thanh */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-gray-600 rounded-2xl text-xs font-bold transition-colors"
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>

          {/* Nút nhỏ, kín đáo "Dành cho giáo viên" ở góc màn hình */}
          {!isTeacher && (
            <button
              onClick={onOpenTeacherLogin}
              className="text-[11px] font-medium text-gray-400 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg border border-transparent hover:border-amber-200 transition-colors ml-1"
              title="Dành cho giáo viên quản trị bài học"
            >
              🔒 Dành cho giáo viên
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
