import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Star,
  Award,
  Filter,
  Trash2,
  X,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { StudentMistakeRecord, SpellingErrorGroup, ERROR_GROUPS_META } from '../types/spelling';
import { getStudentMistakes, saveStudentMistake } from '../firebase/spellingDataService';
import { speechReader, sfx } from '../utils/audioSpeech';
import { evaluateSpelling } from '../utils/spellingDiff';

interface StudentDifficultNotebookProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStars: (amount: number) => void;
}

export const StudentDifficultNotebook: React.FC<StudentDifficultNotebookProps> = ({
  isOpen,
  onClose,
  onAddStars,
}) => {
  const [mistakes, setMistakes] = useState<StudentMistakeRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [practicingItem, setPracticingItem] = useState<StudentMistakeRecord | null>(null);
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [practiceFeedback, setPracticeFeedback] = useState<string>('');
  const [isPracticeCorrect, setIsPracticeCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMistakes();
    }
  }, [isOpen]);

  const loadMistakes = () => {
    const list = getStudentMistakes();
    setMistakes(list);
  };

  if (!isOpen) return null;

  // Lọc theo nhóm lỗi
  const filtered = mistakes.filter((m) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'not_mastered') return !m.mastered;
    if (selectedFilter === 'mastered') return m.mastered;
    return m.errorCategory === selectedFilter;
  });

  const handleSpeak = (text: string) => {
    speechReader.speakSlowly(text);
  };

  const handleStartPractice = (item: StudentMistakeRecord) => {
    setPracticingItem(item);
    setPracticeInput('');
    setPracticeFeedback('');
    setIsPracticeCorrect(null);
    speechReader.speakSlowly(item.word);
  };

  const handleCheckPractice = () => {
    if (!practicingItem || !practiceInput.trim()) return;

    const result = evaluateSpelling(
      practicingItem.word,
      practiceInput,
      practicingItem.errorCategory,
      practicingItem.hint
    );

    if (result.isCorrect) {
      setIsPracticeCorrect(true);
      setPracticeFeedback('Tuyệt vời! Bé đã sửa đúng từ khó này rồi! ⭐');
      sfx.playSuccess();
      onAddStars(2);
      saveStudentMistake(practicingItem.word, practicingItem.errorCategory, practicingItem.hint, true);
      loadMistakes();
    } else {
      setIsPracticeCorrect(false);
      setPracticeFeedback(`Chưa đúng rồi bé ơi! Từ chuẩn là: "${practicingItem.word}". Bé thử lại nhé!`);
      sfx.playEncouragement();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-sky-300 relative text-gray-800">
        {/* Header Sổ Từ Khó */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-sm">
              📖
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950 flex items-center gap-2">
                Sổ Từ Khó Của Bé
              </h2>
              <p className="text-xs sm:text-sm text-sky-700 font-medium">
                Nơi ghi lại các từ bé cần ôn luyện để nhớ thật lâu và viết chuẩn 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bộ Lọc Nhóm Lỗi */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <span className="text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            Tất cả ({mistakes.length})
          </button>
          <button
            onClick={() => setSelectedFilter('not_mastered')}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedFilter === 'not_mastered'
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
          >
            Cần luyện lại ({mistakes.filter((m) => !m.mastered).length})
          </button>
          <button
            onClick={() => setSelectedFilter('mastered')}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedFilter === 'mastered'
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            Đã thuộc ({mistakes.filter((m) => m.mastered).length})
          </button>
        </div>

        {/* Nội dung sổ từ khó */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Modal luyện lại từ khó trực tiếp nếu đang chọn một từ */}
          {practicingItem && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 rounded-3xl p-5 shadow-lg space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Đang luyện lại từ:
                </span>
                <button
                  onClick={() => setPracticingItem(null)}
                  className="text-xs text-gray-400 hover:text-gray-700 font-bold"
                >
                  Đóng luyện tập
                </button>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleSpeak(practicingItem.word)}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 text-sm sm:text-base"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Nghe Cô Đọc Lại</span>
                </button>
              </div>

              {/* Ô gõ cỡ chữ to >= 28px */}
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckPractice()}
                  placeholder="Gõ lại từ này thật đúng..."
                  className="w-full py-3.5 px-6 text-center text-[28px] sm:text-[32px] font-bold rounded-2xl border-4 border-amber-300 focus:border-amber-500 focus:outline-hidden bg-white shadow-inner"
                  autoFocus
                />
              </div>

              {practiceFeedback && (
                <div
                  className={`p-3 rounded-2xl text-center font-bold text-sm max-w-md mx-auto ${
                    isPracticeCorrect
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {practiceFeedback}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCheckPractice}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm"
                >
                  Kiểm Tra Lại
                </button>
                {isPracticeCorrect && (
                  <button
                    onClick={() => setPracticingItem(null)}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm shadow-sm"
                  >
                    Xong Từ Này
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Danh sách các từ khó */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Smile className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-600">Chưa có từ khó nào trong mục này!</p>
              <p className="text-xs">
                Khi bé luyện viết bài, những từ cần chú ý sẽ tự động được lưu vào đây nhé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((item) => {
                const meta = ERROR_GROUPS_META[item.errorCategory];
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      item.mastered
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                            meta?.badgeColor || 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {meta?.emoji} {meta?.shortLabel || item.errorCategory}
                        </span>
                        {item.mastered ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Đã thuộc
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700">
                            Cần ôn ({item.wrongAttempts} lần sai)
                          </span>
                        )}
                      </div>

                      {/* Chữ to rõ */}
                      <p className="text-2xl font-black text-gray-900 tracking-wide my-1">
                        {item.word}
                      </p>

                      {item.hint && (
                        <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                          💡 {item.hint}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleSpeak(item.word)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-gray-600" />
                        <span>Nghe</span>
                      </button>

                      <button
                        onClick={() => handleStartPractice(item)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Luyện Lại</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-3xl border-t border-gray-200 text-center text-xs text-gray-500">
          Mỗi lần bé viết đúng lại từ khó sẽ được thưởng <strong className="text-amber-600 font-bold">+2 Sao ⭐</strong>!
        </div>
      </div>
    </div>
  );
};
