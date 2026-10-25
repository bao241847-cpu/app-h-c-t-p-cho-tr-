import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckCircle,
  RotateCcw,
  Volume2,
  Trash2,
  BookOpen,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { SpellingErrorRecord } from '../types/spelling';
import { speechReader, sfx } from '../utils/audioSpeech';

interface ErrorNotebookProps {
  errors: SpellingErrorRecord[];
  stars: number;
  onUpdateError: (id: string, mastered: boolean) => void;
  onClearErrors: () => void;
  onPracticeSpecificWord: (word: string) => void;
  soundEnabled: boolean;
}

export const ErrorNotebook: React.FC<ErrorNotebookProps> = ({
  errors,
  stars,
  onUpdateError,
  onClearErrors,
  onPracticeSpecificWord,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'errors' | 'badges'>('errors');
  const [filterMastered, setFilterMastered] = useState<boolean>(false);

  // Huy hiệu thưởng theo số sao
  const badges = [
    {
      id: 'b1',
      title: 'Bé Chăm Chỉ',
      desc: 'Hoàn thành bài tập đầu tiên',
      starsReq: 2,
      emoji: '🌱',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    },
    {
      id: 'b2',
      title: 'Đôi Tai Thính',
      desc: 'Nghe viết đúng 5 từ liên tiếp',
      starsReq: 10,
      emoji: '👂',
      color: 'bg-sky-50 border-sky-300 text-sky-800',
    },
    {
      id: 'b3',
      title: 'Dũng Sĩ ch / tr',
      desc: 'Không bao giờ nhầm lẫn ch và tr',
      starsReq: 20,
      emoji: '🎋',
      color: 'bg-amber-50 border-amber-300 text-amber-800',
    },
    {
      id: 'b4',
      title: 'Bậc Thầy c / k',
      desc: 'Nắm vững quy tắc k đi với i, e, ê',
      starsReq: 35,
      emoji: '🍭',
      color: 'bg-purple-50 border-purple-300 text-purple-800',
    },
    {
      id: 'b5',
      title: 'Cây Bút Vàng Lớp 1',
      desc: 'Tập chép đều đặn, chữ viết ngay ngắn',
      starsReq: 50,
      emoji: '✍️',
      color: 'bg-orange-50 border-orange-300 text-orange-800',
    },
    {
      id: 'b6',
      title: 'Vua Chính Tả',
      desc: 'Chinh phục 100 ngôi sao sáng rực rỡ',
      starsReq: 100,
      emoji: '👑',
      color: 'bg-rose-50 border-rose-300 text-rose-800',
    },
  ];

  const displayedErrors = errors.filter((e) => (filterMastered ? true : !e.mastered));

  const handleSpeak = (text: string) => {
    speechReader.speakSlowly(text);
  };

  const handleToggleMastered = (id: string, current: boolean) => {
    onUpdateError(id, !current);
    if (!current && soundEnabled) {
      sfx.playSuccess();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg shadow-sky-900/5 border-2 border-sky-200">
      {/* Top tabs */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-sky-100 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center text-sm">
            📒
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800 text-base sm:text-lg">
              Sổ Tay Lỗi Sai &amp; Góc Khen Thưởng
            </h2>
            <p className="text-xs text-slate-500">
              Nơi lưu lại các từ bé từng viết nhầm để rèn luyện lại cho đến khi thành thạo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'errors'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sổ Từ Cần Ôn ({errors.filter((e) => !e.mastered).length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'badges'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Kho Huy Hiệu</span>
          </button>
        </div>
      </div>

      {activeTab === 'errors' ? (
        <div>
          {/* Controls */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 text-xs">
            <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterMastered}
                onChange={(e) => setFilterMastered(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Hiển thị cả các từ bé đã khắc phục xong</span>
            </label>

            {errors.length > 0 && (
              <button
                onClick={onClearErrors}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết sổ tay</span>
              </button>
            )}
          </div>

          {/* Error List */}
          {displayedErrors.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-3xl border-2 border-emerald-200 my-4">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="font-extrabold text-emerald-900 text-base mb-1">
                Tuyệt vời quá! Không có từ nào cần ôn tập!
              </h3>
              <p className="text-xs text-emerald-700">
                Bé đã làm chủ được tất cả các âm vần chính tả lớp 1. Hãy tiếp tục luyện nghe viết để tích lũy thêm sao nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedErrors.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.mastered
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-extrabold text-slate-800">
                        {item.correctWord}
                      </span>
                      {item.wrongWord && (
                        <span className="text-xs text-rose-600 line-through bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                          Từng viết: {item.wrongWord}
                        </span>
                      )}
                      <button
                        onClick={() => handleSpeak(item.correctWord)}
                        className="p-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 cursor-pointer"
                        title="Nghe cô đọc chậm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      💡 <strong>Mẹo nhớ:</strong> {item.ruleHint}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Ngày ghi: {item.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => onPracticeSpecificWord(item.correctWord)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Luyện lại ngay</span>
                    </button>

                    <button
                      onClick={() => handleToggleMastered(item.id, item.mastered)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
                        item.mastered
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.mastered ? 'Đã nhớ' : 'Đánh dấu đã nhớ'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* BADGES TAB */
        <div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-6 text-xs text-amber-900 font-bold">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>
              Bé hiện đang có <strong>{stars} ngôi sao</strong>. Hãy tích lũy thêm sao để mở khóa các danh hiệu cao quý nhé!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {badges.map((badge) => {
              const isUnlocked = stars >= badge.starsReq;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? `${badge.color} shadow-sm scale-102`
                      : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl select-none">{badge.emoji}</span>
                    <div>
                      <h4 className="font-black text-sm">{badge.title}</h4>
                      <p className="text-[11px] leading-tight opacity-80">{badge.desc}</p>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold mt-2 pt-2 border-t border-current/10 flex items-center justify-between">
                    <span>Yêu cầu: {badge.starsReq} ⭐</span>
                    <span>{isUnlocked ? '✔ Đã mở khóa' : '🔒 Chưa mở'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
