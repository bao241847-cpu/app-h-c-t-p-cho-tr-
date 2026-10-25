import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth, AUTHORIZED_TEACHER_EMAIL } from './config';
import {
  BookLop2,
  LessonLop2,
  SpellingWordLop2,
  StudentMistakeRecord,
  TeacherAnalytics,
  SpellingErrorGroup,
} from '../types/spelling';
import {
  INITIAL_BOOKS_LOP2,
  INITIAL_LESSONS_LOP2,
  INITIAL_WORDS_LOP2,
} from '../data/lop2SeedData';

const LOCAL_STORAGE_BOOKS = 'lop2_chinh_ta_books';
const LOCAL_STORAGE_LESSONS = 'lop2_chinh_ta_lessons';
const LOCAL_STORAGE_WORDS = 'lop2_chinh_ta_words';
const LOCAL_STORAGE_MISTAKES = 'lop2_chinh_ta_mistakes';
const LOCAL_STORAGE_ACTIVITY_LOG = 'lop2_chinh_ta_activity_logs';

/**
 * Kiểm tra xem người dùng hiện tại có phải là giáo viên được cấp quyền không
 */
export function isCurrentUserTeacher(): boolean {
  if (!auth?.currentUser) return false;
  return (auth.currentUser.email || '').toLowerCase() === AUTHORIZED_TEACHER_EMAIL.toLowerCase();
}

// ==========================================
// 1. QUẢN LÝ BỘ SÁCH
// ==========================================

export async function fetchBooks(): Promise<BookLop2[]> {
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'spelling_books'));
      if (!snap.empty) {
        const books = snap.docs.map((d) => ({ ...d.data(), id: d.id } as BookLop2));
        localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(books));
        return books;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc sách từ Firestore, chuyển sang bộ đệm cục bộ:', err);
  }

  // Fallback từ LocalStorage hoặc hạt giống mặc định
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_BOOKS);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Khởi tạo mặc định
  localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(INITIAL_BOOKS_LOP2));
  return INITIAL_BOOKS_LOP2;
}

export async function saveBook(book: BookLop2): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  // Cập nhật LocalStorage trước để phản hồi tức thì
  try {
    const cur = await fetchBooks();
    const idx = cur.findIndex((b) => b.id === book.id);
    let updated: BookLop2[];
    if (idx >= 0) {
      updated = [...cur];
      updated[idx] = book;
    } else {
      updated = [...cur, book];
    }
    localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(updated));
  } catch {}

  // Lưu lên Firestore nếu giáo viên đã đăng nhập
  if (db && isTeacher) {
    try {
      await setDoc(doc(db, 'spelling_books', book.id), {
        ...book,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Lỗi lưu sách vào Firestore:', e);
    }
  }
}

export async function deleteBookById(bookId: string): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  // Cập nhật LocalStorage
  try {
    const cur = await fetchBooks();
    const updated = cur.filter((b) => b.id !== bookId);
    localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(updated));
  } catch {}

  // Xóa trên Firestore
  if (db && isTeacher) {
    try {
      await deleteDoc(doc(db, 'spelling_books', bookId));
    } catch (e) {
      console.error('Lỗi xóa sách trên Firestore:', e);
    }
  }
}

// ==========================================
// 2. QUẢN LÝ BÀI HỌC / TUẦN
// ==========================================

export async function fetchLessons(bookId?: string): Promise<LessonLop2[]> {
  try {
    if (db) {
      const q = bookId
        ? query(collection(db, 'spelling_lessons'), where('bookId', '==', bookId))
        : collection(db, 'spelling_lessons');
      const snap = await getDocs(q);
      if (!snap.empty) {
        const lessons = snap.docs.map((d) => ({ ...d.data(), id: d.id } as LessonLop2));
        return lessons;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc bài học từ Firestore:', err);
  }

  // Fallback
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_LESSONS);
    if (local) {
      const parsed: LessonLop2[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return bookId ? parsed.filter((l) => l.bookId === bookId) : parsed;
      }
    }
  } catch {}

  localStorage.setItem(LOCAL_STORAGE_LESSONS, JSON.stringify(INITIAL_LESSONS_LOP2));
  return bookId ? INITIAL_LESSONS_LOP2.filter((l) => l.bookId === bookId) : INITIAL_LESSONS_LOP2;
}

export async function saveLesson(lesson: LessonLop2): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  try {
    const cur = await fetchLessons();
    const idx = cur.findIndex((l) => l.id === lesson.id);
    let updated: LessonLop2[];
    if (idx >= 0) {
      updated = [...cur];
      updated[idx] = lesson;
    } else {
      updated = [...cur, lesson];
    }
    localStorage.setItem(LOCAL_STORAGE_LESSONS, JSON.stringify(updated));
  } catch {}

  if (db && isTeacher) {
    try {
      await setDoc(doc(db, 'spelling_lessons', lesson.id), {
        ...lesson,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Lỗi lưu bài học vào Firestore:', e);
    }
  }
}

export async function deleteLessonById(lessonId: string): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  try {
    const cur = await fetchLessons();
    const updated = cur.filter((l) => l.id !== lessonId);
    localStorage.setItem(LOCAL_STORAGE_LESSONS, JSON.stringify(updated));
  } catch {}

  if (db && isTeacher) {
    try {
      await deleteDoc(doc(db, 'spelling_lessons', lessonId));
    } catch (e) {
      console.error('Lỗi xóa bài học trên Firestore:', e);
    }
  }
}

// ==========================================
// 3. QUẢN LÝ TỪ / CÂU CẦN LUYỆN VIẾT
// ==========================================

export async function fetchWords(lessonId?: string, bookId?: string): Promise<SpellingWordLop2[]> {
  try {
    if (db) {
      let q = collection(db, 'spelling_words');
      const snap = await getDocs(q);
      if (!snap.empty) {
        let words = snap.docs.map((d) => ({ ...d.data(), id: d.id } as SpellingWordLop2));
        if (lessonId) words = words.filter((w) => w.lessonId === lessonId);
        if (bookId) words = words.filter((w) => w.bookId === bookId);
        return words;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc từ vựng từ Firestore:', err);
  }

  // Fallback
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_WORDS);
    if (local) {
      const parsed: SpellingWordLop2[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let res = parsed;
        if (lessonId) res = res.filter((w) => w.lessonId === lessonId);
        if (bookId) res = res.filter((w) => w.bookId === bookId);
        return res;
      }
    }
  } catch {}

  localStorage.setItem(LOCAL_STORAGE_WORDS, JSON.stringify(INITIAL_WORDS_LOP2));
  let res = INITIAL_WORDS_LOP2;
  if (lessonId) res = res.filter((w) => w.lessonId === lessonId);
  if (bookId) res = res.filter((w) => w.bookId === bookId);
  return res;
}

export async function saveWord(word: SpellingWordLop2): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  try {
    const cur = await fetchWords();
    const idx = cur.findIndex((w) => w.id === word.id);
    let updated: SpellingWordLop2[];
    if (idx >= 0) {
      updated = [...cur];
      updated[idx] = word;
    } else {
      updated = [...cur, word];
    }
    localStorage.setItem(LOCAL_STORAGE_WORDS, JSON.stringify(updated));
  } catch {}

  if (db && isTeacher) {
    try {
      await setDoc(doc(db, 'spelling_words', word.id), {
        ...word,
        createdAt: word.createdAt || new Date().toISOString(),
      });
    } catch (e) {
      console.error('Lỗi lưu từ vựng vào Firestore:', e);
    }
  }
}

/**
 * Thêm hàng loạt từ cùng lúc (mỗi dòng một từ/câu) do giáo viên dán vào
 */
export async function addBatchWords(
  rawLines: string,
  bookId: string,
  lessonId: string,
  category: SpellingErrorGroup,
  hint: string
): Promise<number> {
  const lines = rawLines
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return 0;

  const newWords: SpellingWordLop2[] = lines.map((text, idx) => ({
    id: `w_batch_${Date.now()}_${idx}`,
    bookId,
    lessonId,
    text,
    errorCategory: category,
    hint: hint.trim() || `Chú ý quy tắc chính tả nhóm ${category}`,
    createdAt: new Date().toISOString(),
  }));

  for (const w of newWords) {
    await saveWord(w);
  }

  return newWords.length;
}

export async function deleteWordById(wordId: string): Promise<void> {
  const isTeacher = isCurrentUserTeacher();
  try {
    const cur = await fetchWords();
    const updated = cur.filter((w) => w.id !== wordId);
    localStorage.setItem(LOCAL_STORAGE_WORDS, JSON.stringify(updated));
  } catch {}

  if (db && isTeacher) {
    try {
      await deleteDoc(doc(db, 'spelling_words', wordId));
    } catch (e) {
      console.error('Lỗi xóa từ vựng trên Firestore:', e);
    }
  }
}

// ==========================================
// 4. TIẾN ĐỘ HỌC SINH & SỔ TỪ KHÓ
// ==========================================

export function getStudentMistakes(): StudentMistakeRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MISTAKES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStudentMistake(
  word: string,
  errorCategory: SpellingErrorGroup,
  hint: string,
  isCorrectNow: boolean
): void {
  try {
    const cur = getStudentMistakes();
    const existing = cur.find((m) => m.word.toLowerCase() === word.toLowerCase());

    let updated: StudentMistakeRecord[];
    if (existing) {
      updated = cur.map((m) =>
        m.word.toLowerCase() === word.toLowerCase()
          ? {
              ...m,
              wrongAttempts: isCorrectNow ? m.wrongAttempts : m.wrongAttempts + 1,
              correctAttempts: isCorrectNow ? m.correctAttempts + 1 : m.correctAttempts,
              mastered: isCorrectNow && m.correctAttempts >= 2,
              lastPracticed: new Date().toLocaleDateString('vi-VN'),
            }
          : m
      );
    } else {
      const newRec: StudentMistakeRecord = {
        id: `mis_${Date.now()}`,
        word,
        errorCategory,
        hint,
        wrongAttempts: isCorrectNow ? 0 : 1,
        correctAttempts: isCorrectNow ? 1 : 0,
        lastPracticed: new Date().toLocaleDateString('vi-VN'),
        mastered: isCorrectNow,
      };
      updated = [newRec, ...cur];
    }

    localStorage.setItem(LOCAL_STORAGE_MISTAKES, JSON.stringify(updated));

    // Ghi nhận nhật ký học tập (Activity Log) để tính thống kê
    recordActivityLog(word, errorCategory, isCorrectNow);
  } catch (e) {
    console.error('Lỗi lưu sổ từ khó:', e);
  }
}

export function removeStudentMistake(id: string): void {
  try {
    const cur = getStudentMistakes();
    const updated = cur.filter((m) => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_MISTAKES, JSON.stringify(updated));
  } catch {}
}

function recordActivityLog(word: string, category: SpellingErrorGroup, isCorrect: boolean) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVITY_LOG);
    const logs: { word: string; category: SpellingErrorGroup; isCorrect: boolean; timestamp: number }[] = raw
      ? JSON.parse(raw)
      : [];

    logs.push({
      word,
      category,
      isCorrect,
      timestamp: Date.now(),
    });

    // Giữ 500 bản ghi gần nhất
    const trimmed = logs.slice(-500);
    localStorage.setItem(LOCAL_STORAGE_ACTIVITY_LOG, JSON.stringify(trimmed));
  } catch {}
}

// ==========================================
// 5. THỐNG KÊ GIÁO VIÊN (TEACHER ANALYTICS)
// ==========================================

export function getTeacherAnalytics(): TeacherAnalytics {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVITY_LOG);
    const logs: { word: string; category: SpellingErrorGroup; isCorrect: boolean }[] = raw
      ? JSON.parse(raw)
      : [];

    const totalWordsLearned = logs.length;
    const correctCount = logs.filter((l) => l.isCorrect).length;
    const accuracyRate = totalWordsLearned > 0 ? Math.round((correctCount / totalWordsLearned) * 100) : 100;

    // Đếm các từ hay sai
    const wrongMap: Record<string, { count: number; category: SpellingErrorGroup }> = {};
    const categoryStats: Record<string, { count: number; errorCount: number }> = {};

    logs.forEach((log) => {
      // Phân nhóm
      if (!categoryStats[log.category]) {
        categoryStats[log.category] = { count: 0, errorCount: 0 };
      }
      categoryStats[log.category].count += 1;
      if (!log.isCorrect) {
        categoryStats[log.category].errorCount += 1;
        if (!wrongMap[log.word]) {
          wrongMap[log.word] = { count: 0, category: log.category };
        }
        wrongMap[log.word].count += 1;
      }
    });

    const frequentMistakes = Object.entries(wrongMap)
      .map(([word, data]) => ({ word, count: data.count, category: data.category }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const categoryBreakdown = Object.entries(categoryStats).map(([cat, stats]) => ({
      category: cat as SpellingErrorGroup,
      count: stats.count,
      errorCount: stats.errorCount,
    }));

    return {
      totalWordsLearned,
      totalPracticeSessions: Math.ceil(totalWordsLearned / 5),
      accuracyRate,
      frequentMistakes,
      categoryBreakdown,
    };
  } catch {
    return {
      totalWordsLearned: 0,
      totalPracticeSessions: 0,
      accuracyRate: 100,
      frequentMistakes: [],
      categoryBreakdown: [],
    };
  }
}
