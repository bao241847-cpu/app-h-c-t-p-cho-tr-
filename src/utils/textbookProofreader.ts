import { normalizeVi, diffVietnameseChars } from './spellingDiff';
import { SpellingErrorGroup, ERROR_GROUPS_META, CharDiffItem } from '../types/spelling';

export interface WordDiffItem {
  id: string;
  type: 'correct' | 'wrong' | 'missing' | 'extra';
  studentWord?: string;
  expectedWord?: string;
  cleanStudentWord?: string;
  cleanExpectedWord?: string;
  charDiffs?: CharDiffItem[];
  errorCategory?: SpellingErrorGroup;
  explanation?: string;
  sentenceContext?: string;
}

export interface TextbookProofreadResult {
  totalExpectedWords: number;
  correctWordsCount: number;
  wrongWordsCount: number;
  missingWordsCount: number;
  extraWordsCount: number;
  accuracyPercent: number;
  score: number; // Thang điểm 10 (ví dụ 9.5)
  stars: number; // 1 đến 5 sao
  items: WordDiffItem[];
  errorsGrouped: {
    category: SpellingErrorGroup;
    label: string;
    emoji: string;
    words: { wrong: string; correct: string; explanation: string; sentence: string }[];
  }[];
  mistakeWordsList: {
    wrong: string;
    correct: string;
    category: SpellingErrorGroup;
    hint: string;
    sentence: string;
  }[];
  encouragement: string;
}

/**
 * Loại bỏ dấu câu ở đầu/cuối từ để so sánh âm vần chuẩn
 */
function cleanPunctuation(word: string): string {
  if (!word) return '';
  return word.replace(/^[.,;:!?"'«»()—–-]+|[.,;:!?"'«»()—–-]+$/g, '').trim();
}

/**
 * Phân tích nhóm lỗi chính tả giữa từ học sinh viết và từ chuẩn của SGK
 */
function detectErrorCategory(studentClean: string, expectedClean: string): {
  category: SpellingErrorGroup;
  explanation: string;
} {
  const s = studentClean.toLowerCase().normalize('NFC');
  const e = expectedClean.toLowerCase().normalize('NFC');

  // 1. Nhóm ch / tr
  if ((e.startsWith('tr') && s.startsWith('ch')) || (e.startsWith('ch') && s.startsWith('tr')) ||
      (e.includes('tr') && s.includes('ch')) || (e.includes('ch') && s.includes('tr'))) {
    const isExpectedTr = e.includes('tr');
    return {
      category: 'ch_tr',
      explanation: isExpectedTr
        ? `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: âm "tr" uốn cong đầu lưỡi lên vòm họng nhé!`
        : `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: âm "ch" đầu lưỡi chạm hàm răng dưới nhẹ nhàng nha!`,
    };
  }

  // 2. Nhóm s / x
  if ((e.startsWith('s') && s.startsWith('x')) || (e.startsWith('x') && s.startsWith('s')) ||
      (e.includes('s') && s.includes('x')) || (e.includes('x') && s.includes('s'))) {
    const isExpectedS = e.includes('s');
    return {
      category: 's_x',
      explanation: isExpectedS
        ? `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: âm "s" uốn cong lưỡi đẩy hơi rõ con nhé!`
        : `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: âm "x" đọc nhẹ nhàng, không uốn lưỡi nha!`,
    };
  }

  // 3. Nhóm l / n
  if ((e.startsWith('l') && s.startsWith('n')) || (e.startsWith('n') && s.startsWith('l'))) {
    const isExpectedL = e.startsWith('l');
    return {
      category: 'l_n',
      explanation: isExpectedL
        ? `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: chữ "l" uốn cong lưỡi lên vòm trên nhé!`
        : `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ: chữ "n" đầu lưỡi chạm chân răng rồi mở ra nha!`,
    };
  }

  // 4. Nhóm d / gi / r
  const isDGiR = ['d', 'gi', 'r'].some(p => e.startsWith(p)) && ['d', 'gi', 'r'].some(p => s.startsWith(p));
  if (isDGiR && e[0] !== s[0]) {
    return {
      category: 'd_gi_r',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Nhớ phân biệt âm "d", "gi" và "r" rung đầu lưỡi nhé!`,
    };
  }

  // 5. Nhóm c / k / q
  if ((e.startsWith('c') && s.startsWith('k')) || (e.startsWith('k') && s.startsWith('c'))) {
    return {
      category: 'c_k_q',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Quy tắc: Chữ "k" luôn đứng trước các nguyên âm i, e, ê nhé!`,
    };
  }

  // 6. Nhóm g / gh
  if ((e.startsWith('gh') && s.startsWith('g')) || (e.startsWith('g') && s.startsWith('gh'))) {
    return {
      category: 'g_gh',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Quy tắc: "gh" (g kép) luôn đi với i, e, ê nha con!`,
    };
  }

  // 7. Nhóm ng / ngh
  if ((e.startsWith('ngh') && s.startsWith('ng')) || (e.startsWith('ng') && s.startsWith('ngh'))) {
    return {
      category: 'ng_ngh',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Quy tắc: "ngh" (ng kép) luôn đi với i, e, ê con nhé!`,
    };
  }

  // 8. Dấu hỏi / ngã
  // Kiểm tra nếu ký tự không dấu giống nhau nhưng khác dấu thanh hỏi - ngã
  const removeTones = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  if (removeTones(s) === removeTones(e)) {
    return {
      category: 'hoi_nga',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Con chú ý phân biệt dấu hỏi (?) và dấu ngã (~) nhé!`,
    };
  }

  // 9. Vần iên / yên
  if ((e.includes('iên') && s.includes('yên')) || (e.includes('yên') && s.includes('iên'))) {
    return {
      category: 'ien_yen',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Chú ý: vần "iên" dùng i ngắn hay "yên" dùng y dài con nhé!`,
    };
  }

  // 10. Vần an / ang
  if ((e.includes('an') && s.includes('ang')) || (e.includes('ang') && s.includes('an')) ||
      (e.includes('ân') && s.includes('âng')) || (e.includes('âng') && s.includes('ân'))) {
    return {
      category: 'an_ang',
      explanation: `Con viết "${studentClean}", đúng là "${expectedClean}". Chú ý âm cuối kết thúc bằng "n" hay "ng" ngân dài nha!`,
    };
  }

  // Mặc định: Lỗi sai chính tả khác
  return {
    category: 'khac',
    explanation: `Con viết "${studentClean}", đúng chuẩn là "${expectedClean}". Con quan sát kỹ từng nét chữ và dấu thanh nhé!`,
  };
}

/**
 * Thuật toán so khớp văn bản bài chính tả SGK cấp từ (Word-level Levenshtein Alignment)
 * Bằng code thuần túy, KHÔNG phụ thuộc vào AI nhận xét đúng sai.
 */
export function proofreadTextbookDictation(
  targetText: string,
  studentText: string
): TextbookProofreadResult {
  const normTarget = normalizeVi(targetText);
  const normStudent = normalizeVi(studentText);

  // Tách từ chuẩn xác
  const targetWords = normTarget.split(/\s+/).filter(Boolean);
  const studentWords = normStudent.split(/\s+/).filter(Boolean);

  // Tìm câu tương ứng của từng từ trong targetText để phục vụ nút "Nghe lại câu có lỗi"
  const sentences = normTarget.split(/(?<=[.?!])\s+/).filter(Boolean);
  const wordToSentenceMap: string[] = [];
  let wIdx = 0;
  for (const sent of sentences) {
    const sWords = sent.split(/\s+/).filter(Boolean);
    for (let k = 0; k < sWords.length; k++) {
      wordToSentenceMap[wIdx] = sent;
      wIdx++;
    }
  }

  const n = targetWords.length;
  const m = studentWords.length;

  // Ma trận khoảng cách Levenshtein giữa các từ
  // Khoảng cách giữa 2 từ dựa trên similarity sạch (bỏ dấu câu)
  const wordDist = (w1: string, w2: string): number => {
    const c1 = cleanPunctuation(w1).toLowerCase();
    const c2 = cleanPunctuation(w2).toLowerCase();
    if (w1 === w2) return 0;
    if (c1 === c2) return 0.2; // Chỉ khác dấu câu hoặc hoa thường
    // Tính khoảng cách ký tự giữa c1 và c2
    const diffs = diffVietnameseChars(c1, c2);
    const wrongCount = diffs.filter(d => d.type !== 'correct').length;
    return Math.min(1.5, 0.4 + wrongCount * 0.3);
  };

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = wordDist(targetWords[i - 1], studentWords[j - 1]);
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + cost, // Thay thế / khớp
        dp[i - 1][j] + 1,        // Thiếu từ
        dp[i][j - 1] + 1         // Thừa từ
      );
    }
  }

  // Truy vết ngược để tạo danh sách đối chiếu WordDiffItem
  const rawItems: WordDiffItem[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    const tWord = i > 0 ? targetWords[i - 1] : '';
    const sWord = j > 0 ? studentWords[j - 1] : '';
    const sent = i > 0 ? (wordToSentenceMap[i - 1] || normTarget) : '';

    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + wordDist(tWord, sWord)) {
      const cleanT = cleanPunctuation(tWord);
      const cleanS = cleanPunctuation(sWord);
      const isExact = tWord === sWord || cleanT.toLowerCase() === cleanS.toLowerCase();

      if (isExact) {
        rawItems.unshift({
          id: `diff_${i}_${j}`,
          type: 'correct',
          studentWord: sWord,
          expectedWord: tWord,
          cleanStudentWord: cleanS,
          cleanExpectedWord: cleanT,
          sentenceContext: sent,
        });
      } else {
        const errorInfo = detectErrorCategory(cleanS, cleanT);
        const charDiffs = diffVietnameseChars(cleanT, cleanS);

        rawItems.unshift({
          id: `diff_${i}_${j}`,
          type: 'wrong',
          studentWord: sWord,
          expectedWord: tWord,
          cleanStudentWord: cleanS,
          cleanExpectedWord: cleanT,
          charDiffs,
          errorCategory: errorInfo.category,
          explanation: errorInfo.explanation,
          sentenceContext: sent,
        });
      }
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      // Bé viết thừa từ
      rawItems.unshift({
        id: `extra_${j}`,
        type: 'extra',
        studentWord: sWord,
        cleanStudentWord: cleanPunctuation(sWord),
        sentenceContext: sent,
      });
      j--;
    } else if (i > 0) {
      // Bé viết thiếu từ
      const cleanT = cleanPunctuation(tWord);
      rawItems.unshift({
        id: `missing_${i}`,
        type: 'missing',
        expectedWord: tWord,
        cleanExpectedWord: cleanT,
        explanation: `Con bị sót từ "${tWord}" trong bài viết.`,
        sentenceContext: sent,
      });
      i--;
    }
  }

  // Thống kê số lượng
  const totalExpectedWords = targetWords.length;
  const correctWordsCount = rawItems.filter(item => item.type === 'correct').length;
  const wrongWordsCount = rawItems.filter(item => item.type === 'wrong').length;
  const missingWordsCount = rawItems.filter(item => item.type === 'missing').length;
  const extraWordsCount = rawItems.filter(item => item.type === 'extra').length;

  const rawAccuracy = totalExpectedWords > 0 ? (correctWordsCount / totalExpectedWords) * 100 : 0;
  const accuracyPercent = Math.max(0, Math.min(100, Math.round(rawAccuracy)));

  // Thang điểm 10 (ví dụ 10, 9.5, 8.5)
  let score = Math.round((accuracyPercent / 10) * 10) / 10;
  if (accuracyPercent === 100) score = 10;

  // Số sao 1 - 5
  let stars = 3;
  if (score >= 9.5) stars = 5;
  else if (score >= 8.5) stars = 4;
  else if (score >= 7.0) stars = 3;
  else if (score >= 5.0) stars = 2;
  else stars = 1;

  // Gom lỗi theo nhóm chính tả
  const groupMap = new Map<SpellingErrorGroup, { wrong: string; correct: string; explanation: string; sentence: string }[]>();
  const mistakeWordsList: { wrong: string; correct: string; category: SpellingErrorGroup; hint: string; sentence: string }[] = [];

  for (const item of rawItems) {
    if (item.type === 'wrong' && item.cleanStudentWord && item.cleanExpectedWord) {
      const cat = item.errorCategory || 'khac';
      if (!groupMap.has(cat)) groupMap.set(cat, []);
      const entry = {
        wrong: item.cleanStudentWord,
        correct: item.cleanExpectedWord,
        explanation: item.explanation || `Viết đúng là: ${item.cleanExpectedWord}`,
        sentence: item.sentenceContext || '',
      };
      groupMap.get(cat)!.push(entry);
      mistakeWordsList.push({
        wrong: item.cleanStudentWord,
        correct: item.cleanExpectedWord,
        category: cat,
        hint: item.explanation || `Chú ý: ${item.cleanExpectedWord}`,
        sentence: item.sentenceContext || '',
      });
    } else if (item.type === 'missing' && item.cleanExpectedWord) {
      const cat: SpellingErrorGroup = 'khac';
      if (!groupMap.has(cat)) groupMap.set(cat, []);
      groupMap.get(cat)!.push({
        wrong: '(Bỏ sót)',
        correct: item.cleanExpectedWord,
        explanation: `Con bị sót từ "${item.cleanExpectedWord}".`,
        sentence: item.sentenceContext || '',
      });
      mistakeWordsList.push({
        wrong: `(sót) ${item.cleanExpectedWord}`,
        correct: item.cleanExpectedWord,
        category: 'khac',
        hint: `Bé nhớ đừng bỏ sót từ "${item.cleanExpectedWord}" nhé!`,
        sentence: item.sentenceContext || '',
      });
    }
  }

  const errorsGrouped = Array.from(groupMap.entries()).map(([cat, words]) => ({
    category: cat,
    label: ERROR_GROUPS_META[cat]?.label || 'Lỗi chính tả khác',
    emoji: ERROR_GROUPS_META[cat]?.emoji || '📝',
    words,
  }));

  // Lời khen ấm áp phù hợp tâm lý học sinh lớp 2
  let encouragement = '';
  if (accuracyPercent === 100) {
    encouragement = '🌟 Xuất sắc tuyệt đối! Con chép bài rất cẩn thận, chuẩn xác từng chữ và dấu thanh!';
  } else if (accuracyPercent >= 90) {
    encouragement = '👏 Tuyệt vời! Bài viết của con rất tốt, chỉ cần để ý một vài chữ nhỏ là đạt điểm 10 rồi!';
  } else if (accuracyPercent >= 75) {
    encouragement = '💪 Con làm bài rất cố gắng! Cùng cô bấm "Viết lại những chữ sai" để nhớ thật lâu nhé!';
  } else {
    encouragement = '🌱 Đừng nản lòng con nhé! Luyện tập chăm chỉ mỗi ngày sẽ giúp nét chữ và chính tả của con tiến bộ vượt bậc!';
  }

  return {
    totalExpectedWords,
    correctWordsCount,
    wrongWordsCount,
    missingWordsCount,
    extraWordsCount,
    accuracyPercent,
    score,
    stars,
    items: rawItems,
    errorsGrouped,
    mistakeWordsList,
    encouragement,
  };
}
