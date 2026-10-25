import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Volume1,
  RotateCcw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Award,
  Star,
  Flame,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BookLop2,
  LessonLop2,
  SpellingWordLop2,
  SpellingCheckResult,
  CharDiffItem,
  ERROR_GROUPS_META,
} from '../types/spelling';
import { fetchBooks, fetchLessons, fetchWords, saveStudentMistake } from '../firebase/spellingDataService';
import { evaluateSpelling } from '../utils/spellingDiff';
import { speechReader, sfx } from '../utils/audioSpeech';

interface StudentPracticeScreenProps {
  stars: number;
  onAddStars: (amount: number) => void;
  streak: number;
  onIncrementStreak: () => void;
  onOpenNotebook: () => void;
}

export const StudentPracticeScreen: React.FC<StudentPracticeScreenProps> = ({
  stars,
  onAddStars,
  streak,
  onIncrementStreak,
  onOpenNotebook,
}) => {
  // Curriculum data
  const [books, setBooks] = useState<BookLop2[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [lessons, setLessons] = useState<LessonLop2[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [words, setWords] = useState<SpellingWordLop2[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState<boolean>(true);

  // Practice session state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<SpellingCheckResult | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [retryAttemptUsed, setRetryAttemptUsed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Statistics for the current round (5-10 words)
  const [roundStats, setRoundStats] = useState<{
    correctCount: number;
    wrongCount: number;
    masteredWords: string[];
    mistakeWords: string[];
  }>({
    correctCount: 0,
    wrongCount: 0,
    masteredWords: [],
    mistakeWords: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Tải danh mục sách & bài học
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingCurriculum(true);
      try {
        const loadedBooks = await fetchBooks();
        if (!isMounted) return;
        setBooks(loadedBooks);

        const initialBookId = loadedBooks[0]?.id || '';
        setSelectedBookId(initialBookId);

        const loadedLessons = await fetchLessons(initialBookId);
        if (!isMounted) return;
        setLessons(loadedLessons);

        const initialLessonId = loadedLessons[0]?.id || '';
        setSelectedLessonId(initialLessonId);

        if (initialLessonId) {
          const loadedWords = await fetchWords(initialLessonId);
          if (isMounted) {
            // Giới hạn 5-10 từ cho một lượt luyện để bé không bị mỏi
            const roundWords = loadedWords.slice(0, 10);
            setWords(roundWords);
          }
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu giáo trình:', err);
      } finally {
        if (isMounted) setIsLoadingCurriculum(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Khi học sinh chọn bộ sách khác
  const handleSelectBook = async (bookId: string) => {
    setSelectedBookId(bookId);
    setIsLoadingCurriculum(true);
    const loadedLessons = await fetchLessons(bookId);
    setLessons(loadedLessons);
    const firstLessonId = loadedLessons[0]?.id || '';
    setSelectedLessonId(firstLessonId);
    if (firstLessonId) {
      const loadedWords = await fetchWords(firstLessonId);
      setWords(loadedWords.slice(0, 10));
    } else {
      setWords([]);
    }
    resetRoundState();
    setIsLoadingCurriculum(false);
  };

  // Khi học sinh chọn bài học / tuần khác
  const handleSelectLesson = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsLoadingCurriculum(true);
    const loadedWords = await fetchWords(lessonId);
    setWords(loadedWords.slice(0, 10));
    resetRoundState();
    setIsLoadingCurriculum(false);
  };

  const resetRoundState = () => {
    setCurrentIndex(0);
    setUserInput('');
    setCheckResult(null);
    setHasChecked(false);
    setRetryAttemptUsed(false);
    setShowHint(false);
    setSessionCompleted(false);
    setRoundStats({
      correctCount: 0,
      wrongCount: 0,
      masteredWords: [],
      mistakeWords: [],
    });
  };

  const currentWord = words[currentIndex];

  // Tự động phát âm thanh khi chuyển sang từ mới
  useEffect(() => {
    if (currentWord && !sessionCompleted && !hasChecked) {
      setUserInput('');
      setCheckResult(null);
      setHasChecked(false);
      setRetryAttemptUsed(false);
      setShowHint(false);

      // Đọc to, chậm rãi khoảng 0.7x
      const timer = setTimeout(() => {
        handleSpeakNormal();
        inputRef.current?.focus();
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, sessionCompleted]);

  // Nghe đọc bình thường (~0.7x chuẩn sư phạm lớp 2)
  const handleSpeakNormal = () => {
    if (!currentWord) return;
    setIsSpeaking(true);
    speechReader.speakSlowly(currentWord.text, () => {
      setIsSpeaking(false);
    });
  };

  // Nghe chậm hơn (~0.5x cho bé nghe thật rõ từng âm vần)
  const handleSpeakVerySlow = () => {
    if (!currentWord) return;
    setIsSpeaking(true);
    speechReader.speakVerySlow(currentWord.text, () => {
      setIsSpeaking(false);
    });
  };

  // Kiểm tra bài viết
  const handleCheckSpelling = () => {
    if (!currentWord) return;
    if (!userInput.trim()) {
      inputRef.current?.focus();
      return;
    }

    const result = evaluateSpelling(
      currentWord.text,
      userInput,
      currentWord.errorCategory,
      currentWord.hint
    );
    setCheckResult(result);
    setHasChecked(true);

    if (result.isCorrect) {
      // ĐÚNG: Tặng sao, tăng chuỗi, âm thanh vui vẻ
      sfx.playSuccess();
      onAddStars(2);
      onIncrementStreak();

      setRoundStats((prev) => ({
        ...prev,
        correctCount: prev.correctCount + 1,
        masteredWords: [...prev.masteredWords, currentWord.text],
      }));

      // Đánh dấu từ đã thuộc trong Sổ từ khó nếu trước đó từng sai
      saveStudentMistake(currentWord.text, currentWord.errorCategory, currentWord.hint, true);
    } else {
      // CHƯA ĐÚNG: Âm thanh động viên nhẹ nhàng (không gây sợ)
      sfx.playEncouragement();

      // Lưu vào Sổ từ khó để ôn luyện
      saveStudentMistake(currentWord.text, currentWord.errorCategory, currentWord.hint, false);

      setRoundStats((prev) => ({
        ...prev,
        wrongCount: prev.wrongCount + 1,
        mistakeWords: Array.from(new Set([...prev.mistakeWords, currentWord.text])),
      }));
    }
  };

  // Cho phép bé viết lại ngay 1 lần trước khi qua từ tiếp theo
  const handleRetryOnce = () => {
    setRetryAttemptUsed(true);
    setHasChecked(false);
    setCheckResult(null);
    setUserInput('');
    setTimeout(() => {
      handleSpeakVerySlow();
      inputRef.current?.focus();
    }, 200);
  };

  // Sang từ tiếp theo
  const handleNextWord = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hoàn thành lượt luyện (5-10 từ)
      setSessionCompleted(true);
      sfx.playVictory();
      onAddStars(5); // Thưởng thêm 5 sao hoàn thành bài
    }
  };

  // Bắt đầu lại lượt luyện này
  const handleRestartRound = () => {
    resetRoundState();
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);
  const currentCategoryMeta = currentWord ? ERROR_GROUPS_META[currentWord.errorCategory] : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. KHU VỰC CHỌN SÁCH & BÀI HỌC (THÂN THIỆN CHO HỌC SINH LỚP 2) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Chọn Bộ Sách */}
          <div className="flex-1">
            <label className="block text-xs font-black uppercase text-amber-900 tracking-wide mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" /> Bộ Sách Tiếng Việt Lớp 2:
            </label>
            <div className="flex flex-wrap gap-2">
              {books.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBook(b.id)}
                  className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${
                    selectedBookId === b.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  }`}
                >
                  <span>{b.title || b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Bài / Tuần */}
          <div className="sm:w-64">
            <label className="block text-xs font-black uppercase text-amber-900 tracking-wide mb-1.5">
              Chọn Bài Học / Tuần:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => handleSelectLesson(e.target.value)}
              className="w-full px-3 py-2.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG LUYỆN CHÍNH TẢ */}
      {isLoadingCurriculum ? (
        <div className="bg-white rounded-3xl p-12 text-center border-4 border-amber-200 shadow-md">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-base font-bold text-amber-900">Đang chuẩn bị bài học vui cho bé...</p>
        </div>
      ) : words.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-4 border-amber-200 shadow-md">
          <p className="text-base font-bold text-amber-900 mb-2">Bài học này chưa có từ luyện viết.</p>
          <p className="text-xs text-gray-500">
            Cô giáo hãy mở phần "Dành cho giáo viên" để thêm từ mới cho bài này nhé!
          </p>
        </div>
      ) : sessionCompleted ? (
        /* 3. MÀN HÌNH HOÀN THÀNH LƯỢT LUYỆN (5-10 TỪ) */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-emerald-300 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
            🎉
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
              Hoan Hô Bé Đã Hoàn Thành Bài Luyện!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
              Bé đã luyện xong {words.length} từ chính tả của bài {selectedLesson?.title}!
            </p>
          </div>

          {/* Thống kê sao và điểm số */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">⭐</span>
              <p className="text-xl font-black text-amber-900 mt-1">+{roundStats.correctCount * 2 + 5}</p>
              <p className="text-xs font-bold text-amber-700">Sao Thưởng</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">🎯</span>
              <p className="text-xl font-black text-emerald-900 mt-1">
                {Math.round((roundStats.correctCount / words.length) * 100)}%
              </p>
              <p className="text-xs font-bold text-emerald-700">Chính Xác</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-xl font-black text-blue-900 mt-1">{roundStats.correctCount}</p>
              <p className="text-xs font-bold text-blue-700">Viết Đúng</p>
            </div>
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">📖</span>
              <p className="text-xl font-black text-rose-900 mt-1">{roundStats.mistakeWords.length}</p>
              <p className="text-xs font-bold text-rose-700">Lưu Sổ Từ Khó</p>
            </div>
          </div>

          {/* Lời khích lệ sư phạm */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 max-w-xl mx-auto text-sm text-emerald-900 font-medium">
            {roundStats.wrongCount === 0 ? (
              <p className="font-bold text-emerald-800">
                🌟 Tuyệt đỉnh! Bé không viết sai một từ nào cả, chữ viết rất nắn nót và chuẩn xác!
              </p>
            ) : (
              <p>
                Bé đã làm rất tốt! Những từ chưa đúng ({roundStats.mistakeWords.join(', ')}) đã được lưu
                vào <strong className="text-emerald-950 font-bold">"Sổ từ khó"</strong> để bé luyện lại
                thành thạo hơn nhé!
              </p>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartRound}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Luyện Lại Bài Này
            </button>
            <button
              onClick={onOpenNotebook}
              className="px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Xem Sổ Từ Khó Của Bé ({roundStats.mistakeWords.length})
            </button>
          </div>
        </div>
      ) : (
        /* 4. MÀN HÌNH NGHE - VIẾT CHÍNH TẢ (GIAO DIỆN CHÍNH DÀNH CHO BÉ LỚP 2) */
        <div className="bg-white rounded-3xl p-5 sm:p-8 border-4 border-amber-300 shadow-xl space-y-6">
          {/* Thanh Tiến Trình Luyện Tập: 5-10 từ */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Từ số: {currentIndex + 1} / {words.length}
              </span>
              <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-bold">
                {selectedLesson?.title}
              </span>
            </div>
            {/* Thanh thanh tiến trình hoạt hình */}
            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Thẻ Nghe Phát Âm Cô Giáo */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 border-3 border-amber-200 text-center relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-amber-300 text-xs font-bold text-amber-900">
                <span>{currentCategoryMeta?.emoji}</span>
                <span>Nhóm chính tả: {currentCategoryMeta?.shortLabel}</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-amber-950">
                Bé hãy bấm loa để nghe cô đọc, rồi gõ lại thật chuẩn vào ô bên dưới nhé:
              </p>

              {/* Nút bấm nghe to rõ */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {/* 1. Nghe Lại (Tốc độ chuẩn 0.7x) */}
                <button
                  onClick={handleSpeakNormal}
                  disabled={isSpeaking}
                  className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg flex items-center gap-2.5 scale-102 active:scale-98"
                >
                  <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-bounce' : ''}`} />
                  <span>Nghe Lại (0.7x)</span>
                </button>

                {/* 2. Nghe Chậm Hơn (0.5x cho bé lớp 2 chép kịp) */}
                <button
                  onClick={handleSpeakVerySlow}
                  disabled={isSpeaking}
                  className="px-5 py-4 bg-white hover:bg-amber-100 text-amber-950 border-3 border-amber-300 font-bold rounded-2xl shadow-md transition-all text-sm sm:text-base flex items-center gap-2 active:scale-98"
                >
                  <Volume1 className="w-6 h-6 text-amber-600" />
                  <span>Nghe Chậm Hơn (0.5x)</span>
                </button>

                {/* 3. Nút Gợi ý nhẹ */}
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-4 py-4 bg-white hover:bg-sky-50 text-sky-700 border-2 border-sky-300 font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
                  title="Xem gợi ý mẹo nhớ"
                >
                  <HelpCircle className="w-5 h-5 text-sky-500" />
                  <span>Gợi ý</span>
                </button>
              </div>

              {/* Hộp gợi ý quy tắc hoặc chữ cái đầu */}
              {showHint && currentWord && (
                <div className="bg-white/90 border-2 border-sky-300 rounded-2xl p-3 text-xs sm:text-sm text-sky-950 text-left animate-in fade-in duration-200">
                  <p className="font-bold text-sky-900 flex items-center gap-1 mb-0.5">
                    💡 Mẹo nhỏ cho bé:
                  </p>
                  <p>{currentWord.hint || currentCategoryMeta?.ruleExplanation}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Chữ cái đầu: <span className="font-mono font-bold text-sky-700 text-xs">"{currentWord.text[0]}"</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ô NHẬP CHỮ TO RÕ - CỠ CHỮ TỐI THIỂU 28PX DÀNH CHO HỌC SINH LỚP 2 */}
          <div className="space-y-4">
            <div>
              <label className="block text-center text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                Ô GÕ BÀI CỦA BÉ (CỠ CHỮ TO RÕ RÀNG):
              </label>
              <div className="relative max-w-xl mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!hasChecked) {
                        handleCheckSpelling();
                      } else {
                        handleNextWord();
                      }
                    }
                  }}
                  disabled={hasChecked && checkResult?.isCorrect}
                  placeholder="Gõ chữ bé vừa nghe được vào đây..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  // Cỡ chữ tối thiểu 28px: text-[28px] sm:text-[34px] font-bold
                  className={`w-full py-4 px-6 text-center text-[28px] sm:text-[34px] font-bold rounded-3xl border-4 shadow-inner transition-all tracking-wide ${
                    hasChecked
                      ? checkResult?.isCorrect
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-400 ring-4 ring-emerald-200'
                        : 'bg-rose-50 text-rose-950 border-rose-400 ring-4 ring-rose-200'
                      : 'bg-white text-gray-900 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 focus:outline-hidden'
                  }`}
                />
              </div>
            </div>

            {/* KẾT QUẢ CHẤM BÀI: TÔ MÀU CHÍNH XÁC TỪNG KÝ TỰ BỊ SAI / DẤU BỊ SAI */}
            {hasChecked && checkResult && (
              <div
                className={`rounded-3xl p-5 border-3 animate-in fade-in slide-in-from-top-3 max-w-xl mx-auto ${
                  checkResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {/* Lời khuyên nhẹ nhàng */}
                <div className="flex items-center justify-center gap-2 font-black text-base sm:text-lg mb-3">
                  {checkResult.isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <span>{checkResult.feedbackMessage}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-rose-600" />
                      <span>Bé chú ý một chút nhé, cố lên nào!</span>
                    </>
                  )}
                </div>

                {/* BẢNG SO SÁNH TỪNG KÝ TỰ (DIFF VIỆT HOÁ) */}
                {!checkResult.isCorrect && (
                  <div className="space-y-3 bg-white/90 rounded-2xl p-4 border border-rose-200 text-center">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Bài bé vừa gõ (chữ đỏ là phần chưa chuẩn):
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1 text-2xl font-black py-1">
                        {checkResult.diffs.map((diff: CharDiffItem, i: number) => {
                          if (diff.type === 'correct') {
                            return (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300"
                              >
                                {diff.char}
                              </span>
                            );
                          }
                          if (diff.type === 'wrong') {
                            return (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded-lg bg-rose-200 text-rose-900 border-2 border-rose-400 underline decoration-rose-600"
                                title={`Đúng ra là: ${diff.expectedChar}`}
                              >
                                {diff.char}
                              </span>
                            );
                          }
                          if (diff.type === 'missing') {
                            return (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border-2 border-dashed border-amber-400"
                                title={`Thiếu chữ: ${diff.expectedChar}`}
                              >
                                ?
                              </span>
                            );
                          }
                          return (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-lg bg-gray-200 text-gray-600 line-through"
                              title="Chữ thừa"
                            >
                              {diff.char}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-100">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                        Đáp án đúng chuẩn tiếng Việt là:
                      </p>
                      <p className="text-3xl font-black text-emerald-950 tracking-wider">
                        {currentWord.text}
                      </p>
                    </div>

                    {/* Giải thích quy tắc nhẹ nhàng */}
                    {currentCategoryMeta?.ruleExplanation && (
                      <p className="text-xs text-gray-600 italic bg-amber-50 p-2 rounded-xl border border-amber-200">
                        💡 {currentCategoryMeta.ruleExplanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NÚT THAO TÁC CHÍNH */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!hasChecked ? (
                /* Nút Chấm Bài */
                <button
                  onClick={handleCheckSpelling}
                  disabled={!userInput.trim()}
                  className={`px-8 py-4 rounded-2xl font-black text-base sm:text-lg shadow-lg transition-all flex items-center gap-2 ${
                    userInput.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white scale-102 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Chấm Bài Bé Viết</span>
                </button>
              ) : checkResult?.isCorrect ? (
                /* Khi đúng -> Sang từ tiếp theo */
                <button
                  onClick={handleNextWord}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-base sm:text-lg shadow-lg transition-all flex items-center gap-2 scale-102"
                >
                  <span>Từ Tiếp Theo</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                /* Khi sai: Cho phép bé viết lại ngay 1 lần hoặc sang tiếp */
                <div className="flex flex-wrap items-center gap-3">
                  {!retryAttemptUsed && (
                    <button
                      onClick={handleRetryOnce}
                      className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Viết Lại Ngay (Cố Lên!)</span>
                    </button>
                  )}
                  <button
                    onClick={handleNextWord}
                    className="px-6 py-3.5 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-2xl text-sm sm:text-base shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Qua Từ Tiếp Theo</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
