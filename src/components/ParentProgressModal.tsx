import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  Award,
  Calendar,
  Flame,
  Star,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  getDictationHistory,
  getStoredLessonProgress,
  DictationHistoryRecord,
} from '../data/bookShelfData';
import { ERROR_GROUPS_META, SpellingErrorGroup } from '../types/spelling';

interface ParentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  onSelectReviewLesson?: (sectionId: string) => void;
}

export const ParentProgressModal: React.FC<ParentProgressModalProps> = ({
  isOpen,
  onClose,
  streak,
  onSelectReviewLesson,
}) => {
  const [history, setHistory] = useState<DictationHistoryRecord[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setHistory(getDictationHistory());
      setProgressMap(getStoredLessonProgress());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Tính tổng số bài đã làm hôm nay để kiểm tra mục tiêu ngày
  const todayStr = new Date().toLocaleDateString('vi-VN');
  const completedToday = history.filter((h) => h.date.startsWith(todayStr)).length;
  const isGoalReached = completedToday >= 1;

  // Tổng hợp các nhóm lỗi hay sai nhất
  const errorCategoryCounts = new Map<string, number>();
  for (const h of history) {
    if (h.mistakes) {
      for (const m of h.mistakes) {
        const cat = m.category || 'khac';
        errorCategoryCounts.set(cat, (errorCategoryCounts.get(cat) || 0) + 1);
      }
    }
  }

  const topErrorCategories = Array.from(errorCategoryCounts.entries())
    .map(([cat, count]) => ({
      category: cat as SpellingErrorGroup,
      count,
      meta: ERROR_GROUPS_META[cat as SpellingErrorGroup],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Danh sách các bài cần ôn lại (điểm số < 8.0)
  const needReviewLessons = Object.entries(progressMap)
    .filter(([_, info]) => info.score < 8.0)
    .map(([secId, info]) => ({
      sectionId: secId,
      ...info,
    }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-teal-300 relative text-gray-800">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Báo Cáo Tiến Trình & Lịch Sử Cho Phụ Huynh
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 font-medium">
                Theo dõi sự tiến bộ, mục tiêu hàng ngày và các lỗi chính tả con hay mắc phải
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nội dung báo cáo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. MỤC TIÊU HÀNG NGÀY & CHUỖI NGÀY HỌC LIÊN TIẾP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Mục tiêu ngày */}
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                isGoalReached
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    isGoalReached ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    Mục tiêu hôm nay
                  </p>
                  <p className="text-sm sm:text-base font-black">
                    Hoàn thành 1 đoạn chính tả/ngày
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                  isGoalReached
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {isGoalReached ? '✓ Đạt mục tiêu' : `Đã làm: ${completedToday}/1`}
              </span>
            </div>

            {/* Chuỗi học liên tiếp */}
            <div className="bg-orange-50 border-2 border-orange-300 p-4 rounded-2xl flex items-center justify-between text-orange-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-200 text-orange-700 flex items-center justify-center text-xl">
                  <Flame className="w-6 h-6 fill-orange-500 text-orange-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    Chuỗi ngày học liên tiếp
                  </p>
                  <p className="text-sm sm:text-base font-black">
                    {streak} ngày chăm chỉ
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-orange-600">🔥 {streak}</span>
            </div>
          </div>

          {/* 2. NHÓM LỖI CHÍNH TẢ CON HAY SAI NHẤT */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Nhóm Lỗi Con Hay Mắc Phải Nhất
            </h3>
            {topErrorCategories.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Chưa có dữ liệu lỗi sai. Con đang làm bài rất tốt!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {topErrorCategories.map((item) => (
                  <div
                    key={item.category}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.meta?.emoji || '📝'}</span>
                      <span className="font-bold text-gray-800">
                        {item.meta?.shortLabel || item.category}
                      </span>
                    </div>
                    <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {item.count} lần sai
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. CÁC BÀI CẦN ÔN LẠI (ĐIỂM DƯỚI 8.0) */}
          {needReviewLessons.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-black text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Các Bài Cần Ôn Luyện Lại (Điểm dưới 8.0)
              </h3>
              <div className="space-y-2">
                {needReviewLessons.map((item) => (
                  <div
                    key={item.sectionId}
                    className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">Mã bài: {item.sectionId}</p>
                      <p className="text-[11px] text-gray-500">
                        Điểm gần nhất: <strong className="text-rose-700">{item.score}/10</strong> ({item.accuracy}%) - Làm ngày: {item.lastDate}
                      </p>
                    </div>
                    {onSelectReviewLesson && (
                      <button
                        onClick={() => {
                          onSelectReviewLesson(item.sectionId);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ôn lại</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. LỊCH SỬ CÁC LƯỢT CHÉP BÀI GẦN NHẤT */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Lịch Sử Luyện Viết Gần Nhất ({history.length} lượt)
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Chưa có lượt chép bài nào được ghi nhận. Hãy cho bé làm bài đầu tiên nhé!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-gray-50 hover:bg-teal-50/50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {record.sectionTitle}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            record.mode === 'test'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {record.mode === 'test' ? 'Kiểm tra' : 'Luyện tập'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {record.submissionType === 'camera' ? '📷 Chụp vở' : '⌨️ Gõ máy'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {record.date} • {record.totalWords} chữ • {record.wrongWordsCount} lỗi
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-sm text-teal-800">{record.score} / 10</p>
                        <p className="text-[11px] text-gray-500">{record.accuracy}% chuẩn</p>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: record.stars || 3 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-3xl text-center text-xs text-gray-500">
          Hệ thống chấm bằng thuật toán đối chiếu chuẩn mực Unicode NFC, bảo đảm tính công bằng và chính xác cao nhất cho học sinh tiểu học.
        </div>
      </div>
    </div>
  );
};
