import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Star,
  RefreshCw,
  Video,
  X,
  Volume2,
} from 'lucide-react';
import { CameraCheckResult } from '../types/spelling';
import { speechReader, sfx } from '../utils/audioSpeech';
import { MascotMessage } from './MascotMessage';

interface CameraCheckerProps {
  expectedText: string;
  onSaveErrorsToNotebook: (
    errors: { wrong: string; correct: string; hint: string }[]
  ) => void;
  onAddStar: (count: number) => void;
  soundEnabled: boolean;
  gradeLevel?: number;
}

export const CameraChecker: React.FC<CameraCheckerProps> = ({
  expectedText,
  onSaveErrorsToNotebook,
  onAddStar,
  soundEnabled,
  gradeLevel = 1,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CameraCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [sampleText, setSampleText] = useState<string>(expectedText || '');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (expectedText) {
      setSampleText(expectedText);
    }
  }, [expectedText]);

  // Dọn dẹp stream khi unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMsg(
        'Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt hoặc sử dụng nút "Tải ảnh từ máy".'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      stopCamera();
      setAnalysisResult(null);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const analyzeHandwriting = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setErrorMsg('');
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/check-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          expectedText: sampleText.trim(),
          gradeLevel,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);

        // Phát âm thanh và cộng sao
        if (json.data.errors.length === 0) {
          if (soundEnabled) sfx.playFanfare();
          onAddStar(json.data.stars || 5);
        } else {
          if (soundEnabled) sfx.playSuccess();
          onAddStar(Math.max(1, json.data.stars || 2));
          // Tự động lưu lỗi vào sổ tay
          const errorsToSave = json.data.errors.map((e: any) => ({
            wrong: e.wrongWord,
            correct: e.correctWord,
            hint: e.ruleHint,
          }));
          onSaveErrorsToNotebook(errorsToSave);
        }
      } else {
        setErrorMsg(json.error || 'Cô giáo chưa đọc rõ bài viết. Bé chụp lại cho rõ nét và đủ ánh sáng nhé!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ chấm bài: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setErrorMsg('');
    stopCamera();
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-lg shadow-amber-900/5 border-2 border-amber-200">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-amber-100">
        <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm">
          📸
        </span>
        <div>
          <h2 className="font-extrabold text-slate-800 text-base sm:text-lg">
            Chế độ 4: Soát Lỗi Vở Viết Bằng Camera
          </h2>
          <p className="text-xs text-slate-500">
            Chụp trang vở ô ly để Cô giáo AI đối chiếu bài mẫu, tìm từ sai và nhận xét nét chữ
          </p>
        </div>
      </div>

      {/* Target sample passage editor */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
        <label className="block text-xs font-bold text-amber-900 mb-1.5 flex items-center justify-between">
          <span>📝 Bài mẫu cần đối chiếu (chính tả lớp 1):</span>
          <span className="text-[11px] font-normal text-amber-700">
            (Có thể sửa hoặc dán bài khác của cô giáo trên lớp)
          </span>
        </label>
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          rows={2}
          placeholder="Nhập hoặc để bài mẫu chính tả vào đây..."
          className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-300"
        />
      </div>

      {/* Camera and Photo Capture Zone */}
      <div className="bg-notebook-grid notebook-margin rounded-3xl p-5 sm:p-8 border-2 border-amber-300 shadow-inner mb-6 text-center">
        {/* Live Camera View */}
        {isCameraActive ? (
          <div className="max-w-md mx-auto relative rounded-2xl overflow-hidden border-3 border-amber-400 bg-black mb-4">
            <video ref={videoRef} playsInline className="w-full h-auto aspect-4/3 object-cover" />
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Chụp Ảnh Vở ✨</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white"
                title="Đóng camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : imagePreview ? (
          /* Preview captured photo */
          <div className="max-w-md mx-auto mb-4">
            <div className="relative rounded-2xl overflow-hidden border-3 border-emerald-400 shadow-md">
              <img
                src={imagePreview}
                alt="Ảnh vở của bé"
                className="w-full h-auto max-h-80 object-contain bg-slate-900"
              />
              <button
                onClick={resetAll}
                className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white text-xs font-bold"
                title="Chụp lại ảnh khác"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-2">
              ✔ Đã sẵn sàng ảnh vở viết tay của bé
            </div>
          </div>
        ) : (
          /* Initial capture prompt */
          <div className="py-8 max-w-sm mx-auto">
            <div className="text-6xl mb-3 select-none">📷</div>
            <h3 className="font-extrabold text-slate-800 text-base mb-1">
              Bé đưa trang vở ô ly vào trước camera nhé!
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Hãy chụp ngay ngắn, đủ ánh sáng để cô giáo AI nhìn rõ từng con chữ và dấu thanh nha.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Bật Camera Chụp Ngay</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-extrabold text-sm border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Tải Ảnh Từ Máy</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Start Analysis Button */}
        {imagePreview && !analysisResult && (
          <div className="mt-4">
            <button
              onClick={analyzeHandwriting}
              disabled={isAnalyzing}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-base shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            >
              <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Cô giáo AI đang xem bài...' : 'Chấm Bài & Tìm Lỗi Sai ✨'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold mb-6 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Teacher Grading & Psychological Results Card */}
      {analysisResult && (
        <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-3xl p-6 sm:p-8 border-3 border-amber-300 shadow-md animate-pop mb-6">
          {/* Header Score & Stars */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {analysisResult.score}/10
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kết quả bài chấm của cô giáo
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < (analysisResult.stars || 4)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-extrabold text-amber-700 ml-1">
                    +{analysisResult.stars || 4} sao thưởng
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chấm Bài Mới</span>
            </button>
          </div>

          {/* Teacher Warm Feedback */}
          <div className="my-5 p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">👩‍🏫</span>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-1">
                  Lời cô giáo nhận xét bài của bé:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  "{analysisResult.teacherFeedback}"
                </p>
                {analysisResult.neatnessComment && (
                  <div className="mt-2 text-xs text-sky-800 font-semibold bg-sky-50 p-2 rounded-lg">
                    ✍️ <strong>Về nét chữ:</strong> {analysisResult.neatnessComment}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcribed text vs sample */}
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
            <div className="font-bold text-slate-600 mb-1">📖 Chữ bé đã viết trong vở:</div>
            <div className="font-bold text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200">
              "{analysisResult.transcribedText}"
            </div>
          </div>

          {/* Error Detection Table & Advice */}
          <div>
            <h4 className="font-black text-slate-800 text-sm sm:text-base mb-3 flex items-center gap-2">
              <span>🔍</span>
              <span>
                {analysisResult.errors && analysisResult.errors.length > 0
                  ? `Phát hiện ${analysisResult.errors.length} chỗ cần chú ý sửa:`
                  : '🎉 Tuyệt vời! Không có lỗi chính tả nào!'}
              </span>
            </h4>

            {analysisResult.errors && analysisResult.errors.length > 0 ? (
              <div className="space-y-3">
                {analysisResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-800 font-black line-through">
                          {err.wrongWord}
                        </span>
                        <span>➡️</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 font-black">
                          {err.correctWord}
                        </span>
                        {err.errorType && (
                          <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-rose-200 font-bold">
                            {err.errorType}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        💡 <strong>Mẹo của cô:</strong> {err.ruleHint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          speechReader.speakSlowly(
                            `Bé chú ý nhé: từ đúng phải là ${err.correctWord}. ${err.ruleHint}`
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                        title="Nghe cô giáo hướng dẫn cách sửa"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Nghe cô sửa</span>
                      </button>

                      <div className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Đã lưu sổ tay</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Bé đã viết chuẩn xác từng từ, từng dấu câu. Cô khen bé rất nhiều!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mascot encouragement */}
      <MascotMessage
        message="Mỗi lần viết bài xong, bé nhớ chụp ảnh lại để cô cùng bé xem lại nét chữ. Luyện tập đều đặn mỗi ngày sẽ giúp bé viết nhanh và không bao giờ viết sai nữa nhé!"
        mood="happy"
      />
    </div>
  );
};
