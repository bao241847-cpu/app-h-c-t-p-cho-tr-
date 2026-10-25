import { CharDiffItem, SpellingCheckResult, SpellingErrorGroup, ERROR_GROUPS_META } from '../types/spelling';

/**
 * Chuẩn hóa chuỗi tiếng Việt sang chuẩn NFC (Precomposed)
 * Giúp so sánh chính xác tuyệt đối dấu thanh và dấu mũ/móc
 */
export function normalizeVi(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Thuật toán so sánh từng ký tự giữa từ chuẩn và bài viết của bé (Levenshtein Alignment)
 * Giúp hiển thị chính xác chữ nào bé viết đúng (xanh), chữ nào bị sai hoặc thiếu/thừa (đỏ)
 */
export function diffVietnameseChars(target: string, input: string): CharDiffItem[] {
  const normTarget = normalizeVi(target);
  const normInput = normalizeVi(input);

  const tLen = normTarget.length;
  const iLen = normInput.length;

  // Ma trận khoảng cách Levenshtein
  const dp: number[][] = Array.from({ length: tLen + 1 }, () =>
    Array(iLen + 1).fill(0)
  );

  for (let i = 0; i <= tLen; i++) dp[i][0] = i;
  for (let j = 0; j <= iLen; j++) dp[0][j] = j;

  for (let i = 1; i <= tLen; i++) {
    for (let j = 1; j <= iLen; j++) {
      if (normTarget[i - 1] === normInput[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1], // Thay thế
          dp[i - 1][j],     // Thiếu
          dp[i][j - 1]      // Thừa
        );
      }
    }
  }

  // Truy vết ngược để tạo danh sách diffs
  const diffs: CharDiffItem[] = [];
  let i = tLen;
  let j = iLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normTarget[i - 1] === normInput[j - 1]) {
      diffs.unshift({
        char: normInput[j - 1],
        expectedChar: normTarget[i - 1],
        type: 'correct',
      });
      i--;
      j--;
    } else if (
      i > 0 &&
      j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] + 1
    ) {
      diffs.unshift({
        char: normInput[j - 1],
        expectedChar: normTarget[i - 1],
        type: 'wrong',
      });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      // Bé gõ thừa chữ
      diffs.unshift({
        char: normInput[j - 1],
        type: 'extra',
      });
      j--;
    } else if (i > 0) {
      // Bé gõ thiếu chữ
      diffs.unshift({
        char: '_',
        expectedChar: normTarget[i - 1],
        type: 'missing',
      });
      i--;
    }
  }

  return diffs;
}

/**
 * Phân tích lỗi cụ thể và sinh lời khuyên sư phạm nhẹ nhàng cho học sinh lớp 2
 */
export function evaluateSpelling(
  targetText: string,
  userInput: string,
  category: SpellingErrorGroup = 'khac',
  customHint?: string
): SpellingCheckResult {
  const normTarget = normalizeVi(targetText);
  const normInput = normalizeVi(userInput);

  const isExact = normTarget.toLowerCase() === normInput.toLowerCase();
  const diffs = diffVietnameseChars(normTarget, normInput);

  if (isExact) {
    return {
      isCorrect: true,
      score: 10,
      userInput: normInput,
      targetText: normTarget,
      diffs,
      feedbackMessage: 'Tuyệt vời! Bé viết rất chuẩn xác và nắn nót! ⭐',
      ruleExplanation: ERROR_GROUPS_META[category]?.ruleExplanation,
    };
  }

  // Tìm nguyên nhân lỗi phổ biến để nhắc bé
  let specificAdvice = customHint || '';
  const lowTarget = normTarget.toLowerCase();
  const lowInput = normInput.toLowerCase();

  if (!specificAdvice) {
    if (category === 'ch_tr') {
      if (lowTarget.includes('ch')) {
        specificAdvice = 'Bé chú ý âm "ch" đầu lưỡi chạm hàm răng dưới nhẹ nhàng nha!';
      } else {
        specificAdvice = 'Bé chú ý âm "tr" uốn cong đầu lưỡi lên vòm miệng nhé!';
      }
    } else if (category === 'l_n') {
      if (lowTarget.includes('n')) {
        specificAdvice = 'Chữ "n" đầu lưỡi chạm chân răng rồi thả lỏng nhé!';
      } else {
        specificAdvice = 'Chữ "l" cong lưỡi lên vòm trên bé nha!';
      }
    } else if (category === 's_x') {
      if (lowTarget.includes('x')) {
        specificAdvice = 'Chữ "x" đọc nhẹ nhàng không cong lưỡi nha!';
      } else {
        specificAdvice = 'Chữ "s" uốn cong lưỡi phát âm rõ bé nhé!';
      }
    } else if (category === 'c_k_q') {
      specificAdvice = 'Bé nhớ quy tắc: Chữ K luôn đứng trước i, e, ê nhé!';
    } else if (category === 'g_gh') {
      specificAdvice = 'Chữ "gh" (g kép) luôn đi cùng i, e, ê nha bé!';
    } else if (category === 'ng_ngh') {
      specificAdvice = 'Chữ "ngh" (ng kép) luôn đi trước các chữ i, e, ê!';
    } else if (category === 'hoi_nga') {
      specificAdvice = 'Bé chú ý phân biệt dấu hỏi (?) và dấu ngã (~) nhé!';
    } else if (category === 'ien_yen') {
      specificAdvice = 'Bé chú ý vần "iên" có chữ i ngắn hay "yên" có chữ y dài nhé!';
    } else if (category === 'an_ang') {
      specificAdvice = 'Bé chú ý kết thúc bằng chữ "n" hay chữ "ng" ngân dài nhé!';
    } else {
      specificAdvice = 'Bé quan sát kỹ các chữ màu đỏ và thử viết lại thật đúng nhé!';
    }
  }

  // Tính điểm theo tỉ lệ ký tự đúng
  const correctCount = diffs.filter((d) => d.type === 'correct').length;
  const ratio = Math.max(0, Math.min(1, correctCount / Math.max(normTarget.length, 1)));
  const score = Math.round(ratio * 9); // Tối đa 9 điểm nếu có lỗi

  return {
    isCorrect: false,
    score,
    userInput: normInput,
    targetText: normTarget,
    diffs,
    feedbackMessage: specificAdvice,
    ruleExplanation: ERROR_GROUPS_META[category]?.ruleExplanation,
  };
}
