import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Share2,
  Eye,
  LogOut,
  Layers,
  Sparkles,
  Volume2,
  FileText,
  Copy,
} from 'lucide-react';
import {
  BookLop2,
  LessonLop2,
  SpellingWordLop2,
  SpellingErrorGroup,
  ERROR_GROUPS_META,
  TeacherAnalytics,
} from '../types/spelling';
import {
  fetchBooks,
  saveBook,
  deleteBookById,
  fetchLessons,
  saveLesson,
  deleteLessonById,
  fetchWords,
  saveWord,
  deleteWordById,
  addBatchWords,
  getTeacherAnalytics,
} from '../firebase/spellingDataService';
import { logoutTeacher, AUTHORIZED_TEACHER_EMAIL } from '../firebase/config';
import { speechReader } from '../utils/audioSpeech';

interface TeacherAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAsStudent: () => void;
  onRefreshCurriculum: () => void;
}

export const TeacherAdminModal: React.FC<TeacherAdminModalProps> = ({
  isOpen,
  onClose,
  onViewAsStudent,
  onRefreshCurriculum,
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'batch_add' | 'analytics' | 'guide'>('curriculum');

  // Dữ liệu sách, bài học, từ vựng
  const [books, setBooks] = useState<BookLop2[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [lessons, setLessons] = useState<LessonLop2[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [words, setWords] = useState<SpellingWordLop2[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);

  // Form Thêm Sách Mới
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPublisher, setNewBookPublisher] = useState('Kết Nối Tri Thức');
  const [newBookDesc, setNewBookDesc] = useState('');

  // Form Thêm Bài Học Mới
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonWeek, setNewLessonWeek] = useState('Tuần 1');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');

  // Form Thêm 1 Từ Đơn
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWordText, setNewWordText] = useState('');
  const [newWordCategory, setNewWordCategory] = useState<SpellingErrorGroup>('ch_tr');
  const [newWordHint, setNewWordHint] = useState('');
  const [newWordExample, setNewWordExample] = useState('');

  // Form Dán Hàng Loạt Từ (Batch Add)
  const [batchRawText, setBatchRawText] = useState('');
  const [batchCategory, setBatchCategory] = useState<SpellingErrorGroup>('ch_tr');
  const [batchHint, setBatchHint] = useState('');
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const loadedBooks = await fetchBooks();
    setBooks(loadedBooks);
    const firstBookId = loadedBooks[0]?.id || '';
    setSelectedBookId(firstBookId);

    if (firstBookId) {
      const loadedLessons = await fetchLessons(firstBookId);
      setLessons(loadedLessons);
      const firstLessonId = loadedLessons[0]?.id || '';
      setSelectedLessonId(firstLessonId);

      if (firstLessonId) {
        const loadedWords = await fetchWords(firstLessonId, firstBookId);
        setWords(loadedWords);
      }
    }

    setAnalytics(getTeacherAnalytics());
  };

  const handleSelectBook = async (bookId: string) => {
    setSelectedBookId(bookId);
    const loadedLessons = await fetchLessons(bookId);
    setLessons(loadedLessons);
    const firstLessonId = loadedLessons[0]?.id || '';
    setSelectedLessonId(firstLessonId);
    if (firstLessonId) {
      const loadedWords = await fetchWords(firstLessonId, bookId);
      setWords(loadedWords);
    } else {
      setWords([]);
    }
  };

  const handleSelectLesson = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const loadedWords = await fetchWords(lessonId, selectedBookId);
    setWords(loadedWords);
  };

  // Thêm sách mới
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: BookLop2 = {
      id: `book_custom_${Date.now()}`,
      title: newBookTitle.trim(),
      publisher: newBookPublisher,
      grade: 'Lớp 2',
      coverBg: 'from-purple-500 via-indigo-600 to-sky-700',
      coverIcon: '📖',
      description: newBookDesc.trim() || 'Bộ sách chính tả do giáo viên biên soạn',
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    await saveBook(newBook);
    setNewBookTitle('');
    setNewBookDesc('');
    setShowAddBook(false);
    await loadData();
    onRefreshCurriculum();
    showToast('Đã thêm bộ sách mới thành công!');
  };

  // Xóa sách
  const handleDeleteBook = async (bookId: string, title: string) => {
    if (window.confirm(`Cô/Thầy có chắc chắn muốn xóa bộ sách "${title}" không?`)) {
      await deleteBookById(bookId);
      await loadData();
      onRefreshCurriculum();
      showToast('Đã xóa bộ sách.');
    }
  };

  // Thêm bài học mới
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !selectedBookId) return;

    const newLesson: LessonLop2 = {
      id: `les_${Date.now()}`,
      bookId: selectedBookId,
      week: newLessonWeek,
      title: newLessonTitle.trim(),
      description: newLessonDesc.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveLesson(newLesson);
    setNewLessonTitle('');
    setNewLessonDesc('');
    setShowAddLesson(false);
    await handleSelectBook(selectedBookId);
    onRefreshCurriculum();
    showToast('Đã thêm bài học mới!');
  };

  // Xóa bài học
  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (window.confirm(`Cô/Thầy có chắc chắn muốn xóa bài học "${title}" không?`)) {
      await deleteLessonById(lessonId);
      await handleSelectBook(selectedBookId);
      onRefreshCurriculum();
      showToast('Đã xóa bài học.');
    }
  };

  // Thêm 1 từ đơn
  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordText.trim() || !selectedLessonId) return;

    const wordItem: SpellingWordLop2 = {
      id: `w_${Date.now()}`,
      bookId: selectedBookId,
      lessonId: selectedLessonId,
      text: newWordText.trim(),
      errorCategory: newWordCategory,
      hint: newWordHint.trim() || ERROR_GROUPS_META[newWordCategory].ruleExplanation,
      exampleSentence: newWordExample.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveWord(wordItem);
    setNewWordText('');
    setNewWordHint('');
    setNewWordExample('');
    setShowAddWord(false);
    await handleSelectLesson(selectedLessonId);
    onRefreshCurriculum();
    showToast('Đã thêm từ cần luyện viết!');
  };

  // Xóa từ
  const handleDeleteWord = async (wordId: string, text: string) => {
    if (window.confirm(`Xóa từ "${text}"?`)) {
      await deleteWordById(wordId);
      await handleSelectLesson(selectedLessonId);
      onRefreshCurriculum();
      showToast('Đã xóa từ.');
    }
  };

  // Dán hàng loạt từ
  const handleBatchAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchRawText.trim() || !selectedLessonId) return;

    const count = await addBatchWords(
      batchRawText,
      selectedBookId,
      selectedLessonId,
      batchCategory,
      batchHint
    );

    setBatchSuccessCount(count);
    setBatchRawText('');
    await handleSelectLesson(selectedLessonId);
    onRefreshCurriculum();
    showToast(`Đã thêm thành công ${count} từ/câu vào bài học!`);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const copyStudentLink = () => {
    const studentUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(studentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border-3 border-amber-400 my-auto max-h-[95vh] flex flex-col overflow-hidden animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs font-black">
              👩‍🏫
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-base sm:text-lg">
                  Khu Vực Quản Trị Giáo Viên
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  {AUTHORIZED_TEACHER_EMAIL}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Biên soạn sách, bài tuần, dán từ nhanh, xem thống kê học tập
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Xem Như Học Sinh */}
            <button
              onClick={onViewAsStudent}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              title="Xem giao diện học sinh đang nhìn thấy"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Như Học Sinh</span>
            </button>

            {/* Nút Đăng Xuất */}
            <button
              onClick={async () => {
                await logoutTeacher();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Đăng xuất tài khoản giáo viên"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Thoát</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast thông báo */}
        {statusMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-pop">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mb-4 border-b border-slate-200 pb-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'curriculum'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Sách, Bài & Từ Vựng</span>
          </button>

          <button
            onClick={() => setActiveTab('batch_add')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'batch_add'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>2. Dán Nhanh Nhiều Từ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              setAnalytics(getTeacherAnalytics());
            }}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>3. Thống Kê Học Tập</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>4. Cấu Hình & Chia Sẻ Link</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: QUẢN LÝ SÁCH, BÀI VÀ TỪ VỰNG */}
          {/* ============================================================== */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 text-xs">
              {/* Chọn Sách */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <span>📚</span> Bộ Sách Lớp 2 ({books.length}):
                  </span>
                  <button
                    onClick={() => setShowAddBook(!showAddBook)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm Sách Mới</span>
                  </button>
                </div>

                {showAddBook && (
                  <form onSubmit={handleCreateBook} className="bg-white p-3 rounded-xl border border-emerald-300 mb-3 space-y-2 animate-pop">
                    <div className="font-bold text-emerald-800 text-xs">Thêm bộ sách Tiếng Việt 2 mới:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tên bộ sách (VD: Tiếng Việt 2 - Cánh Diều, Bộ Đọc Riêng...)"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-emerald-500 font-semibold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nhà xuất bản hoặc Tên tác giả"
                        value={newBookPublisher}
                        onChange={(e) => setNewBookPublisher(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBook(false)}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                      >
                        Lưu Sách
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex items-center gap-1.5 flex-wrap">
                  {books.map((b) => (
                    <div
                      key={b.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                        selectedBookId === b.id
                          ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs scale-102'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                      }`}
                      onClick={() => handleSelectBook(b.id)}
                    >
                      <span>{b.coverIcon}</span>
                      <span>{b.title}</span>
                      {b.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBook(b.id, b.title);
                          }}
                          className="hover:text-rose-600 p-0.5 ml-1"
                          title="Xóa sách này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chọn Bài / Tuần */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <span>📑</span> Bài Học / Tuần Trong Sách ({lessons.length}):
                  </span>
                  <button
                    onClick={() => setShowAddLesson(!showAddLesson)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm Bài / Tuần</span>
                  </button>
                </div>

                {showAddLesson && (
                  <form onSubmit={handleCreateLesson} className="bg-white p-3 rounded-xl border border-sky-300 mb-3 space-y-2 animate-pop">
                    <div className="font-bold text-sky-800 text-xs">Thêm bài học mới:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Tuần (VD: Tuần 1, Tuần 2)"
                        value={newLessonWeek}
                        onChange={(e) => setNewLessonWeek(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-sky-500 font-semibold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tên bài học (VD: Bài 1: Tôi là học sinh lớp 2)"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        className="sm:col-span-2 p-2 border rounded-lg text-xs outline-none focus:border-sky-500 font-semibold"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Mô tả hoặc lưu ý chính tả cho bài học này"
                      value={newLessonDesc}
                      onChange={(e) => setNewLessonDesc(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs outline-none focus:border-sky-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLesson(false)}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-lg bg-sky-600 text-white font-bold"
                      >
                        Lưu Bài
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex items-center gap-1.5 flex-wrap">
                  {lessons.length === 0 ? (
                    <div className="text-slate-400 italic py-2">Chưa có bài học nào trong sách này. Bấm "Thêm Bài / Tuần" để tạo mới.</div>
                  ) : (
                    lessons.map((l) => (
                      <div
                        key={l.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-bold cursor-pointer transition-all ${
                          selectedLessonId === l.id
                            ? 'bg-sky-100 border-sky-500 text-sky-900 shadow-xs scale-102'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
                        }`}
                        onClick={() => handleSelectLesson(l.id)}
                      >
                        <span>{l.week}: {l.title}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLesson(l.id, l.title);
                          }}
                          className="hover:text-rose-600 p-0.5 ml-1"
                          title="Xóa bài học"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Danh Sách Từ Vựng Cần Luyện Viết */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <span>✏️</span> Danh Sách Từ / Câu Luyện Viết ({words.length} từ):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowAddWord(!showAddWord)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm 1 Từ</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('batch_add')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Dán Nhiều Từ</span>
                    </button>
                  </div>
                </div>

                {showAddWord && (
                  <form onSubmit={handleCreateWord} className="bg-white p-3 rounded-xl border border-amber-300 mb-3 space-y-2 animate-pop">
                    <div className="font-bold text-amber-800 text-xs">Thêm từ hoặc câu luyện viết:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Từ hoặc câu (VD: cây tre, vui vẻ, mặt trời...)"
                        value={newWordText}
                        onChange={(e) => setNewWordText(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-amber-500 font-bold"
                        required
                      />
                      <select
                        value={newWordCategory}
                        onChange={(e) => setNewWordCategory(e.target.value as SpellingErrorGroup)}
                        className="p-2 border rounded-lg text-xs font-semibold outline-none focus:border-amber-500 bg-white"
                      >
                        {Object.entries(ERROR_GROUPS_META).map(([k, meta]) => (
                          <option key={k} value={k}>
                            {meta.emoji} {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Lời nhắc quy tắc (VD: Cây tre cao vút viết bằng tr uốn lưỡi)"
                        value={newWordHint}
                        onChange={(e) => setNewWordHint(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="Câu ví dụ ngữ cảnh (tùy chọn)"
                        value={newWordExample}
                        onChange={(e) => setNewWordExample(e.target.value)}
                        className="p-2 border rounded-lg text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddWord(false)}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-lg bg-amber-500 text-white font-bold"
                      >
                        Lưu Từ
                      </button>
                    </div>
                  </form>
                )}

                {/* Table or list of words */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {words.length === 0 ? (
                    <div className="text-slate-400 italic py-3 text-center">
                      Bài học này chưa có từ nào. Bạn có thể bấm "Thêm 1 Từ" hoặc "Dán Nhiều Từ" để thêm nhanh!
                    </div>
                  ) : (
                    words.map((w, index) => {
                      const meta = ERROR_GROUPS_META[w.errorCategory] || ERROR_GROUPS_META.khac;
                      return (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <span className="font-extrabold text-sm text-slate-800 tracking-wide">
                              {w.text}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeColor}`}>
                              {meta.shortLabel}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate hidden md:inline">
                              {w.hint}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => speechReader.speakNormal(w.text)}
                              className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 cursor-pointer"
                              title="Nghe phát âm thử"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWord(w.id, w.text)}
                              className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Xóa từ này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: DÁN NHIỀU TỪ CÙNG LÚC (BATCH ADD) */}
          {/* ============================================================== */}
          {activeTab === 'batch_add' && (
            <div className="bg-slate-50 border border-purple-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-purple-900 text-sm flex items-center gap-1.5">
                    <span>📋</span> Nhập Nhanh Nhiều Từ Cùng Lúc
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Giáo viên chỉ cần dán danh sách từ hoặc câu (mỗi dòng một từ/câu) từ giáo án hoặc tài liệu vào ô dưới đây.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBatchAddSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Lưu vào bài học:
                    </label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold outline-none focus:border-purple-500"
                    >
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.week} - {l.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Gắn nhóm lỗi chính tả cho các từ này:
                    </label>
                    <select
                      value={batchCategory}
                      onChange={(e) => setBatchCategory(e.target.value as SpellingErrorGroup)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold outline-none focus:border-purple-500"
                    >
                      {Object.entries(ERROR_GROUPS_META).map(([k, meta]) => (
                        <option key={k} value={k}>
                          {meta.emoji} {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Lời gợi ý / mẹo nhớ chung (tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chú ý âm ch/tr hoặc dấu hỏi ngã khi viết nhé"
                    value={batchHint}
                    onChange={(e) => setBatchHint(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Dán danh sách từ/câu (mỗi dòng một mục):
                  </label>
                  <textarea
                    rows={7}
                    placeholder={`Ví dụ:\ncây tre\ncon trâu\nbầu trời\nchăm chỉ\ncon chim\nchiếc chổi`}
                    value={batchRawText}
                    onChange={(e) => setBatchRawText(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-purple-300 font-mono text-xs sm:text-sm outline-none focus:border-purple-500 leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Đã nhập: {batchRawText.split('\n').filter((l) => l.trim()).length} dòng từ/câu
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black shadow-md shadow-purple-500/25 cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu Tất Cả Vào Bài Học</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: THỐNG KÊ HỌC TẬP (ANALYTICS) */}
          {/* ============================================================== */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-800">{analytics.totalWordsLearned}</div>
                  <div className="text-[11px] font-bold text-amber-600 mt-0.5">Lượt từ đã luyện viết</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-emerald-800">{analytics.accuracyRate}%</div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Tỉ lệ viết đúng</div>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-sky-800">{analytics.totalPracticeSessions}</div>
                  <div className="text-[11px] font-bold text-sky-600 mt-0.5">Phiên làm bài hoàn thành</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-rose-800">{analytics.frequentMistakes.length}</div>
                  <div className="text-[11px] font-bold text-rose-600 mt-0.5">Từ cần đặc biệt lưu ý</div>
                </div>
              </div>

              {/* Danh Sách Từ Hay Viết Sai Nhất */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <h4 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <span>⚠️</span> Top Từ Học Sinh Hay Viết Sai Nhất:
                </h4>
                {analytics.frequentMistakes.length === 0 ? (
                  <div className="text-slate-400 italic text-center py-4">
                    Chưa ghi nhận từ nào bị viết sai. Học sinh đang viết rất tốt!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analytics.frequentMistakes.map((m, idx) => {
                      const meta = ERROR_GROUPS_META[m.category] || ERROR_GROUPS_META.khac;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-800">{m.word}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${meta.badgeColor}`}>
                              {meta.shortLabel}
                            </span>
                          </div>
                          <span className="text-xs font-black text-rose-600">
                            {m.count} lần sai
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nhóm Lỗi Sai Nhiều Nhất */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <h4 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <span>📊</span> Phân Tích Nhóm Lỗi Chính Tả:
                </h4>
                <div className="space-y-2">
                  {Object.entries(ERROR_GROUPS_META).map(([catKey, meta]) => {
                    const stat = analytics.categoryBreakdown.find((c) => c.category === catKey);
                    const total = stat?.count || 0;
                    const errors = stat?.errorCount || 0;
                    const errPercent = total > 0 ? Math.round((errors / total) * 100) : 0;

                    return (
                      <div key={catKey} className="flex items-center gap-3">
                        <span className="w-24 text-[11px] font-bold text-slate-700 truncate">
                          {meta.shortLabel}
                        </span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{ width: `${errPercent}%` }}
                          />
                        </div>
                        <span className="w-20 text-right text-[11px] font-black text-slate-600">
                          {errors} sai / {total} lần ({errPercent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: CẤU HÌNH FIREBASE & CHIA SẺ LINK */}
          {/* ============================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              {/* Box Chia Sẻ Link Cho Học Sinh */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sky-950 text-sm flex items-center gap-1.5">
                    <span>🔗</span> Đường Link Chia Sẻ Cho Học Sinh
                  </h4>
                  <button
                    onClick={copyStudentLink}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Sao Chép Link Gửi Em'}</span>
                  </button>
                </div>
                <p className="text-slate-600 text-xs">
                  Học sinh khi mở đường link này sẽ vào thẳng màn hình học bài, <strong>không cần tài khoản, không cần đăng nhập</strong> và hoàn toàn không thấy các nút chỉnh sửa/xóa bài của giáo viên.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-sky-200 font-mono text-xs text-sky-900 break-all select-all">
                  {typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}
                </div>
              </div>

              {/* Hướng Dẫn Cấu Hình Firebase Step-by-Step */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>🔥</span> Hướng Dẫn Kích Hoạt Firebase & Google Sign-In (3 Bước):
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-800">Bước 1: Bật Google Sign-In trong Firebase Console</strong>
                    <p className="mt-1 text-slate-600">
                      Vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-bold">Firebase Console</a> ➔ Chọn dự án của bạn ➔ Vào mục <strong>Authentication</strong> ➔ Tab <strong>Sign-in method</strong> ➔ Bật nhà cung cấp <strong>Google</strong> ➔ Lưu lại.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-800">Bước 2: Thêm tên miền ứng dụng vào Authorized Domains</strong>
                    <p className="mt-1 text-slate-600">
                      Vẫn ở trang <strong>Authentication</strong> ➔ Chọn tab <strong>Settings</strong> ➔ Mục <strong>Authorized domains</strong> ➔ Nhấn <strong>Add domain</strong> ➔ Dán tên miền hiện tại:
                    </p>
                    <code className="inline-block mt-1 p-1 px-2 rounded bg-slate-100 font-mono text-[11px] text-purple-700 font-bold">
                      {typeof window !== 'undefined' ? window.location.hostname : 'run.app'}
                    </code>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-800">Bước 3: Tạo Cloud Firestore & Dán Quy Tắc (Rules)</strong>
                    <p className="mt-1 text-slate-600">
                      Vào mục <strong>Firestore Database</strong> ➔ Tạo Database (chọn chế độ Production) ➔ Chọn tab <strong>Rules</strong> ➔ Dán toàn bộ nội dung từ file <code className="font-bold text-slate-800">firestore.rules</code> đã tạo sẵn trong mã nguồn. Quy tắc này cho phép tất cả học sinh ĐỌC nội dung sách, và CHỈ duy nhất email <strong className="text-amber-800">{AUTHORIZED_TEACHER_EMAIL}</strong> có quyền GHI/SỬA/XÓA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
