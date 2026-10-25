import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, CheckCircle2, RotateCcw, ArrowRight, Lightbulb, Sparkles, HelpCircle } from 'lucide-react';
import { SpellingWord } from '../types/spelling';
import { SPELLING_WORDS_DB } from '../data/spellingData';
import { speechReader, sfx } from '../utils/audioSpeech';
import { MascotMessage, MascotMood } from './MascotMessage';

interface PracticeListenWriteProps {
  onAddStar: (count: number) => void;
  onRecordError: (wrong: string, correct: string, hint: string) => void;
  soundEnabled: boolean;
}

export const PracticeListenWrite: React.FC<PracticeListenWriteProps> = ({
  onAddStar,
  onRecordError,
  soundEnabled,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [isSlowSpeaking, setIsSlowSpeaking] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredWords = React.useMemo(() => {
    if (filterType === 'all') return SPELLING_WORDS_DB;
    return SPELLING_WORDS_DB.filter((w) => w.phoneticType === filterType);
  }, [filterType]);

  const currentWord: SpellingWord = filteredWords[currentIndex] || filteredWords[0] || SPELLING_WORDS_DB[0];

  // Tự động phát âm khi chuyển từ mới
  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Tải trước từ hiện tại và từ tiếp theo để phát ngay 0ms
    if (currentWord?.word) {
      speechReader.prefetch(currentWord.word);
    }
    const nextWord = filteredWords[(currentIndex + 1) % filteredWords.length];
    if (nextWord?.word) {
      speechReader.prefetch(nextWord.word);
    }
  }, [currentIndex, filterType, currentWord, filteredWords]);

  const handleSpeakNormal = () => {
    setIsSpeakingNow(true);
    speechReader.speakNormal(currentWord.word, () => {
      setIsSpeakingNow(false);
    });
  };

  const handleSpeakSlow = async () => {
    setIsSlowSpeaking(true);
    setIsSpeakingNow(true);
    await speechReader.speakSlowly(currentWord.word, () => {
      setIsSlowSpeaking(false);
      setIsSpeakingNow(false);
    });
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const cleanInput = userInput.trim().toLowerCase();
    const cleanTarget = currentWord.word.trim().toLowerCase();

    const correct = cleanInput === cleanTarget;
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      if (soundEnabled) sfx.playSuccess();
      onAddStar(2);
    } else {
      if (soundEnabled) sfx.playEncouragement();
      onRecordError(userInput.trim(), currentWord.word, currentWord.ruleHint);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handleRetry = () => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    inputRef.current?.focus();
    handleSpeakSlow();
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg shadow-amber-900/5 border-2 border-amber-200">
      {/* Top Controls: Filter Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm">
            🎧
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800 text-base sm:text-lg">
              Chế độ 1: Luyện Nghe - Viết Chậm
            </h2>
            <p className="text-xs text-slate-500">
              Nghe cô đọc mẫu và gõ hoặc viết lại vào ô ly
            </p>
          </div>
        </div>

        {/* Filter phonics tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex-shrink-0">Chọn âm:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'ch_tr', label: 'ch / tr' },
            { id: 's_x', label: 's / x' },
            { id: 'c_k', label: 'c / k' },
            { id: 'g_gh', label: 'g / gh' },
            { id: 'ng_ngh', label: 'ng / ngh' },
            { id: 'd_gi_r', label: 'd / gi / r' },
            { id: 'l_n', label: 'l / n' },
            { id: 'vowels', label: 'Vần có dấu' },
            { id: 'tones', label: 'Dấu hỏi / ngã' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterType(item.id);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                filterType === item.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress pill */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-4 px-1">
        <span>Từ số {currentIndex + 1} / {filteredWords.length}</span>
        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
          {currentWord.categoryLabel}
        </span>
      </div>

      {/* Primary School Lined Notebook Area */}
      <div className="bg-notebook-grid notebook-margin rounded-3xl p-5 sm:p-8 border-2 border-sky-200 shadow-sm relative overflow-hidden mb-6">
        {/* Cute Illustrated Emoji */}
        <div className="text-center mb-5">
          <div className="text-6xl sm:text-7xl mb-2 select-none inline-block transform hover:scale-110 transition-transform">
            {currentWord.emoji}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500">
            {currentWord.exampleSentence}
          </div>
          {isSpeakingNow ? (
            <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black animate-pulse border border-rose-300 shadow-sm">
              <span className="flex items-center gap-0.5 h-3">
                <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </span>
              <span>Cô giáo đang đọc... Bé chú ý lắng nghe nhé!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span>🌸</span>
              <span>Giọng cô giáo tiểu học giảng dạy dịu dàng, ấm áp</span>
            </div>
          )}
        </div>

        {/* Listen Action Buttons (Large, Kid-Friendly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-6">
          <button
            type="button"
            onClick={handleSpeakNormal}
            className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-sm sm:text-base shadow-md shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
            <span>Đọc Bình Thường</span>
          </button>

          <button
            type="button"
            onClick={handleSpeakSlow}
            disabled={isSlowSpeaking}
            className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-sm sm:text-base shadow-md shadow-rose-500/25 transition-all cursor-pointer"
          >
            <Play className={`w-5 h-5 ${isSlowSpeaking ? 'animate-spin' : ''}`} />
            <span>{isSlowSpeaking ? 'Đang đọc chậm...' : '🐢 Đọc Chậm Từng Tiếng'}</span>
          </button>
        </div>

        {/* Typing Input */}
        <form onSubmit={handleCheck} className="max-w-lg mx-auto">
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (isChecked) setIsChecked(false);
              }}
              placeholder="Bé gõ từ nghe được vào đây..."
              disabled={isChecked && isCorrect}
              className={`w-full py-4 px-6 text-center text-2xl sm:text-3xl font-extrabold rounded-2xl border-3 outline-none transition-all tracking-wide ${
                isChecked
                  ? isCorrect
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-rose-400 bg-rose-50 text-rose-800 animate-shake'
                  : 'border-amber-300 bg-white/95 text-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-200'
              }`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!isChecked ? (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-base shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Nộp Bài &amp; Chấm Điểm ✨</span>
              </button>
            ) : isCorrect ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-base shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 animate-pop"
              >
                <span>Câu Tiếp Theo ➡️</span>
              </button>
            ) : (
              <div className="flex-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Viết Lại Lần Nữa</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-3.5 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Qua câu khác</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Hint button if child is struggling */}
        {!isChecked && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-bold bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Bé cần cô giáo gợi ý không?'}</span>
            </button>
            {showHint && (
              <div className="mt-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 p-2.5 rounded-xl max-w-sm mx-auto animate-pop">
                💡 {currentWord.ruleHint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Immediate Psychological Feedback Box */}
      {isChecked && (
        <div
          className={`p-5 rounded-3xl border-2 transition-all animate-pop mb-4 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl select-none flex-shrink-0">
              {isCorrect ? '🌟' : '💡'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">
                  {isCorrect ? 'Tuyệt vời quá! Bé viết đúng hoàn toàn!' : 'Bé chú ý chỗ này một xíu nhé!'}
                </h3>
                {isCorrect && (
                  <span className="bg-emerald-200/80 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
                    +2 ⭐ Ngôi sao
                  </span>
                )}
              </div>

              {!isCorrect && (
                <div className="my-2 p-3 bg-white/90 rounded-2xl border border-rose-200">
                  <div className="text-xs text-slate-500">Từ đúng chuẩn mực là:</div>
                  <div className="text-2xl font-black text-rose-600 my-0.5">
                    {currentWord.word}
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                {currentWord.ruleHint}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Mascot encouragement */}
      <MascotMessage
        message={
          isChecked
            ? isCorrect
              ? 'Bé nhớ rất chuẩn âm đầu rồi đó. Cứ tự tin viết nắn nót như vậy nha!'
              : 'Không sao đâu bé ngoan ơi! Tiếng Việt phong phú lắm, chỉ cần bé nghe lại âm đọc và nhớ mẹo cô dặn là lần sau sẽ đúng ngay!'
            : 'Bé hãy lắng nghe thật kỹ, nếu nghe chưa kịp hãy bấm nút "Đọc chậm từng tiếng" để cô đọc từng chữ cho bé chép nhé!'
        }
        mood={isChecked ? (isCorrect ? 'celebrating' : 'encouraging') : 'happy'}
        onVoiceRead={() => {
          speechReader.speakNormal(
            isChecked
              ? isCorrect
                ? 'Bé viết rất giỏi!'
                : currentWord.ruleHint
              : 'Bé lắng nghe cô đọc nhé'
          );
        }}
      />
    </div>
  );
};
