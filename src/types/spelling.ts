// Các nhóm lỗi chính tả trọng tâm trong chương trình Tiếng Việt Lớp 2
export type SpellingErrorGroup =
  | 'l_n'
  | 'ch_tr'
  | 's_x'
  | 'd_gi_r'
  | 'g_gh'
  | 'ng_ngh'
  | 'c_k_q'
  | 'hoi_nga'
  | 'ien_yen'
  | 'an_ang'
  | 'khac';

export interface ErrorGroupMeta {
  id: SpellingErrorGroup;
  label: string;
  shortLabel: string;
  ruleExplanation: string;
  badgeColor: string;
  emoji: string;
}

export const ERROR_GROUPS_META: Record<SpellingErrorGroup, ErrorGroupMeta> = {
  l_n: {
    id: 'l_n',
    label: 'Âm l / n (Luyện uốn lưỡi và đầu lưỡi)',
    shortLabel: 'l / n',
    ruleExplanation: 'Khi phát âm "l", uốn cong đầu lưỡi lên vòm trên. Khi phát âm "n", đầu lưỡi chạm lợi rồi mở ra.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    emoji: '👅',
  },
  ch_tr: {
    id: 'ch_tr',
    label: 'Âm ch / tr (ch nhẹ nhàng - tr uốn lưỡi)',
    shortLabel: 'ch / tr',
    ruleExplanation: 'Âm "tr" đầu lưỡi uốn lên vòm cứng (cây tre, con trâu, bầu trời). Âm "ch" đầu lưỡi chạm răng dưới (con chim, cái chổi).',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    emoji: '🌳',
  },
  s_x: {
    id: 's_x',
    label: 'Âm s / x (s cong lưỡi - x xát nhẹ)',
    shortLabel: 's / x',
    ruleExplanation: 'Âm "s" cong lưỡi đẩy hơi mạnh (ngôi sao, hoa sen). Âm "x" lưỡi thẳng, hơi thoát êm dịu (xe cộ, mùa xuân).',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    emoji: '⭐',
  },
  d_gi_r: {
    id: 'd_gi_r',
    label: 'Âm d / gi / r (d / gi xát - r rung lưỡi)',
    shortLabel: 'd / gi / r',
    ruleExplanation: 'Âm "r" đầu lưỡi rung nhẹ (dòng sông, rộn rã). Âm "d", "gi" không rung (dịu dàng, gia đình).',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    emoji: '🛶',
  },
  g_gh: {
    id: 'g_gh',
    label: 'Âm g / gh (Quy tắc chính tả trước i, e, ê)',
    shortLabel: 'g / gh',
    ruleExplanation: 'Chữ "gh" (g kép) luôn luôn đứng trước ba nguyên âm: i, e, ê (ghế gỗ, ghi bài). Còn "g" đi với các chữ còn lại (con gà, gấu bông).',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    emoji: '🪑',
  },
  ng_ngh: {
    id: 'ng_ngh',
    label: 'Âm ng / ngh (Quy tắc chính tả trước i, e, ê)',
    shortLabel: 'ng / ngh',
    ruleExplanation: 'Chữ "ngh" (ng kép) luôn luôn đứng trước i, e, ê (suy nghĩ, lắng nghe, con nghé). "ng" đứng trước các chữ còn lại (ngôi nhà, ngô nếp).',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    emoji: '👂',
  },
  c_k_q: {
    id: 'c_k_q',
    label: 'Âm c / k / q (c đứng trước a,o,u - k trước i,e,ê - q đi với u)',
    shortLabel: 'c / k / q',
    ruleExplanation: 'Chữ "k" luôn đi trước i, e, ê (kéo co, kim chỉ). "c" đi trước a, o, ô, u, ư. "q" luôn đi kèm "u" thành "qu" (quê hương).',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    emoji: '✂️',
  },
  hoi_nga: {
    id: 'hoi_nga',
    label: 'Dấu thanh: Hỏi (?) / Ngã (~)',
    shortLabel: 'Hỏi / Ngã',
    ruleExplanation: 'Dấu hỏi (?) giọng trầm gãy (sửa xe, mở cửa, vui vẻ). Dấu ngã (~) ngân cao gãy khúc (hộp sữa, vẽ tranh, sạch sẽ).',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    emoji: '❓',
  },
  ien_yen: {
    id: 'ien_yen',
    label: 'Vần iên / yên (Nguyên âm đôi có âm đệm và đầu từ)',
    shortLabel: 'iên / yên',
    ruleExplanation: 'Khi không có phụ âm đầu thì viết "yên" (yên tĩnh, con yến). Khi có phụ âm đầu thì viết "iên" (cô tiên, biển cả, dòng tiền).',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    emoji: '🕊️',
  },
  an_ang: {
    id: 'an_ang',
    label: 'Vần ân / âng (hoặc an/ang, en/eng)',
    shortLabel: 'ân / âng',
    ruleExplanation: 'Vần "ân" kết thúc bằng n ngắn (cần cù, bâng khuâng). Vần "âng" kết thúc bằng ng ngân dài (vầng trăng, nâng niu).',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    emoji: '🌙',
  },
  khac: {
    id: 'khac',
    label: 'Quy tắc khác & Viết hoa tên riêng',
    shortLabel: 'Quy tắc khác',
    ruleExplanation: 'Viết hoa chữ cái đầu câu, viết hoa tên người, địa danh (Hà Nội, Bác Hồ). Giữ đúng dấu chấm, phẩy.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    emoji: '✍️',
  },
};

export type UserRole = 'teacher' | 'student' | 'owner' | 'student_preview';

// Model Sách Lớp 2
export interface BookLop2 {
  id: string;
  name?: string;
  title: string;
  publisher: string; // 'Kết Nối Tri Thức' | 'Chân Trời Sáng Tạo' | 'Cánh Diều' | 'Giáo viên tự soạn'
  grade: 'Lớp 2';
  coverBg: string;
  coverIcon: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

// Model Bài học / Tuần
export interface LessonLop2 {
  id: string;
  bookId: string;
  week: number | string; // Tuần 1, Tuần 2...
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Legacy types for compatibility with existing modules
export interface CameraCheckResult {
  accuracy?: number;
  score?: number;
  stars?: number;
  extractedText?: string;
  transcribedText?: string;
  expectedText?: string;
  teacherFeedback?: string;
  neatnessComment?: string;
  errors?: any[];
  encouragement?: string;
  [key: string]: any;
}

export interface BookItem {
  id: string;
  title: string;
  author?: string;
  coverImage?: string;
  grade?: any;
  gradeLevel?: any;
  sections: any[];
  [key: string]: any;
}

export interface BookSection {
  id: string;
  title: string;
  content?: string;
  fullText?: string;
  paragraphs?: string[];
  chunks?: string[];
  [key: string]: any;
}

export interface SpellingErrorRecord {
  id: string;
  date: string;
  wrongWord: string;
  correctWord: string;
  ruleHint: string;
  practicedCount: number;
  mastered: boolean;
}

export type SoundCategory =
  | 'l_n'
  | 'ch_tr'
  | 's_x'
  | 'd_gi_r'
  | 'g_gh'
  | 'ng_ngh'
  | 'c_k_q'
  | 'hoi_nga'
  | 'ien_yen'
  | 'an_ang'
  | 'khac';

export interface SpellingWord {
  id: string;
  word: string;
  category?: SoundCategory;
  hint?: string;
  exampleSentence?: string;
  phoneticType?: any;
  categoryLabel?: string;
  audioUrl?: string;
  [key: string]: any;
}

export interface TextbookLesson {
  id: string;
  title: string;
  grade?: number;
  text?: string;
  fullText?: string;
  bookSeries?: string;
  authorOrSource?: string;
  [key: string]: any;
}

// Model Từ / Câu cần luyện viết
export interface SpellingWordLop2 {
  id: string;
  bookId: string;
  lessonId: string;
  text: string; // Từ hoặc câu hoàn chỉnh bé nghe viết
  errorCategory: SpellingErrorGroup;
  hint: string; // Lời nhắc nhẹ nhàng khi bé sai
  exampleSentence?: string;
  audioPrompt?: string;
  createdAt?: string;
}

// Model Sổ từ khó của học sinh
export interface StudentMistakeRecord {
  id: string;
  word: string;
  errorCategory: SpellingErrorGroup;
  hint: string;
  wrongAttempts: number;
  correctAttempts: number;
  lastPracticed: string;
  mastered: boolean;
}

// Kết quả phân tích sai khác từng ký tự
export interface CharDiffItem {
  char: string;
  expectedChar?: string;
  type: 'correct' | 'wrong' | 'missing' | 'extra';
}

export interface SpellingCheckResult {
  isCorrect: boolean;
  score: number;
  userInput: string;
  targetText: string;
  diffs: CharDiffItem[];
  feedbackMessage: string;
  ruleExplanation?: string;
}

// Thống kê giáo viên
export interface TeacherAnalytics {
  totalWordsLearned: number;
  totalPracticeSessions: number;
  accuracyRate: number; // Tỉ lệ đúng %
  frequentMistakes: { word: string; count: number; category: SpellingErrorGroup }[];
  categoryBreakdown: { category: SpellingErrorGroup; count: number; errorCount: number }[];
}
