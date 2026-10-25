import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle, XCircle, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { SpellingWord, SoundCategory } from '../types/spelling';
import { SPELLING_WORDS_DB, SOUND_RULES } from '../data/spellingData';
import { speechReader, sfx } from '../utils/audioSpeech';
import { MascotMessage } from './MascotMessage';

interface PracticeConfusionQuizProps {
  onAddStar: (count: number) => void;
  onRecordError: (wrong: string, correct: string, hint: string) => void;
  soundEnabled: boolean;
}

export const PracticeConfusionQuiz: React.FC<PracticeConfusionQuizProps> = ({
  onAddStar,
  onRecordError,
  soundEnabled,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory | 'all'>('ch_tr');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions = React.useMemo(() => {
    if (selectedCategory === 'all') return SPELLING_WORDS_DB;
    return SPELLING_WORDS_DB.filter((w) => w.phoneticType === selectedCategory);
  }, [selectedCategory]);

  const currentQ: SpellingWord = questions[currentIndex] || questions[0] || SPELLING_WORDS_DB[0];

  const currentRule = SOUND_RULES.find((r) => r.id === currentQ.phoneticType);

  // Đảm bảo đáp án lộn xộn, phân bổ ngẫu nhiên trái - phải, tuyệt đối không bị cố định một bên
  const shuffledOptions = React.useMemo(() => {
    if (!currentQ?.options || currentQ.options.length === 0) return [];
    const correct = currentQ.correctOption;
    const wrongs = currentQ.options.filter((o: string) => o !== correct);

    // Nếu có 2 lựa chọn (phổ biến nhất)
    if (currentQ.options.length === 2) {
      const wrong = wrongs[0] || (currentQ.options[0] === correct ? currentQ.options[1] : currentQ.options[0]);
      // Dùng hash từ ID từ vựng và chỉ số câu để xáo trộn ngẫu nhiên luân phiên
      const hash = (currentQ.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) + currentIndex * 7);
      return hash % 2 === 0 ? [wrong, correct] : [correct, wrong];
    }

    // Nếu có 3 lựa chọn (như d / gi / r)
    const list = [...wrongs];
    const insertIndex = (currentIndex + currentQ.id.length) % (list.length + 1);
    list.splice(insertIndex, 0, correct);
    return list;
  }, [currentQ.id, currentIndex, selectedCategory, currentQ.correctOption]);

  const [templatePrefix, templateSuffix] = React.useMemo(() => {
    const parts = currentQ.missingTemplate.split('___');
    return [parts[0] || '', parts[1] || ''];
  }, [currentQ.missingTemplate]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctOption;
    if (isCorrect) {
      if (soundEnabled) sfx.playSuccess();
      onAddStar(1);
    } else {
      if (soundEnabled) sfx.playEncouragement();
      // Ghi nhận lỗi sai
      const reconstructedWrong = currentQ.missingTemplate.replace('___', option);
      onRecordError(reconstructedWrong, currentQ.word, currentQ.ruleHint);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const handlePronounce = (text: string) => {
    speechReader.speakNormal(text);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg shadow-purple-900/5 border-2 border-purple-200">
      {/* Category header tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
            🎯
          </span>
          <div>
            <h2 className="font-extrabold text-slate-800 text-base sm:text-lg">
              Chế độ 2: Phân Biệt Âm Vần Dễ Nhầm
            </h2>
            <p className="text-xs text-slate-500">
              Chọn âm vần hoặc dấu thanh đúng để hoàn thành từ (vị trí đáp án được xáo trộn ngẫu nhiên)
            </p>
          </div>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          {[
            { id: 'ch_tr', label: 'ch / tr' },
            { id: 's_x', label: 's / x' },
            { id: 'c_k', label: 'c / k' },
            { id: 'g_gh', label: 'g / gh' },
            { id: 'ng_ngh', label: 'ng / ngh' },
            { id: 'd_gi_r', label: 'd / gi / r' },
            { id: 'l_n', label: 'l / n' },
            { id: 'vowels', label: 'Vần có dấu (an/ang, uôn...)' },
            { id: 'tones', label: 'Dấu thanh (? / ~)' },
            { id: 'all', label: '🎲 Tất cả' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as SoundCategory | 'all');
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-b from-purple-50/70 to-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 text-center relative overflow-hidden mb-6">
        <div className="inline-block bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-full mb-3">
          Câu {currentIndex + 1} / {questions.length} • {currentQ.categoryLabel}
        </div>

        {/* Big Illustration */}
        <div className="text-6xl sm:text-7xl mb-4 select-none animate-pop inline-block">
          {currentQ.emoji}
        </div>

        {/* Question sentence */}
        <p className="text-sm sm:text-base text-slate-500 font-semibold mb-2">
          Điền chữ cái hoặc vần có dấu đúng vào chỗ chấm:
        </p>

        {/* Word Template */}
        <div className="inline-flex items-center justify-center gap-2 bg-white px-6 py-4 rounded-3xl border-3 border-purple-300 shadow-sm mb-4">
          <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-wide flex items-center justify-center gap-1">
            {isAnswered && selectedOption ? (
              <span className="inline-flex items-center gap-1">
                <span>{templatePrefix}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-xl font-black transition-all ${
                    selectedOption === currentQ.correctOption
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'
                      : 'bg-rose-100 text-rose-700 border-2 border-rose-400 line-through'
                  }`}
                >
                  {selectedOption}
                </span>
                <span>{templateSuffix}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span>{templatePrefix}</span>
                <span className="px-3 py-0.5 rounded-xl bg-purple-100 text-purple-600 border-2 border-dashed border-purple-300 animate-pulse">
                  ...
                </span>
                <span>{templateSuffix}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => handlePronounce(currentQ.word)}
            className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors cursor-pointer"
            title="Nghe mẫu từ hoàn chỉnh"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-400 italic mb-6">
          Ví dụ: "{currentQ.exampleSentence}"
        </div>

        {/* Big Option Buttons with Vietnamese Phonetic Pronunciation - Shuffled */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
          {shuffledOptions.map((option) => {
            const isChosen = selectedOption === option;
            const isCorrect = option === currentQ.correctOption;

            let btnStyle = 'bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-102';
              } else if (isChosen && !isCorrect) {
                btnStyle = 'bg-rose-500 border-rose-500 text-white animate-shake';
              } else {
                btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <div key={option} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-5 sm:p-6 rounded-2xl border-3 font-black text-3xl sm:text-4xl shadow-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${btnStyle}`}
                >
                  <span className="font-sans">{option}</span>
                  <span className="text-[11px] font-bold opacity-80">
                    {isAnswered && isCorrect ? 'Đáp án đúng ✔' : isAnswered && isChosen ? 'Chưa đúng ❌' : 'Bấm chọn'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speechReader.pronouncePhoneme(option);
                  }}
                  className="py-1 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1 border border-purple-200 cursor-pointer transition-colors shadow-2xs"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nghe phát âm: "{option}"</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Immediate feedback after picking */}
        {isAnswered && (
          <div
            className={`p-4 rounded-2xl border-2 text-left max-w-lg mx-auto animate-pop mb-4 ${
              selectedOption === currentQ.correctOption
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-2xl flex-shrink-0">
                {selectedOption === currentQ.correctOption ? '🎉' : '💡'}
              </span>
              <div className="flex-1">
                <div className="font-extrabold text-sm sm:text-base">
                  {selectedOption === currentQ.correctOption
                    ? 'Bé giỏi quá! Đáp án hoàn toàn chính xác! (+1 ⭐)'
                    : `Chưa đúng rồi bé ơi! Từ đúng là: "${currentQ.word}"`}
                </div>
                <div className="text-xs sm:text-sm mt-1 text-slate-700 leading-relaxed font-medium">
                  {currentQ.ruleHint}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 py-3 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all cursor-pointer animate-pop"
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Rhyme / Rule Quick Box */}
      {currentRule && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm mb-1">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Mẹo nhớ của cô giáo: {currentRule.title}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
            "{currentRule.poem}"
          </p>
        </div>
      )}

      {/* Teacher Mascot */}
      <MascotMessage
        message={
          isAnswered
            ? selectedOption === currentQ.correctOption
              ? 'Bé phân biệt âm rất nhạy bén! Tiếp tục phát huy nào!'
              : 'Đừng lo bé nhé, mỗi lần nhầm là một lần nhớ sâu hơn! Hãy đọc kỹ mẹo nhớ của cô nha.'
            : 'Bé hãy nhìn kỹ hình vẽ và đọc nhẩm xem chữ cái nào mới ghép đúng nha!'
        }
        mood={isAnswered ? (selectedOption === currentQ.correctOption ? 'celebrating' : 'gentle') : 'happy'}
      />
    </div>
  );
};
