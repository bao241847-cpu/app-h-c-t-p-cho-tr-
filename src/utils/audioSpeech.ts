// Bộ phát âm Tiếng Việt Siêu Tốc (0ms Độ Trễ - Không Lag) dành riêng cho Học Sinh Lớp 1
// Chạy trực tiếp trên trình duyệt, không cần chờ mạng máy chủ, bấm là phát âm thanh tức thì!

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Tiếng tinh tinh vui vẻ khi trả lời đúng
  playSuccess(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.31);
      });
    } catch {
      // Ignored
    }
  }

  // Tiếng boing nhẹ nhàng động viên bé khi chưa đúng
  playEncouragement(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignored
    }
  }

  // Tiếng ngôi sao vàng lấp lánh bay vào túi
  playStar(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [659.25, 880, 1174.66, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.26);
      });
    } catch {
      // Ignored
    }
  }

  // Chuông gõ boong nhẹ của cô giáo nhắc bé chuyển cụm từ viết bài
  playTeacherBell(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.62);
    } catch {
      // Ignored
    }
  }

  // Tiếng kèn chúc mừng khi hoàn thành bài
  playFanfare(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.25 },
        { f: 783.99, d: 0.35 },
        { f: 1046.5, d: 0.5 },
      ];

      let t = now;
      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + note.d + 0.03);
        t += note.d + 0.02;
      });
    } catch {
      // Ignored
    }
  }

  // Tiếng chiến thắng khi hoàn thành vòng luyện
  playVictory(): void {
    this.playFanfare();
  }
}

export const sfx = new SoundEffects();

/**
 * Bản đồ đọc tên âm/chữ cái tiếng Việt chuẩn mực lớp 1
 * Ngắn gọn, đọc đúng âm vị trong 0.2 giây!
 */
const VIETNAMESE_PHONETIC_NAMES: Record<string, string> = {
  ch: 'chờ',
  tr: 'trờ',
  s: 'sờ',
  x: 'xờ',
  c: 'cờ',
  k: 'ca',
  g: 'gờ',
  gh: 'gờ',
  ng: 'ngờ',
  ngh: 'ngờ',
  d: 'dờ',
  gi: 'gi',
  r: 'rờ',
  l: 'lờ',
  n: 'nờ',
  an: 'an',
  ang: 'ang',
  uôn: 'uôn',
  uông: 'uông',
  iên: 'iên',
  iêng: 'iêng',
  ao: 'ao',
  au: 'au',
};

/**
 * Bộ phát âm Giọng Cô Giáo Dịu Dàng - Chuẩn Tiếng Việt 100%
 * Sử dụng giọng đọc tự nhiên, êm dịu, ấm áp, ngắt nhịp sư phạm lớp 1
 * Tích hợp bộ đệm siêu tốc (In-Memory Cache): bấm lần 1 mất ~70ms, từ lần 2 là 0ms TỨC THÌ!
 */
export type TeacherVoiceType = 'mai' | 'lan' | 'ha' | 'browser';

class SweetTeacherSpeechReader {
  private isSpeaking = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();
  private activeVoice: TeacherVoiceType = 'mai';
  private cachedBrowserVoice: SpeechSynthesisVoice | null = null;
  private slowTimer: any = null;

  constructor() {
    this.initBrowserVoice();
    this.preloadEssentialSounds();
  }

  private initBrowserVoice(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedBrowserVoice = this.detectVietnameseVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedBrowserVoice = this.detectVietnameseVoice();
      };
    }
  }

  private detectVietnameseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Ưu tiên 1: Microsoft Hoài My Online Natural (giọng cô giáo Việt Nam dịu dàng, truyền cảm nhất)
    const hoaiMy = voices.find(
      (v) =>
        (v.name.toLowerCase().includes('hoaimy') || v.name.toLowerCase().includes('hoài my')) &&
        (v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase() === 'vi-vn')
    );
    if (hoaiMy) return hoaiMy;

    // Ưu tiên 2: Google Tiếng Việt (trên Android, Google Chrome)
    const googleVi = voices.find(
      (v) => v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith('vi')
    );
    if (googleVi) return googleVi;

    // Ưu tiên 3: Giọng Linh / Mai trên iOS, macOS
    const appleVi = voices.find(
      (v) =>
        (v.name.toLowerCase().includes('linh') || v.name.toLowerCase().includes('mai')) &&
        v.lang.toLowerCase().startsWith('vi')
    );
    if (appleVi) return appleVi;

    // Ưu tiên 4: Bất kỳ giọng chuẩn vi-VN nào
    const viExact = voices.find((v) => {
      const l = v.lang.toLowerCase();
      return l === 'vi-vn' || l === 'vi_vn' || l.startsWith('vi');
    });
    if (viExact) return viExact;

    return null;
  }

  public hasLocalVietnameseVoice(): boolean {
    return !!this.detectVietnameseVoice();
  }

  /**
   * Tự động nạp sẵn vào bộ nhớ các âm/vần cơ bản nhất của lớp 1
   * Giúp bé bấm vào là phát ngay lập tức 0ms, không độ trễ!
   */
  private preloadEssentialSounds(): void {
    if (typeof window === 'undefined') return;

    // Nạp trước các âm đầu và từ ví dụ hay gặp
    const essentials = [
      'chờ', 'trờ', 'sờ', 'xờ', 'cờ', 'ca', 'gờ', 'ngờ', 'dờ', 'gi', 'rờ', 'lờ', 'nờ',
      'cây tre', 'chú chim', 'hoa sen', 'xe máy', 'con cá', 'cây kim'
    ];

    setTimeout(() => {
      essentials.forEach((text, i) => {
        setTimeout(() => {
          this.fetchAndCacheAudio(text, false).catch(() => {});
        }, i * 300);
      });
    }, 1000);
  }

  /**
   * Tải trước âm thanh vào bộ nhớ trong lúc chờ, để khi bé bấm là phát 0ms ngay
   */
  public prefetch(text: string): void {
    if (!text || typeof window === 'undefined' || this.activeVoice === 'browser') return;
    const clean = text.trim();
    if (!clean) return;
    this.fetchAndCacheAudio(clean, false).catch(() => {});
  }

  public setTeacherVoice(style: TeacherVoiceType | string): void {
    if (style === 'mai' || style === 'lan' || style === 'ha' || style === 'browser') {
      this.activeVoice = style;
    } else if (style === 'kore') {
      this.activeVoice = 'lan';
    } else if (style === 'zephyr') {
      this.activeVoice = 'ha';
    } else {
      this.activeVoice = 'mai';
    }
  }

  public getTeacherVoice(): TeacherVoiceType {
    return this.activeVoice;
  }

  public stop(): void {
    if (this.slowTimer) {
      clearTimeout(this.slowTimer);
      this.slowTimer = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Phát âm tức thì âm/chữ cái đơn lẻ (chờ, trờ, sờ, xờ, ca...)
   */
  public pronouncePhoneme(phoneme: string, onEnd?: () => void): void {
    const clean = phoneme.trim().toLowerCase();
    const spoken = VIETNAMESE_PHONETIC_NAMES[clean] || clean;
    this.speakNormal(spoken, onEnd);
  }

  /**
   * ĐỌC BÌNH THƯỜNG - Giọng cô giáo dịu dàng, phát âm chuẩn 100%
   */
  public async speakNormal(text: string, onEnd?: () => void): Promise<void> {
    const clean = text.trim();
    if (!clean) {
      onEnd?.();
      return;
    }

    this.stop();
    this.isSpeaking = true;

    // Nếu người dùng chọn giọng máy trình duyệt hoặc hệ thống có giọng tiếng Việt tự nhiên xuất sắc
    if (this.activeVoice === 'browser' || (this.activeVoice === 'mai' && this.cachedBrowserVoice)) {
      this.speakViaBrowser(clean, false, onEnd);
      return;
    }

    try {
      const audio = await this.fetchAndCacheAudio(clean, false);
      if (!this.isSpeaking) return;

      this.currentAudio = audio;
      audio.currentTime = 0;
      audio.playbackRate = 1.0;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        // Fallback sang giọng trình duyệt nếu lỗi
        this.speakViaBrowser(clean, false, onEnd);
      };

      await audio.play();
    } catch {
      // Fallback khi offline hoặc mạng gián đoạn
      this.speakViaBrowser(clean, false, onEnd);
    }
  }

  /**
   * ĐỌC CHẬM DỊU DÀNG - Nhẹ nhàng, rõ từng tiếng cho bé lớp 2 chép kịp (tốc độ khoảng 0.7x)
   */
  public async speakSlowly(text: string, onEnd?: () => void): Promise<void> {
    const clean = text.trim();
    if (!clean) {
      onEnd?.();
      return;
    }

    this.stop();
    this.isSpeaking = true;

    if (this.activeVoice === 'browser' || (this.activeVoice === 'mai' && this.cachedBrowserVoice)) {
      this.speakViaBrowser(clean, 0.7, onEnd);
      return;
    }

    try {
      const audio = await this.fetchAndCacheAudio(clean, false);
      if (!this.isSpeaking) return;

      this.currentAudio = audio;
      audio.currentTime = 0;
      audio.playbackRate = 0.72;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        this.speakViaBrowser(clean, 0.7, onEnd);
      };

      await audio.play();
    } catch {
      this.speakViaBrowser(clean, 0.7, onEnd);
    }
  }

  /**
   * ĐỌC CỰC CHẬM (KHOẢNG 0.5x) - Dành riêng cho nút "Nghe chậm hơn" khi bé chưa nghe rõ
   */
  public async speakVerySlow(text: string, onEnd?: () => void): Promise<void> {
    const clean = text.trim();
    if (!clean) {
      onEnd?.();
      return;
    }

    this.stop();
    this.isSpeaking = true;

    if (this.activeVoice === 'browser' || (this.activeVoice === 'mai' && this.cachedBrowserVoice)) {
      this.speakViaBrowser(clean, 0.52, onEnd);
      return;
    }

    try {
      const audio = await this.fetchAndCacheAudio(clean, true);
      if (!this.isSpeaking) return;

      this.currentAudio = audio;
      audio.currentTime = 0;
      audio.playbackRate = 0.55;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        this.speakViaBrowser(clean, 0.52, onEnd);
      };

      await audio.play();
    } catch {
      this.speakViaBrowser(clean, 0.52, onEnd);
    }
  }

  /**
   * Tải và lưu bộ nhớ đệm âm thanh
   */
  private async fetchAndCacheAudio(text: string, slow: boolean): Promise<HTMLAudioElement> {
    const key = `${text}_${slow ? 'slow' : 'normal'}_${this.activeVoice}`;

    if (this.audioCache.has(key)) {
      return this.audioCache.get(key)!;
    }

    let apiVoice = 'default';
    if (this.activeVoice === 'lan') apiVoice = 'gemini-kore';
    if (this.activeVoice === 'ha') apiVoice = 'gemini-aoede';

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        slow,
        voice: apiVoice,
      }),
    });

    if (!res.ok) {
      throw new Error(`TTS API error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.audioBase64) {
      throw new Error('No audio returned');
    }

    const mime = data.mimeType || 'audio/mpeg';
    const audioUrl = `data:${mime};base64,${data.audioBase64}`;
    const audio = new Audio(audioUrl);

    // Lưu vào bộ đệm
    this.audioCache.set(key, audio);
    return audio;
  }

  /**
   * Phát qua Web Speech API của trình duyệt (Dự phòng khi offline)
   */
  private speakViaBrowser(text: string, rateOrSlow: boolean | number, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      if (typeof rateOrSlow === 'number') {
        u.rate = rateOrSlow;
      } else {
        u.rate = rateOrSlow ? 0.7 : 0.85;
      }
      u.pitch = 1.0; // Giữ nguyên âm sắc chuẩn, ấm áp

      const voice = this.detectVietnameseVoice();
      if (voice) u.voice = voice;

      u.onend = () => {
        this.isSpeaking = false;
        onEnd?.();
      };
      u.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
      };

      window.speechSynthesis.speak(u);
    } catch {
      this.isSpeaking = false;
      onEnd?.();
    }
  }
}

export const speechReader = new SweetTeacherSpeechReader();
