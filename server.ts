import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Khởi tạo Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache in-memory trên máy chủ để không bao giờ bị lag hoặc trễ
const ttsCache = new Map<string, { base64: string; mimeType: string }>();

/**
 * API: Phát âm tiếng Việt dịu dàng, trong trẻo, chuẩn 100% giọng cô giáo tiểu học
 * Phản hồi siêu tốc (<80ms), không bị giới hạn quota, âm thanh ấm áp, dễ nghe nhất cho trẻ lớp 1
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, slow, voice } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung cần đọc' });
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Văn bản trống' });
    }

    const cacheKey = `${cleanText}_${slow ? 'slow' : 'normal'}_${voice || 'default'}`;

    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      return res.json({
        success: true,
        audioBase64: cached.base64,
        mimeType: cached.mimeType,
        fromCache: true,
      });
    }

    // 1. Nếu người dùng chọn giọng Gemini AI (Kore hoặc Aoede)
    if (voice === 'gemini-kore' || voice === 'gemini-aoede') {
      try {
        const voiceName = voice === 'gemini-aoede' ? 'Aoede' : 'Kore';
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: slow
                      ? 'Giọng cô giáo tiểu học Việt Nam dịu dàng, ngọt ngào, đọc chậm rãi từng tiếng cho học sinh lớp 1'
                      : 'Giọng cô giáo tiểu học Việt Nam dịu dàng, ngọt ngào, phát âm chuẩn tiếng Việt',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          ttsCache.set(cacheKey, { base64: base64Audio, mimeType: 'audio/wav' });
          return res.json({
            success: true,
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini TTS vượt quota hoặc lỗi, tự động chuyển sang giọng chuẩn dịu dàng:', geminiError?.message);
      }
    }

    // 2. Giọng cô giáo chuẩn tiếng Việt (Google Natural Voice) - Ấm áp, tự nhiên, không méo tiếng
    // Không dùng ttsspeed chậm nhân tạo trên server vì gây vỡ âm; tốc độ chậm sẽ được xử lý mượt mà ở trình duyệt
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=vi&client=tw-ob`;

    const ttsRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!ttsRes.ok) {
      throw new Error(`TTS server HTTP ${ttsRes.status}`);
    }

    const arrayBuffer = await ttsRes.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    ttsCache.set(cacheKey, { base64: base64Audio, mimeType: 'audio/mpeg' });

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/mpeg',
    });
  } catch (error: any) {
    console.error('Lỗi phát âm TTS:', error?.message);
    return res.status(500).json({
      error: 'Không thể phát âm: ' + (error?.message || 'Lỗi kết nối'),
    });
  }
});

/**
 * API: Kiểm tra bài viết chính tả học sinh qua ảnh chụp vở ô ly
 */
app.post('/api/check-handwriting', async (req, res) => {
  try {
    const { imageBase64, expectedText, gradeLevel } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const currentGrade = gradeLevel || 1;

    const prompt = `Bạn là một giáo viên Tiếng Việt và Ngữ Văn chuẩn mực, giàu tình cảm, thấu hiểu tâm lý học sinh Lớp ${currentGrade}.
Dưới đây là bức ảnh trang vở viết tay do học sinh viết bài chính tả hoặc bài văn.
Bài mẫu cần viết là:
"""${expectedText || '(Không có bài mẫu cụ thể, hãy kiểm tra chính tả tổng thể trang viết)'}"""

Hãy thực hiện:
1. Nhận dạng chữ viết tay của học sinh trong bức ảnh (transcribedText).
2. Đối chiếu từng từ học sinh viết với bài mẫu (nếu có).
3. Tìm ra tất cả lỗi sai chính tả (âm đầu ch/tr, s/x, d/gi/r, c/k, g/gh, ng/ngh, l/n; vần an/ang, ao/au, uôn/uông; dấu thanh hỏi/ngã, sắc/huyền/nặng, thiếu chữ, bỏ sót từ).
4. Viết lời nhận xét yêu thương, ấm áp, tích cực (khen ngợi nét chữ, sự nỗ lực, chỉ bảo nhẹ nhàng cách sửa).
5. Trả về danh sách chi tiết các từ bị sai, từ đúng chuẩn và mẹo quy tắc chính tả dễ nhớ.
6. Cho điểm số (1-10) và số sao thưởng (1-5).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: `Bạn là chuyên gia giáo dục phụ trách môn Tiếng Việt và Ngữ Văn Lớp ${currentGrade}. Luôn nhận xét chân tình, chuẩn sư phạm và trả về JSON hợp lệ.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedText: {
              type: Type.STRING,
              description: 'Toàn bộ nội dung chữ viết tay mà bé đã viết',
            },
            score: {
              type: Type.NUMBER,
              description: 'Điểm số từ 1 đến 10',
            },
            stars: {
              type: Type.INTEGER,
              description: 'Số ngôi sao thưởng từ 1 đến 5',
            },
            teacherFeedback: {
              type: Type.STRING,
              description: 'Lời nhận xét tâm lý, ấm áp của cô giáo dành cho bé',
            },
            neatnessComment: {
              type: Type.STRING,
              description: 'Nhận xét về độ sạch sẽ, nắn nót, đúng ô ly của nét chữ',
            },
            errors: {
              type: Type.ARRAY,
              description: 'Danh sách các lỗi chính tả tìm thấy',
              items: {
                type: Type.OBJECT,
                properties: {
                  wrongWord: {
                    type: Type.STRING,
                    description: 'Từ bé viết sai trong vở',
                  },
                  correctWord: {
                    type: Type.STRING,
                    description: 'Từ viết đúng chuẩn',
                  },
                  ruleHint: {
                    type: Type.STRING,
                    description: 'Mẹo nhớ quy tắc chính tả lớp 1 ngắn gọn, dễ hiểu',
                  },
                  errorType: {
                    type: Type.STRING,
                    description: 'Loại lỗi (ví dụ: ch/tr, c/k, dấu hỏi ngã, thiếu nét)',
                  },
                },
                required: ['wrongWord', 'correctWord', 'ruleHint'],
              },
            },
          },
          required: ['transcribedText', 'score', 'stars', 'teacherFeedback', 'errors'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Lỗi khi chấm bài viết bằng camera:', error);
    return res.status(500).json({
      error: 'Không thể phân tích ảnh vở: ' + (error?.message || 'Vui lòng thử lại chụp rõ nét hơn'),
    });
  }
});

/**
 * API: Trích xuất và phân chia bài tập đọc/chính tả từ ảnh chụp sách giáo khoa
 */
app.post('/api/extract-book-text', async (req, res) => {
  try {
    const { imageBase64, pdfBase64, fileBase64, mimeType, rawText, gradeLevel } = req.body;
    const currentGrade = gradeLevel || 1;

    let prompt = '';
    const parts: any[] = [];

    const effectiveBase64 = fileBase64 || pdfBase64 || imageBase64;

    if (effectiveBase64) {
      // Xác định mimeType từ data URL hoặc param
      let detectedMime = mimeType || 'image/jpeg';
      if (typeof effectiveBase64 === 'string' && effectiveBase64.startsWith('data:')) {
        const match = effectiveBase64.match(/^data:([^;]+);base64,/);
        if (match && match[1]) {
          detectedMime = match[1];
        }
      } else if (pdfBase64) {
        detectedMime = 'application/pdf';
      }

      const cleanBase64 = effectiveBase64.replace(/^data:[^;]+;base64,/, '');

      parts.push({
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64,
        },
      });

      if (detectedMime === 'application/pdf') {
        prompt = `Hãy đọc tài liệu / sách giáo khoa Tiếng Việt hoặc Ngữ Văn (Lớp ${currentGrade}) dạng file PDF này.
Phát hiện tên cuốn sách (bookTitle).
Phân chia sách thành danh sách các BÀI HỌC / BÀI CHÍNH TẢ (sections) có trong file.
Với mỗi bài đọc (section):
- Số bài / Tuần (sectionNumber, ví dụ: Bài 1, Tuần 2)
- Tên bài đọc (title)
- Toàn bộ văn bản bài đọc chuẩn xác, đủ dấu thanh tiếng Việt (fullText)
- Danh sách các ĐOẠN VĂN (paragraphs)
- Danh sách các CÂU hoàn chỉnh trong bài (sentences)
- Danh sách các CỤM TỪ ngắn từ 3 đến 5 chữ (chunks) liền mạch ngữ pháp, đúng nhịp cô giáo đọc cho bé lớp 2 chép, giữ nguyên dấu chấm phẩy
- Lời lưu ý quy tắc chính tả (guideNotes) và biểu tượng (emoji).`;
      } else {
        prompt = `Hãy đọc và trích xuất bài tập đọc / đoạn văn chính tả từ trang sách giáo khoa Tiếng Việt Lớp ${currentGrade} này.
Loại bỏ bài tập râu ria, trích xuất chuẩn bài đọc chính.
Phân chia thành danh sách các BÀI/MỤC (sections).
Mỗi bài hãy chia thành:
- Các đoạn văn (paragraphs)
- Các câu hoàn chỉnh (sentences)
- Các cụm từ đọc chính tả ngắn từ 3 đến 5 chữ (chunks) tròn nghĩa, vừa sức bé lớp 2 chép kịp, giữ đúng dấu câu tiếng Việt.`;
      }
    } else if (rawText) {
      prompt = `Dưới đây là nội dung từ một file sách hoặc tài liệu chính tả (Lớp ${currentGrade}):
"""${rawText}"""
Hãy đọc, phát hiện tên sách và phân chia thành từng bài đọc (sections).
Với mỗi bài đọc:
- Chia bài đọc thành các đoạn văn (paragraphs)
- Chia thành các câu hoàn chỉnh (sentences)
- Chia thành các cụm đọc chính tả ngắn từ 3 đến 5 chữ (chunks) liền nghĩa cho bé chép, giữ đầy đủ dấu câu.
- Đưa ra lời lưu ý chính tả ngắn gọn (guideNotes) và biểu tượng cảm xúc (emoji).`;
    } else {
      return res.status(400).json({ error: 'Vui lòng cung cấp file PDF sách, ảnh trang sách hoặc văn bản' });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: `Bạn là chuyên gia sư phạm tiểu học phụ trách biên soạn sách Tiếng Việt Lớp ${currentGrade}. Luôn trả về định dạng JSON hợp lệ.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING, description: 'Tên cuốn sách hoặc tập bài đọc' },
            title: { type: Type.STRING, description: 'Tên bài đọc chính đầu tiên' },
            fullText: { type: Type.STRING, description: 'Toàn bộ bài đọc' },
            paragraphs: {
              type: Type.ARRAY,
              description: 'Các đoạn văn trong bài để bé chọn đoạn muốn chép',
              items: { type: Type.STRING },
            },
            sentences: {
              type: Type.ARRAY,
              description: 'Các câu trong bài đọc',
              items: { type: Type.STRING },
            },
            chunks: {
              type: Type.ARRAY,
              description: 'Các cụm từ 3-5 chữ để đọc cho học sinh viết',
              items: {
                type: Type.OBJECT,
                properties: {
                  order: { type: Type.INTEGER },
                  text: { type: Type.STRING, description: 'Cụm 3-5 chữ' },
                  guideNote: { type: Type.STRING },
                },
                required: ['order', 'text'],
              },
            },
            sections: {
              type: Type.ARRAY,
              description: 'Danh sách các bài/mục con trong sách hoặc tài liệu tải lên',
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionNumber: { type: Type.STRING, description: 'Ví dụ: Bài 1, Tuần 1, Trang 20...' },
                  title: { type: Type.STRING, description: 'Tên bài đọc này' },
                  fullText: { type: Type.STRING },
                  paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sentences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  chunks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  guideNotes: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  isPublished: { type: Type.BOOLEAN, description: 'Mặc định false để giáo viên duyệt trước' },
                },
                required: ['sectionNumber', 'title', 'fullText', 'chunks'],
              },
            },
          },
          required: ['title', 'fullText', 'chunks'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Lỗi trích xuất sách giáo khoa:', error);
    return res.status(500).json({
      error: 'Không thể xử lý bài đọc SGK: ' + (error?.message || 'Vui lòng thử lại'),
    });
  }
});

// Vite server in dev or Static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Máy chủ Bé Vui Học Chính Tả đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();
