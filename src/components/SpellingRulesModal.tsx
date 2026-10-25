import React from 'react';
import { X, BookOpen, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { SOUND_RULES } from '../data/spellingData';
import { speechReader } from '../utils/audioSpeech';

interface SpellingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpellingRulesModal: React.FC<SpellingRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleReadPoem = (poem: string) => {
    speechReader.speakNormal(poem);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-3 border-amber-300 animate-pop my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg">
                Cẩm Nang Mẹo Nhớ Chính Tả Lớp 1
              </h3>
              <p className="text-xs text-slate-500">
                Các bài thơ và mẹo vui của cô giáo giúp bé không bao giờ viết sai
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable rules list */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {SOUND_RULES.map((rule) => (
            <div
              key={rule.id}
              className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-xs hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                    {rule.pair}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    {rule.title}
                  </h4>
                </div>

                <button
                  onClick={() => handleReadPoem(rule.poem)}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title="Nghe cô đọc bài thơ mẹo"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Đọc thơ</span>
                </button>
              </div>

              {/* Poem box */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-semibold italic whitespace-pre-line leading-relaxed mb-3">
                "{rule.poem}"
              </div>

              {/* Explanation */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mb-3">
                {rule.explanation}
              </p>

              {/* Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {rule.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-600">✔ {ex.correct}</span>
                      <span className="text-rose-400 line-through text-[11px]">{ex.wrong}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{ex.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-slate-100 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/25 cursor-pointer"
          >
            Đã hiểu bài rồi! Bắt đầu luyện tập ✨
          </button>
        </div>
      </div>
    </div>
  );
};
