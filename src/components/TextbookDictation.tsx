import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Volume2,
  Volume1,
  RotateCcw,
  SkipForward,
  SkipBack,
  Upload,
  Camera,
  CheckCircle,
  Sparkles,
  MousePointerClick,
  FileText,
  ChevronRight,
  ArrowLeft,
  Star,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Video,
  Lock,
  Unlock,
  Check,
  Pause,
  Play,
  Clock,
  HelpCircle,
  TrendingDown,
  BarChart3,
  Calendar,
  Flame,
  Edit2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { BookItem, BookSection, UserRole, SpellingErrorGroup } from '../types/spelling';
import {
  DEFAULT_BOOKSHELF,
  getStoredBooks,
  saveCustomBook,
  deleteCustomBook,
  saveLessonProgress,
  getStoredLessonProgress,
  saveDictationHistoryRecord,
  getDraftDictationSession,
  saveDraftDictationSession,
  clearDraftDictationSession,
  DraftDictationSession,
} from '../data/bookShelfData';
import { speechReader, sfx } from '../utils/audioSpeech';
import {
  proofreadTextbookDictation,
  TextbookProofreadResult,
  WordDiffItem,
} from '../utils/textbookProofreader';
import { saveStudentMistake } from '../firebase/spellingDataService';
import { TextbookReviewModal } from './TextbookReviewModal';
import { ParentProgressModal } from './ParentProgressModal';

interface TextbookDictationProps {
  onOpenCheckCamera?: (lessonText: string) => void;
  onAddStar: (count: number) => void;
  soundEnabled: boolean;
  userRole?: UserRole;
  currentGrade?: number;
  onChangeGrade?: (grade: number) => void;
  onCopyStudentLink?: () => void;
}

type DictationMode = 'practice' | 'test'; // Luyện tập (gợi ý, nghe thoải mái) | Kiểm tra (không gợi ý, nghe tối đa 2 lần)
type DictationRound = 'round1_overview' | 'round2_writing' | 'round3_review'; // 3 lượt đọc của giáo viên tiểu học
type WaitDurationOption = 5 | 8 | 12; // Thời gian chờ giữa các cụm từ (ngắn 5s / vừa 8s / dài 12s)

export const TextbookDictation: React.FC<TextbookDictationProps> = ({
  onAddStar,
  soundEnabled,
  userRole = 'student',
  currentGrade = 2,
  onCopyStudentLink,
}) => {
  const isTeacher = userRole === 'owner' || userRole === 'teacher';

  // 1. Quản lý danh mục sách
  const [books, setBooks] = useState<BookItem[]>(() => getStoredBooks());
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    const list = getStoredBooks();
    return list[0]?.id || DEFAULT_BOOKSHELF[0].id;
  });
  const [shelfGradeFilter, setShelfGradeFilter] = useState<number | 'all'>(currentGrade || 2);

  // Điều hướng màn hình
  // 'shelf' (kệ sách ngoài) | 'book_reader' (chọn bài/đoạn) | 'dictation' (đang chép 3 lượt) | 'proofread' (dò bài chấm code)
  const [navState, setNavState] = useState<'shelf' | 'book_reader' | 'dictation' | 'proofread'>('shelf');

  // Bài học & đoạn văn đang chọn
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedParaIndex, setSelectedParaIndex] = useState<number | 'all'>('all');
  const [targetProofreadText, setTargetProofreadText] = useState<string>('');

  // Chế độ học tập
  const [dictationMode, setDictationMode] = useState<DictationMode>('practice');

  // 2. Quy trình 3 Lượt đọc cho bé viết
  const [dictationRound, setDictationRound] = useState<DictationRound>('round1_overview');
  const [activeChunks, setActiveChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [chunkRepeatCount, setChunkRepeatCount] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Thời gian chờ giữa các cụm từ (5s / 8s / 12s)
  const [waitDuration, setWaitDuration] = useState<WaitDurationOption>(8);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const countdownTimerRef = useRef<any>(null);

  // 3. Bài làm của học sinh (Cách A: gõ phím to | Cách B: chụp ảnh vở)
  const [studentTypedText, setStudentTypedText] = useState<string>('');
  const [activeSubmissionTab, setActiveSubmissionTab] = useState<'typing' | 'camera'>('typing');

  // OCR chữ viết tay & Màn hình xác nhận văn bản
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrTranscribedDraft, setOcrTranscribedDraft] = useState<string>('');
  const [showOcrConfirmModal, setShowOcrConfirmModal] = useState<boolean>(false);
  const [ocrPhotoPreview, setOcrPhotoPreview] = useState<string | null>(null);
  const [ocrErrorMessage, setOcrErrorMessage] = useState<string>('');
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 4. Kết quả chấm bài bằng thuật toán Code
  const [proofreadResult, setProofreadResult] = useState<TextbookProofreadResult | null>(null);
  const [miniRetryWord, setMiniRetryWord] = useState<{ wrong: string; correct: string } | null>(null);
  const [miniRetryInput, setMiniRetryInput] = useState<string>('');
  const [miniRetrySuccess, setMiniRetrySuccess] = useState<boolean | null>(null);

  // 5. Modals quản lý & phụ huynh
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [bookToReview, setBookToReview] = useState<BookItem | null>(null);
  const [showParentModal, setShowParentModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload SGK state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadBookTitle, setUploadBookTitle] = useState<string>('');
  const [uploadRawText, setUploadRawText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const bookFileInputRef = useRef<HTMLInputElement>(null);

  // Khôi phục bài viết đang dở (Draft)
  const [draftPromptSession, setDraftPromptSession] = useState<DraftDictationSession | null>(null);

  // Tiến độ đã lưu (điểm gần nhất & sao)
  const [progressMap, setProgressMap] = useState<Record<string, any>>(() => getStoredLessonProgress());

  // Kiểm tra giọng đọc tiếng Việt
  const [hasViVoice, setHasViVoice] = useState<boolean>(true);

  useEffect(() => {
    setHasViVoice(speechReader.hasLocalVietnameseVoice());
    // Kiểm tra draft
    const draft = getDraftDictationSession();
    if (draft && draft.studentText.trim()) {
      setDraftPromptSession(draft);
    }
  }, []);

  const activeBook = books.find((b) => b.id === selectedBookId) || books[0];
  const activeSection =
    activeBook?.sections?.find((s) => s.id === selectedSectionId) || activeBook?.sections?.[0] || null;

  // Lọc bài học: Học sinh chỉ thấy bài đã được giáo viên duyệt (`isPublished !== false`)
  const visibleSections = (activeBook?.sections || []).filter((s) => {
    if (isTeacher) return true;
    return s.isPublished !== false;
  });

  // Tự động lưu nháp khi đang ở màn hình dictation
  useEffect(() => {
    if (navState === 'dictation' && activeBook && activeSection && studentTypedText.trim()) {
      saveDraftDictationSession({
        bookId: activeBook.id,
        sectionId: activeSection.id,
        sectionTitle: activeSection.title,
        paraIndex: selectedParaIndex,
        studentText: studentTypedText,
        currentChunkIndex,
        mode: dictationMode,
        savedAt: new Date().toLocaleTimeString('vi-VN'),
      });
    }
  }, [navState, studentTypedText, currentChunkIndex, activeBook, activeSection, selectedParaIndex, dictationMode]);

  // Đếm ngược thời gian chờ giữa các cụm từ
  useEffect(() => {
    if (countdownRemaining > 0 && !isPaused && navState === 'dictation' && dictationRound === 'round2_writing') {
      countdownTimerRef.current = setTimeout(() => {
        setCountdownRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(countdownTimerRef.current);
    } else if (countdownRemaining === 0 && !isPaused && navState === 'dictation' && dictationRound === 'round2_writing') {
      // Khi hết thời gian chờ -> tự động chuyển sang cụm tiếp theo nếu còn
      // (hoặc chờ bé bấm nút Tiếp tục)
    }
  }, [countdownRemaining, isPaused, navState, dictationRound]);

  // ==========================================
  // KHỞI ĐỘNG BÀI VIẾT CHÍNH TẢ (3 LƯỢT ĐỌC)
  // ==========================================
  const handleStartDictation = (section: BookSection, paraIdx: number | 'all') => {
    setSelectedSectionId(section.id);
    setSelectedParaIndex(paraIdx);

    let textToDictate = section.fullText || section.content || '';
    if (paraIdx !== 'all' && section.paragraphs && section.paragraphs[paraIdx]) {
      textToDictate = section.paragraphs[paraIdx];
    }

    // Tách văn bản thành các cụm từ 3-5 chữ
    const chunks = section.chunks && section.chunks.length > 0
      ? section.chunks
      : splitIntoChunks3To5Words(textToDictate);

    setActiveChunks(chunks);
    setCurrentChunkIndex(0);
    setChunkRepeatCount(0);
    setTargetProofreadText(textToDictate);
    setStudentTypedText('');
    setProofreadResult(null);
    setIsPaused(false);

    // BẮT ĐẦU LƯỢT 1: Đọc toàn bộ đoạn văn 1 lần để bé nghe hiểu
    setDictationRound('round1_overview');
    setNavState('dictation');

    if (soundEnabled) sfx.playTeacherBell();

    setTimeout(() => {
      handlePlayRound1Overview(textToDictate);
    }, 450);
  };

  // Khôi phục nháp đang dở
  const handleRestoreDraft = () => {
    if (!draftPromptSession) return;
    const targetBook = books.find((b) => b.id === draftPromptSession.bookId);
    if (targetBook) {
      setSelectedBookId(targetBook.id);
      const sec = targetBook.sections.find((s) => s.id === draftPromptSession.sectionId);
      if (sec) {
        setSelectedSectionId(sec.id);
        setSelectedParaIndex(draftPromptSession.paraIndex);
        setStudentTypedText(draftPromptSession.studentText);
        setCurrentChunkIndex(draftPromptSession.currentChunkIndex);
        setDictationMode(draftPromptSession.mode);

        let textToDictate = sec.fullText || sec.content || '';
        if (draftPromptSession.paraIndex !== 'all' && sec.paragraphs && sec.paragraphs[draftPromptSession.paraIndex]) {
          textToDictate = sec.paragraphs[draftPromptSession.paraIndex];
        }
        setTargetProofreadText(textToDictate);
        setActiveChunks(sec.chunks && sec.chunks.length > 0 ? sec.chunks : splitIntoChunks3To5Words(textToDictate));
        setDictationRound('round2_writing');
        setNavState('dictation');
        setDraftPromptSession(null);
        return;
      }
    }
    setDraftPromptSession(null);
  };

  // ==========================================
  // XỬ LÝ ÂM THANH 3 LƯỢT ĐỌC
  // ==========================================
  // Lượt 1: Đọc cả đoạn văn một lần
  const handlePlayRound1Overview = (textOverride?: string) => {
    const text = textOverride || targetProofreadText;
    if (!text) return;
    setIsSpeaking(true);
    speechReader.speakSlowly(text, () => {
      setIsSpeaking(false);
    });
  };

  // Chuyển sang Lượt 2: Đọc từng cụm từ (mỗi cụm 2 lần)
  const handleStartRound2Writing = () => {
    setDictationRound('round2_writing');
    setCurrentChunkIndex(0);
    setChunkRepeatCount(0);
    playCurrentChunkTwice(0);
  };

  // Đọc mỗi cụm từ 2 lần (chuẩn phương pháp sư phạm tiểu học)
  const playCurrentChunkTwice = (chunkIdx: number) => {
    const chunk = activeChunks[chunkIdx];
    if (!chunk) return;

    setIsSpeaking(true);
    setCountdownRemaining(0);

    // Lần 1
    speechReader.speakSlowly(chunk, () => {
      // Nghỉ 1.2s rồi đọc Lần 2
      setTimeout(() => {
        if (!isPaused) {
          speechReader.speakSlowly(chunk, () => {
            setIsSpeaking(false);
            setChunkRepeatCount(2);
            // Bắt đầu đếm ngược thời gian chờ bé viết
            setCountdownRemaining(waitDuration);
          });
        } else {
          setIsSpeaking(false);
        }
      }, 1200);
    });
  };

  // Nghe lại cụm hiện tại
  const handleReplayCurrentChunk = () => {
    if (dictationMode === 'test' && chunkRepeatCount >= 2) {
      alert('Ở chế độ Kiểm tra, mỗi cụm từ chỉ được nghe lại tối đa 2 lần con nhé!');
      return;
    }
    const chunk = activeChunks[currentChunkIndex];
    if (!chunk) return;

    setIsSpeaking(true);
    setChunkRepeatCount((prev) => prev + 1);
    setCountdownRemaining(0);

    speechReader.speakSlowly(chunk, () => {
      setIsSpeaking(false);
      setCountdownRemaining(waitDuration);
    });
  };

  // Nghe chậm hơn (tốc độ ~0.5x)
  const handlePlayCurrentChunkVerySlow = () => {
    if (dictationMode === 'test' && chunkRepeatCount >= 2) {
      alert('Ở chế độ Kiểm tra, mỗi cụm từ chỉ được nghe lại tối đa 2 lần con nhé!');
      return;
    }
    const chunk = activeChunks[currentChunkIndex];
    if (!chunk) return;

    setIsSpeaking(true);
    setChunkRepeatCount((prev) => prev + 1);
    setCountdownRemaining(0);

    speechReader.speakVerySlow(chunk, () => {
      setIsSpeaking(false);
      setCountdownRemaining(waitDuration);
    });
  };

  // Chuyển sang cụm từ tiếp theo
  const handleNextChunk = () => {
    clearTimeout(countdownTimerRef.current);
    if (currentChunkIndex + 1 < activeChunks.length) {
      const nextIdx = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIdx);
      setChunkRepeatCount(0);
      if (soundEnabled) sfx.playSuccess();
      playCurrentChunkTwice(nextIdx);
    } else {
      // Đã chép xong hết các cụm -> Chuyển sang LƯỢT 3: Đọc lại toàn đoạn để soát bài
      if (soundEnabled) sfx.playFanfare();
      setDictationRound('round3_review');
      setIsSpeaking(true);
      speechReader.speakSlowly(targetProofreadText, () => {
        setIsSpeaking(false);
      });
    }
  };

  // Lùi lại cụm trước
  const handlePrevChunk = () => {
    clearTimeout(countdownTimerRef.current);
    if (currentChunkIndex > 0) {
      const prevIdx = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIdx);
      setChunkRepeatCount(0);
      playCurrentChunkTwice(prevIdx);
    }
  };

  // Tạm dừng / Tiếp tục
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (countdownRemaining > 0) {
        // Tiếp tục đếm ngược
      } else {
        playCurrentChunkTwice(currentChunkIndex);
      }
    } else {
      setIsPaused(true);
      speechReader.stop();
      setIsSpeaking(false);
    }
  };

  // ==========================================
  // XỬ LÝ NỘP BÀI QUA ẢNH CHỤP VỞ (CÁCH B)
  // ==========================================
  const handlePhotoUploadForOcr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOcrPhotoPreview(base64);
      processHandwritingOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  const processHandwritingOcr = async (imageBase64: string) => {
    setIsOcrProcessing(true);
    setOcrErrorMessage('');
    try {
      const res = await fetch('/api/check-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          expectedText: targetProofreadText,
          gradeLevel: currentGrade || 2,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Hiện văn bản đã nhận dạng để phụ huynh / bé kiểm tra lại trước khi chấm
        setOcrTranscribedDraft(json.data.transcribedText || '');
        setShowOcrConfirmModal(true);
      } else {
        setOcrErrorMessage(json.error || 'Chưa đọc rõ ảnh vở. Bé hãy chụp rõ nét hơn nhé!');
      }
    } catch (err: any) {
      setOcrErrorMessage('Lỗi kết nối máy chủ nhận diện: ' + err.message);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Xác nhận văn bản sau khi phụ huynh/bé đã soát lại
  const handleConfirmOcrTextAndProofread = () => {
    const finalText = ocrTranscribedDraft.trim();
    if (!finalText) {
      alert('Vui lòng kiểm tra lại văn bản của bài viết!');
      return;
    }
    setStudentTypedText(finalText);
    setShowOcrConfirmModal(false);
    executeProofread(finalText, 'camera');
  };

  // ==========================================
  // CHẤM BÀI CHÍNH XÁC BẰNG THUẬT TOÁN CODE
  // ==========================================
  const executeProofread = (textToEvaluate: string, submissionType: 'typing' | 'camera' = 'typing') => {
    if (!textToEvaluate.trim()) {
      alert('Bé hãy nhập hoặc chụp bài viết trước khi bấm Chấm bài nhé!');
      return;
    }

    // Chấm hoàn toàn bằng thuật toán đối chiếu Unicode NFC
    const result = proofreadTextbookDictation(targetProofreadText, textToEvaluate);
    setProofreadResult(result);
    setNavState('proofread');
    clearDraftDictationSession();

    // Thưởng sao
    if (result.score >= 9) {
      if (soundEnabled) sfx.playFanfare();
      onAddStar(result.stars + 2);
    } else if (result.score >= 7) {
      if (soundEnabled) sfx.playSuccess();
      onAddStar(result.stars);
    } else {
      if (soundEnabled) sfx.playTeacherBell();
      onAddStar(1);
    }

    // Lưu kết quả tiến độ & lịch sử
    if (activeSection) {
      saveLessonProgress(activeSection.id, result.score, result.stars, result.accuracyPercent);
      setProgressMap(getStoredLessonProgress());

      saveDictationHistoryRecord({
        bookTitle: activeBook?.title || 'Sách Tiếng Việt',
        sectionTitle: activeSection.title,
        mode: dictationMode,
        submissionType,
        score: result.score,
        stars: result.stars,
        accuracy: result.accuracyPercent,
        totalWords: result.totalExpectedWords,
        wrongWordsCount: result.wrongWordsCount,
        mistakes: result.mistakeWordsList.map((m) => ({
          wrong: m.wrong,
          correct: m.correct,
          category: m.category,
        })),
      });

      // Tự động lưu các từ viết sai vào Sổ từ khó của học sinh
      result.mistakeWordsList.forEach((m) => {
        saveStudentMistake(m.correct, m.category, m.hint, false);
      });
    }
  };

  // Luyện sửa lại từ sai ngay lập tức
  const handleStartMiniRetry = (wrong: string, correct: string) => {
    setMiniRetryWord({ wrong, correct });
    setMiniRetryInput('');
    setMiniRetrySuccess(null);
    speechReader.speakSlowly(correct);
  };

  const handleCheckMiniRetry = () => {
    if (!miniRetryWord || !miniRetryInput.trim()) return;
    const isCorrect = miniRetryInput.trim().toLowerCase() === miniRetryWord.correct.toLowerCase();
    setMiniRetrySuccess(isCorrect);
    if (isCorrect) {
      sfx.playSuccess();
      onAddStar(1);
      saveStudentMistake(miniRetryWord.correct, 'khac', 'Đã viết lại đúng', true);
    } else {
      sfx.playEncouragement();
    }
  };

  // Nghe lại câu có lỗi
  const handlePlayMistakeSentence = (sentence: string) => {
    if (!sentence) return;
    speechReader.speakSlowly(sentence);
  };

  // ==========================================
  // XỬ LÝ GIÁO VIÊN TẢI SÁCH LÊN & GEMINI TÁCH BÀI
  // ==========================================
  const handleUploadBookFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await callExtractBookApi(base64Data, file.type, file.name);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError('Lỗi đọc file: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleUploadRawText = async () => {
    if (!uploadRawText.trim()) {
      setUploadError('Vui lòng dán nội dung văn bản bài đọc!');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    await callExtractBookApi(null, null, uploadBookTitle.trim() || 'Sách giáo viên tải lên', uploadRawText);
  };

  const callExtractBookApi = async (
    fileBase64: string | null,
    mimeType: string | null,
    fileName: string,
    rawText?: string
  ) => {
    try {
      const body: any = {
        gradeLevel: currentGrade || 2,
      };
      if (fileBase64) {
        body.fileBase64 = fileBase64;
        body.mimeType = mimeType || 'image/jpeg';
      } else if (rawText) {
        body.rawText = rawText;
      }

      const res = await fetch('/api/extract-book-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        const newBookId = `book_upload_${Date.now()}`;

        // Chuẩn bị các bài đọc đã tách
        let extractedSections: BookSection[] = [];
        if (data.sections && data.sections.length > 0) {
          extractedSections = data.sections.map((sec: any, idx: number) => ({
            id: `sec_${Date.now()}_${idx}`,
            sectionNumber: sec.sectionNumber || `Bài ${idx + 1}`,
            title: sec.title || `Bài đọc số ${idx + 1}`,
            fullText: sec.fullText || data.fullText,
            paragraphs: sec.paragraphs || (sec.fullText ? sec.fullText.split('\n\n') : []),
            sentences: sec.sentences || [],
            chunks: sec.chunks || splitIntoChunks3To5Words(sec.fullText || ''),
            guideNotes: sec.guideNotes || 'Chú ý viết hoa đầu câu và dấu thanh chuẩn tiếng Việt.',
            emoji: sec.emoji || '📖',
            isPublished: false, // Bắt buộc giáo viên duyệt trước khi xuất bản cho bé
          }));
        } else {
          extractedSections = [
            {
              id: `sec_${Date.now()}_1`,
              sectionNumber: 'Bài 1',
              title: data.title || fileName.replace(/\.[^/.]+$/, ''),
              fullText: data.fullText,
              paragraphs: data.paragraphs || data.fullText.split('\n\n'),
              chunks: data.chunks?.map((c: any) => (typeof c === 'string' ? c : c.text)) || splitIntoChunks3To5Words(data.fullText),
              guideNotes: 'Chú ý viết nắn nót, đúng độ cao ô ly và dấu câu.',
              emoji: '📘',
              isPublished: false,
            },
          ];
        }

        const newBook: BookItem = {
          id: newBookId,
          title: data.bookTitle || uploadBookTitle.trim() || fileName.replace(/\.[^/.]+$/, ''),
          publisher: 'Giáo viên biên soạn',
          grade: `Lớp ${currentGrade || 2}`,
          gradeLevel: currentGrade || 2,
          coverBg: 'from-amber-500 via-orange-600 to-amber-700',
          coverIcon: '📚',
          description: `Tài liệu do giáo viên tải lên. Đã dùng AI tách thành ${extractedSections.length} bài đọc chính tả.`,
          sections: extractedSections,
          isCustom: true,
        };

        const updatedList = saveCustomBook(newBook);
        setBooks(updatedList);
        setSelectedBookId(newBook.id);
        setShowUploadModal(false);
        setIsUploading(false);

        // BẮT BUỘC MỞ MÀN HÌNH "DUYỆT NỘI DUNG" ĐỂ GIÁO VIÊN KIỂM TRA TRƯỚC KHI XUẤT BẢN CHO BÉ
        setBookToReview(newBook);
        setShowReviewModal(true);
      } else {
        setUploadError(json.error || 'Không thể tách bài học từ tài liệu này.');
        setIsUploading(false);
      }
    } catch (err: any) {
      setUploadError('Lỗi xử lý file: ' + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 0. CẢNH BÁO GIỌNG ĐỌC NẾU THIẾT BỊ THIẾU GIỌNG VIỆT NỘI BỘ */}
      {!hasViVoice && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3 text-xs sm:text-sm text-sky-950 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>
              Thiết bị đang dùng giọng cô giáo <strong className="text-sky-900 font-bold">Gemini TTS trực tuyến</strong> chuẩn Tiếng Việt ngọt ngào để đọc bài cho con!
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-800 text-[11px] font-black shrink-0">
            ✓ Trực tuyến
          </span>
        </div>
      )}

      {/* THÔNG BÁO KHÔI PHỤC BÀI VIẾT ĐANG DỞ (DRAFT SESSION) */}
      {draftPromptSession && navState === 'shelf' && (
        <div className="bg-amber-100 border-3 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 animate-in zoom-in-95 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl font-black">
              📝
            </div>
            <div>
              <p className="font-black text-sm sm:text-base">
                Con có muốn viết tiếp bài "{draftPromptSession.sectionTitle}" đang dở không?
              </p>
              <p className="text-xs text-amber-800">
                Lần trước con đã viết được {draftPromptSession.studentText.split(/\s+/).filter(Boolean).length} chữ (Lưu lúc {draftPromptSession.savedAt})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearDraftDictationSession();
                setDraftPromptSession(null);
              }}
              className="px-3.5 py-2 bg-white/80 hover:bg-white text-gray-700 font-bold rounded-xl text-xs transition-colors"
            >
              Bỏ qua
            </button>
            <button
              onClick={handleRestoreDraft}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Viết tiếp ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MÀN HÌNH KỆ SÁCH (BÉ CHỌN SÁCH & BÀI, HÌNH BÌA TO DỄ BẤM) */}
      {/* ============================================================== */}
      {navState === 'shelf' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Thanh tiện ích trên cùng */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-200 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-amber-950">
                  Sách Giáo Khoa Tiếng Việt – Nghe Đọc Viết Bài
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {isTeacher
                    ? 'Chế độ Giáo Viên: Tải sách PDF, duyệt bài và quản lý bài đọc'
                    : 'Chế độ Học Sinh: Chọn bài học, nghe cô đọc 3 lượt và chép bài'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nút xem báo cáo phụ huynh */}
              <button
                onClick={() => setShowParentModal(true)}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-300 font-bold rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
              >
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <span>Tiến Trình & Báo Cáo</span>
              </button>

              {/* Nút dành riêng cho Giáo viên: Tải sách mới */}
              {isTeacher && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải Sách Mới (PDF / Ảnh)</span>
                </button>
              )}
            </div>
          </div>

          {/* Danh sách các cuốn sách (Bìa to, trực quan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => {
              const isSelected = selectedBookId === book.id;
              const sectionCount = (book.sections || []).length;
              const publishedCount = (book.sections || []).filter((s) => s.isPublished !== false).length;

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setSelectedBookId(book.id);
                    setNavState('book_reader');
                  }}
                  className={`rounded-3xl border-4 p-5 transition-all cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 shadow-xl scale-102 ring-4 ring-amber-200'
                      : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Bìa sách to */}
                    <div
                      className={`h-36 rounded-2xl bg-gradient-to-tr ${
                        book.coverBg || 'from-sky-500 to-blue-700'
                      } text-white p-4 flex flex-col justify-between shadow-md mb-4 relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{book.coverIcon || '📖'}</span>
                        <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                          {book.grade || 'Lớp 2'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/80 font-bold">{book.publisher}</p>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2">
                          {book.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {book.description || 'Tuyển tập các bài chính tả và tập đọc chuẩn tiểu học.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1 text-amber-800">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      {isTeacher ? `${sectionCount} bài (${publishedCount} đã xuất bản)` : `${publishedCount} bài đọc`}
                    </span>

                    <span className="text-amber-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Mở bài học <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MÀN HÌNH CHỌN BÀI / CHỌN ĐOẠN TRONG SÁCH */}
      {/* ============================================================== */}
      {navState === 'book_reader' && activeBook && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header chọn bài */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-200 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavState('shelf')}
                className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                title="Quay lại kệ sách"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Đang chọn bài trong cuốn:
                </span>
                <h2 className="text-lg sm:text-xl font-black text-amber-950">
                  {activeBook.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút dành riêng cho Giáo viên: Duyệt nội dung cuốn này */}
              {isTeacher && (
                <button
                  onClick={() => {
                    setBookToReview(activeBook);
                    setShowReviewModal(true);
                  }}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border-2 border-purple-300 font-bold rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Edit2 className="w-4 h-4 text-purple-600" />
                  <span>Duyệt & Sửa Nội Dung Bài</span>
                </button>
              )}

              {/* Chuyển chế độ Luyện tập / Kiểm tra */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-1 flex items-center text-xs font-bold">
                <button
                  onClick={() => setDictationMode('practice')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    dictationMode === 'practice'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  Luyện tập
                </button>
                <button
                  onClick={() => setDictationMode('test')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    dictationMode === 'test'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách các bài đọc trong sách */}
          <div className="space-y-4">
            {visibleSections.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-4 border-amber-200 shadow-md">
                <p className="text-base font-bold text-amber-900 mb-2">Cuốn sách này chưa có bài nào được xuất bản.</p>
                <p className="text-xs text-gray-500">
                  {isTeacher
                    ? 'Cô giáo hãy bấm nút "Duyệt & Sửa Nội Dung Bài" để xuất bản bài cho học sinh nhé!'
                    : 'Cô giáo đang hoàn thiện nội dung bài học, bé vui lòng quay lại sau nhé!'}
                </p>
              </div>
            ) : (
              visibleSections.map((section, secIdx) => {
                const prog = progressMap[section.id];
                const paragraphs = section.paragraphs || [section.fullText || ''];

                return (
                  <div
                    key={section.id}
                    className="bg-white rounded-3xl border-3 border-amber-200 p-5 shadow-md hover:border-amber-300 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
                          {section.emoji || '📖'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                              {section.sectionNumber || `Bài ${secIdx + 1}`}
                            </span>
                            {prog && (
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                {prog.score}/10 điểm
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1">
                            {section.title}
                          </h3>
                          {section.authorOrSource && (
                            <p className="text-xs text-gray-400 font-medium">{section.authorOrSource}</p>
                          )}
                        </div>
                      </div>

                      {/* Nút bấm luyện CẢ BÀI */}
                      <button
                        onClick={() => handleStartDictation(section, 'all')}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Luyện Viết Cả Bài</span>
                      </button>
                    </div>

                    {/* Danh sách các đoạn văn để bé có thể chọn TỪNG ĐOẠN */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Hoặc bấm chọn từng đoạn muốn chép:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {paragraphs.map((para: string, pIdx: number) => (
                          <button
                            key={pIdx}
                            onClick={() => handleStartDictation(section, pIdx)}
                            className="p-3 bg-amber-50/60 hover:bg-amber-100/80 border-2 border-amber-200 rounded-2xl text-left transition-all group flex items-start gap-2.5"
                          >
                            <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                              Đoạn {pIdx + 1}
                            </span>
                            <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed">
                              {para}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MÀN HÌNH ĐANG CHÉP BÀI (QUY TRÌNH 3 LƯỢT ĐỌC – CHE CHỮ) */}
      {/* ============================================================== */}
      {navState === 'dictation' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border-4 border-amber-300 shadow-xl space-y-6 animate-in zoom-in-95">
          {/* Header trạng thái bài chép */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNavState('book_reader')}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  {activeSection?.title} {selectedParaIndex !== 'all' && `(Đoạn ${(selectedParaIndex as number) + 1})`}
                </span>
                <span className="text-xs text-gray-500">
                  Chế độ: <strong className="text-amber-900 font-bold">{dictationMode === 'practice' ? 'Luyện tập' : 'Kiểm tra'}</strong>
                </span>
              </div>
            </div>

            {/* Chỉ báo 3 Lượt đọc */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span
                className={`px-3 py-1 rounded-xl transition-all ${
                  dictationRound === 'round1_overview'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                1. Nghe cả đoạn
              </span>
              <span className="text-gray-300">→</span>
              <span
                className={`px-3 py-1 rounded-xl transition-all ${
                  dictationRound === 'round2_writing'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                2. Chép từng cụm
              </span>
              <span className="text-gray-300">→</span>
              <span
                className={`px-3 py-1 rounded-xl transition-all ${
                  dictationRound === 'round3_review'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                3. Soát bài
              </span>
            </div>
          </div>

          {/* ================= GIAI ĐOẠN LƯỢT 1: NGHE TOÀN ĐOẠN ================= */}
          {dictationRound === 'round1_overview' && (
            <div className="bg-amber-50 rounded-3xl p-6 text-center space-y-4 border-2 border-amber-200">
              <div className="w-16 h-16 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🎧
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-950">
                  Lượt 1: Lắng Nghe Cô Đọc Cả Đoạn Văn
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Con hãy ngồi ngay ngắn, lắng nghe cô đọc toàn bộ bài văn một lần để hiểu ý nghĩa và nhớ các từ khó nhé!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handlePlayRound1Overview()}
                  disabled={isSpeaking}
                  className="px-6 py-3.5 bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 font-bold rounded-2xl text-sm shadow-xs flex items-center gap-2"
                >
                  <Volume2 className="w-5 h-5 text-amber-600" />
                  <span>Nghe Lại Cả Đoạn</span>
                </button>
                <button
                  onClick={handleStartRound2Writing}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md flex items-center gap-2 scale-102"
                >
                  <span>Bắt Đầu Chép (Lượt 2)</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= GIAI ĐOẠN LƯỢT 2: CHÉP TỪNG CỤM TỪ (CHE CHỮ) ================= */}
          {dictationRound === 'round2_writing' && (
            <div className="space-y-6">
              {/* Thanh tiến trình cụm từ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
                  <span>Cụm từ số: {currentChunkIndex + 1} / {activeChunks.length}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Thời gian chờ:
                    </span>
                    <select
                      value={waitDuration}
                      onChange={(e) => setWaitDuration(parseInt(e.target.value, 10) as WaitDurationOption)}
                      className="text-xs font-bold bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5 text-amber-950"
                    >
                      <option value={5}>Ngắn (5s)</option>
                      <option value={8}>Vừa (8s)</option>
                      <option value={12}>Dài (12s)</option>
                    </select>
                  </div>
                </div>
                <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentChunkIndex + 1) / activeChunks.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* HỘP ĐỌC CỤM TỪ (CHE CHỮ HOÀN TOÀN TRONG LÚC CHÉP) */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 border-3 border-amber-200 text-center relative overflow-hidden">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200/80 border border-amber-300 text-xs font-black text-amber-900">
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>Cô đọc mỗi cụm 2 lần – Bé chú ý lắng nghe nhé</span>
                  </div>

                  {/* Hiển thị đếm ngược chờ bé viết */}
                  <div className="my-2">
                    {countdownRemaining > 0 ? (
                      <div className="inline-flex items-center gap-2 text-amber-800 bg-white/90 px-4 py-2 rounded-2xl border border-amber-300 shadow-xs animate-pulse">
                        <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                        <span className="text-sm font-black">
                          Thời gian chờ bé chép: <span className="text-lg text-amber-900 font-black">{countdownRemaining}s</span>
                        </span>
                      </div>
                    ) : isSpeaking ? (
                      <div className="inline-flex items-center gap-2 text-amber-800 bg-white/90 px-4 py-2 rounded-2xl border border-amber-300 shadow-xs">
                        <Volume2 className="w-5 h-5 text-amber-600 animate-bounce" />
                        <span className="text-sm font-bold">Cô đang đọc cụm từ...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 font-medium">
                        Bé chép xong hãy bấm nút <strong className="text-amber-900 font-bold">"Tiếp tục"</strong> để sang cụm tiếp nhé!
                      </p>
                    )}
                  </div>

                  {/* Nút điều khiển audio to, rõ */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    {/* Tạm dừng / Tiếp tục */}
                    <button
                      onClick={handleTogglePause}
                      className="px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 font-bold rounded-2xl text-xs sm:text-sm shadow-xs flex items-center gap-1.5"
                    >
                      {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                      <span>{isPaused ? 'Tiếp tục đọc' : 'Tạm dừng'}</span>
                    </button>

                    {/* Nghe lại cụm này */}
                    <button
                      onClick={handleReplayCurrentChunk}
                      disabled={isSpeaking}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Nghe Lại Cụm Này</span>
                    </button>

                    {/* Nghe chậm hơn (0.5x) */}
                    <button
                      onClick={handlePlayCurrentChunkVerySlow}
                      disabled={isSpeaking}
                      className="px-4 py-3 bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 font-bold rounded-2xl text-xs sm:text-sm shadow-xs flex items-center gap-1.5"
                    >
                      <Volume1 className="w-4 h-4 text-amber-600" />
                      <span>Chậm hơn (0.5x)</span>
                    </button>
                  </div>

                  {/* Nút điều hướng Cụm trước / Cụm sau */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handlePrevChunk}
                      disabled={currentChunkIndex === 0}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        currentChunkIndex === 0
                          ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-xs'
                      }`}
                    >
                      <SkipBack className="w-4 h-4" />
                      <span>Cụm trước</span>
                    </button>

                    <button
                      onClick={handleNextChunk}
                      className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-sm sm:text-base shadow-md flex items-center gap-2 scale-102"
                    >
                      <span>{currentChunkIndex + 1 < activeChunks.length ? 'Tiếp tục chép' : 'Hoàn thành bài chép'}</span>
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* LỰA CHỌN CÁCH NỘP BÀI: CÁCH A (GÕ CHỮ TO >= 28PX) HOẶC CÁCH B (VIẾT VỞ CHỤP ẢNH) */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 border-b border-gray-200 pb-2 text-xs font-black">
                  <button
                    onClick={() => setActiveSubmissionTab('typing')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeSubmissionTab === 'typing'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ⌨️ Cách A: Gõ Trực Tiếp (Chữ To Rõ)
                  </button>
                  <button
                    onClick={() => setActiveSubmissionTab('camera')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeSubmissionTab === 'camera'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📷 Cách B: Viết Vào Vở Rồi Chụp Ảnh
                  </button>
                </div>

                {activeSubmissionTab === 'typing' ? (
                  <div>
                    <label className="block text-center text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                      Ô GÕ BÀI CỦA BÉ (CỠ CHỮ TỐI THIỂU 28PX):
                    </label>
                    <textarea
                      rows={5}
                      value={studentTypedText}
                      onChange={(e) => setStudentTypedText(e.target.value)}
                      placeholder="Con lắng nghe cô đọc và gõ từng chữ vào đây nhé..."
                      className="w-full p-5 text-[28px] sm:text-[32px] font-bold text-gray-900 border-4 border-amber-300 focus:border-amber-500 rounded-3xl bg-white shadow-inner focus:outline-hidden leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-200 text-purple-800 flex items-center justify-center mx-auto text-2xl">
                      📝
                    </div>
                    <div>
                      <p className="font-black text-purple-950 text-sm sm:text-base">
                        Bé hãy nắn nót viết từng dòng vào vở ô ly theo nhịp cô đọc
                      </p>
                      <p className="text-xs text-purple-800 mt-1">
                        Sau khi cô đọc xong cả 3 lượt, con chỉ cần bấm nút bên dưới để chụp ảnh trang vở nộp cho cô chấm nhé!
                      </p>
                    </div>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUploadForOcr}
                      className="hidden"
                    />

                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isOcrProcessing}
                      className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{isOcrProcessing ? 'Đang đọc chữ viết tay...' : 'Chụp Ảnh Trang Vở Của Bé'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= GIAI ĐOẠN LƯỢT 3: NGHE ĐỌC SOÁT BÀI VÀ NỘP ================= */}
          {dictationRound === 'round3_review' && (
            <div className="space-y-6 text-center">
              <div className="bg-teal-50 border-2 border-teal-300 rounded-3xl p-6 space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="text-xl font-black text-teal-950">
                  Lượt 3: Nghe Đọc Lại Cả Đoạn Để Soát Lỗi
                </h3>
                <p className="text-xs sm:text-sm text-teal-800 max-w-md mx-auto leading-relaxed">
                  Cô đang đọc lại toàn bộ bài văn một lần nữa. Con hãy nhìn lại bài viết của mình, kiểm tra xem có thiếu dấu, sai chữ hay sót từ nào không nhé!
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => handlePlayRound1Overview()}
                    disabled={isSpeaking}
                    className="px-5 py-2.5 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold rounded-xl text-xs flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe Lại Lần Nữa</span>
                  </button>
                </div>
              </div>

              {/* Ô xem lại bài viết của bé trước khi bấm chấm */}
              <div className="text-left space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                  Bài con chuẩn bị nộp (con có thể bấm vào sửa chữ trước khi chấm):
                </label>
                <textarea
                  rows={4}
                  value={studentTypedText}
                  onChange={(e) => setStudentTypedText(e.target.value)}
                  placeholder="Bài viết của con..."
                  className="w-full p-4 text-2xl font-bold text-gray-900 border-3 border-teal-300 rounded-2xl bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => executeProofread(studentTypedText, activeSubmissionTab)}
                  disabled={!studentTypedText.trim()}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-3xl text-lg shadow-xl scale-102 transition-all flex items-center gap-2.5 mx-auto"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Nộp Bài & Dò Lỗi Chính Xác 🎯</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MÀN HÌNH KẾT QUẢ DÒ BÀI – CHẤM CHÍNH XÁC BẰNG THUẬT TOÁN CODE */}
      {/* ============================================================== */}
      {navState === 'proofread' && proofreadResult && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border-4 border-emerald-300 shadow-xl space-y-6 animate-in zoom-in-95">
          {/* Header kết quả */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
              <span>{activeSection?.emoji || '📖'}</span>
              <span>{activeSection?.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Kết Quả Dò Bài Viết Của Con
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Thuật toán Code đối chiếu chuẩn xác từng từ, từng ký tự và dấu thanh Unicode NFC
            </p>
          </div>

          {/* Điểm số & Số sao thưởng */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">⭐</span>
              <p className="text-2xl font-black text-amber-900 mt-1">{proofreadResult.score} / 10</p>
              <p className="text-xs font-bold text-amber-700">Điểm Số</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">🎯</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{proofreadResult.accuracyPercent}%</p>
              <p className="text-xs font-bold text-emerald-700">Chính Xác</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-2xl font-black text-blue-900 mt-1">
                {proofreadResult.correctWordsCount} / {proofreadResult.totalExpectedWords}
              </p>
              <p className="text-xs font-bold text-blue-700">Số Chữ Đúng</p>
            </div>

            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 text-center">
              <span className="text-2xl">⚠️</span>
              <p className="text-2xl font-black text-rose-900 mt-1">{proofreadResult.wrongWordsCount}</p>
              <p className="text-xs font-bold text-rose-700">Số Chữ Cần Sửa</p>
            </div>
          </div>

          {/* Lời khích lệ ấm áp */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center text-xs sm:text-sm text-emerald-950 font-bold max-w-xl mx-auto">
            {proofreadResult.encouragement}
          </div>

          {/* ================= BÀI VIẾT VỚI MÀU SẮC TRỰC QUAN ================= */}
          <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 border-2 border-gray-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold text-gray-500 pb-2 border-b border-gray-200">
              <span>BÀI VIẾT ĐÃ DÒ LỖI CHI TIẾT:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-orange-200 border border-orange-500 inline-block" /> Chữ sai (gạch chân cam)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-rose-200 border border-rose-500 inline-block" /> Chữ thiếu (?)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Chữ thừa
                </span>
              </div>
            </div>

            {/* Đoạn văn so khớp từng từ */}
            <div className="text-base sm:text-xl font-medium leading-loose text-gray-800 p-2">
              {proofreadResult.items.map((item: WordDiffItem) => {
                if (item.type === 'correct') {
                  return (
                    <span key={item.id} className="text-emerald-900 font-bold mx-0.5">
                      {item.studentWord}{' '}
                    </span>
                  );
                }
                if (item.type === 'wrong') {
                  return (
                    <span
                      key={item.id}
                      className="inline-block mx-1 px-1.5 py-0.5 rounded-lg bg-orange-100 text-orange-950 border-b-4 border-orange-500 font-black cursor-pointer hover:bg-orange-200 transition-colors"
                      title={item.explanation || `Đúng là: ${item.expectedWord}`}
                      onClick={() => handleStartMiniRetry(item.cleanStudentWord || '', item.cleanExpectedWord || '')}
                    >
                      {item.studentWord}
                      <span className="text-xs text-orange-700 font-normal ml-1">
                        (đúng là: {item.expectedWord})
                      </span>{' '}
                    </span>
                  );
                }
                if (item.type === 'missing') {
                  return (
                    <span
                      key={item.id}
                      className="inline-block mx-1 px-1.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 border-2 border-dashed border-rose-400 font-bold"
                      title={`Thiếu từ: ${item.expectedWord}`}
                    >
                      [? thiếu: {item.expectedWord}]{' '}
                    </span>
                  );
                }
                // Extra word
                return (
                  <span
                    key={item.id}
                    className="inline-block mx-0.5 line-through text-gray-400 bg-gray-200 px-1 rounded text-sm"
                    title="Chữ thừa"
                  >
                    {item.studentWord}{' '}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ================= GOM LỖI THEO NHÓM VÀ LỜI GIẢI THÍCH ================= */}
          {proofreadResult.errorsGrouped.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Các Lỗi Cần Chú Ý Trong Bài ({proofreadResult.mistakeWordsList.length} lỗi):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proofreadResult.errorsGrouped.map((grp) => (
                  <div
                    key={grp.category}
                    className="p-4 bg-orange-50/70 rounded-2xl border-2 border-orange-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-orange-900 flex items-center gap-1.5">
                        <span>{grp.emoji}</span>
                        <span>Nhóm lỗi: {grp.label}</span>
                      </span>
                      <span className="font-bold text-orange-700 bg-orange-200 px-2 py-0.5 rounded-md">
                        {grp.words.length} từ
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {grp.words.map((w, wIdx) => (
                        <div key={wIdx} className="bg-white p-2.5 rounded-xl border border-orange-200">
                          <p className="font-bold text-gray-800 text-sm">
                            <span className="text-rose-600 line-through mr-1">{w.wrong}</span> →{' '}
                            <span className="text-emerald-700 font-black">{w.correct}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{w.explanation}</p>
                          {w.sentence && (
                            <button
                              onClick={() => handlePlayMistakeSentence(w.sentence)}
                              className="mt-1.5 text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>Nghe lại câu có lỗi này</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= PANEL VIẾT LẠI NHỮNG CHỮ SAI NGAY LẬP TỨC ================= */}
          {miniRetryWord && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-amber-300 rounded-3xl p-5 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Sửa Lại Từ Sai: <strong className="text-base text-emerald-800">{miniRetryWord.correct}</strong>
                </span>
                <button
                  onClick={() => setMiniRetryWord(null)}
                  className="text-xs text-gray-400 hover:text-gray-700 font-bold"
                >
                  Đóng
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <input
                  type="text"
                  value={miniRetryInput}
                  onChange={(e) => setMiniRetryInput(e.target.value)}
                  placeholder={`Gõ lại đúng từ: "${miniRetryWord.correct}"...`}
                  className="px-5 py-2.5 rounded-2xl border-3 border-amber-300 text-lg font-bold text-center bg-white"
                  autoFocus
                />
                <button
                  onClick={handleCheckMiniRetry}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs"
                >
                  Kiểm tra lại
                </button>
              </div>

              {miniRetrySuccess !== null && (
                <p
                  className={`text-xs font-bold text-center ${
                    miniRetrySuccess ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {miniRetrySuccess
                    ? '🎉 Giỏi lắm! Con đã viết lại chuẩn xác từ này rồi (+1 Sao ⭐)!'
                    : `Chưa chuẩn rồi con ơi! Đáp án đúng là: "${miniRetryWord.correct}". Thử lại nhé!`}
                </p>
              )}
            </div>
          )}

          {/* Nút hành động sau khi chấm */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (proofreadResult.mistakeWordsList[0]) {
                  const first = proofreadResult.mistakeWordsList[0];
                  handleStartMiniRetry(first.wrong, first.correct);
                }
              }}
              disabled={proofreadResult.wrongWordsCount === 0}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                proofreadResult.wrongWordsCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Viết Lại Những Chữ Sai ({proofreadResult.wrongWordsCount})</span>
            </button>

            <button
              onClick={() => {
                if (activeSection) {
                  handleStartDictation(activeSection, selectedParaIndex);
                }
              }}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Luyện Lại Bài Này</span>
            </button>

            <button
              onClick={() => setNavState('book_reader')}
              className="px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Chọn Bài Khác</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL XÁC NHẬN VĂN BẢN CHỤP ẢNH TỪ VỞ (CÁCH B) */}
      {/* ============================================================== */}
      {showOcrConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border-4 border-purple-300 relative text-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📷</span>
                <h3 className="text-lg sm:text-xl font-black text-purple-950">
                  Xác Nhận Chữ Viết Tay Vừa Chụp
                </h3>
              </div>
              <button
                onClick={() => setShowOcrConfirmModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LƯU Ý BẮT BUỘC THEO YÊU CẦU */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Lời dặn của cô giáo cho ba mẹ và bé:</p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Trí tuệ nhân tạo (AI) có thể vô tình <strong>"đọc đúng"</strong> những chữ mà con viết nhầm nét hoặc thiếu dấu trong vở. Ba mẹ và con hãy cùng rà soát lại đoạn văn bên dưới, sửa lại cho đúng y hệt những gì con đã viết trong vở trước khi bấm Chấm bài nhé!
                </p>
              </div>
            </div>

            {/* Ô xem và sửa văn bản */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Văn bản nhận diện từ trang vở (Có thể bấm vào để sửa trực tiếp):
              </label>
              <textarea
                rows={5}
                value={ocrTranscribedDraft}
                onChange={(e) => setOcrTranscribedDraft(e.target.value)}
                className="w-full p-4 border-2 border-purple-300 focus:border-purple-500 rounded-2xl text-base sm:text-lg font-bold text-gray-800 focus:outline-hidden bg-purple-50/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowOcrConfirmModal(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Chụp lại ảnh khác
              </button>
              <button
                onClick={handleConfirmOcrTextAndProofread}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác Nhận & Bắt Đầu Chấm Bài</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL GIÁO VIÊN TẢI SÁCH MỚI (PDF / ẢNH / TEXT) */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-300 relative text-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📤</span>
                <h3 className="text-lg sm:text-xl font-black text-amber-950">
                  Giáo Viên Tải Sách Giáo Khoa Mới
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Tải file PDF sách hoặc ảnh chụp trang sách. Gemini AI sẽ tự động đọc và phân chia thành các bài, đoạn văn và câu hoàn chỉnh một lần duy nhất, sau đó cô duyệt và xuất bản cho bé.
            </p>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold">
                {uploadError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tên Cuốn Sách / Tài Liệu (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiếng Việt 2 - Cánh Diều"
                  value={uploadBookTitle}
                  onChange={(e) => setUploadBookTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border-2 border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-800"
                />
              </div>

              {/* Nút tải file PDF hoặc Ảnh */}
              <input
                ref={bookFileInputRef}
                type="file"
                accept="application/pdf,image/*"
                onChange={handleUploadBookFile}
                className="hidden"
              />

              <div
                onClick={() => bookFileInputRef.current?.click()}
                className="border-3 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-amber-50/50 hover:bg-amber-50 transition-colors"
              >
                {isUploading ? (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-amber-900">
                      Gemini đang đọc file và tự động tách các bài, đoạn, câu...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-xs font-bold text-gray-800">
                      Bấm để chọn file <strong className="text-amber-900">PDF SGK</strong> hoặc <strong className="text-amber-900">Ảnh trang sách</strong>
                    </p>
                    <p className="text-[11px] text-gray-400">Hỗ trợ PDF, PNG, JPG (tối đa 50MB)</p>
                  </div>
                )}
              </div>

              {/* Hoặc dán trực tiếp */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Hoặc dán văn bản bài đọc trực tiếp:
                </label>
                <textarea
                  rows={3}
                  placeholder="Dán nội dung sách tại đây..."
                  value={uploadRawText}
                  onChange={(e) => setUploadRawText(e.target.value)}
                  className="w-full p-2.5 border-2 border-gray-300 rounded-xl text-xs font-medium text-gray-800"
                />
                {uploadRawText.trim() && (
                  <button
                    onClick={handleUploadRawText}
                    disabled={isUploading}
                    className="w-full mt-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    {isUploading ? 'Đang phân tích...' : 'Dùng AI Tách Bài Từ Văn Bản Đã Dán'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL DUYỆT NỘI DUNG SÁCH GIÁO KHOA DÀNH CHO GIÁO VIÊN */}
      {/* ============================================================== */}
      {showReviewModal && bookToReview && (
        <TextbookReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          book={bookToReview}
          onSaveBook={(updated) => {
            const list = saveCustomBook(updated);
            setBooks(list);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* 8. MODAL TIẾN TRÌNH & BÁO CÁO CHO PHỤ HUYNH */}
      {/* ============================================================== */}
      {showParentModal && (
        <ParentProgressModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          streak={2}
          onSelectReviewLesson={(secId) => {
            setSelectedSectionId(secId);
            setNavState('book_reader');
          }}
        />
      )}
    </div>
  );
};

/**
 * Tách đoạn văn thành các cụm từ ngắn 3 đến 5 chữ liền nghĩa, giữ đúng dấu câu
 */
function splitIntoChunks3To5Words(text: string): string[] {
  if (!text || !text.trim()) return [];
  const sentences = text.trim().split(/(?<=[.,:;?!])\s+/).filter(Boolean);
  const result: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 5) {
      result.push(sentence.trim());
    } else {
      for (let i = 0; i < words.length; i += 4) {
        const sub = words.slice(i, i + 4).join(' ');
        if (sub.trim()) result.push(sub.trim());
      }
    }
  }
  return result.length > 0 ? result : [text.trim()];
}
