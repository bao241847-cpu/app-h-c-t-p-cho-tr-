import React, { useState, useEffect } from 'react';
import {
  Headphones,
  BookOpen,
  Camera,
  Star,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Header } from './components/Header';
import { StudentPracticeScreen } from './components/StudentPracticeScreen';
import { StudentDifficultNotebook } from './components/StudentDifficultNotebook';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { CameraChecker } from './components/CameraChecker';
import { TextbookDictation } from './components/TextbookDictation';
import { SpellingRulesModal } from './components/SpellingRulesModal';
import {
  subscribeAuthState,
  logoutTeacher,
  AUTHORIZED_TEACHER_EMAIL,
} from './firebase/config';
import { getStudentMistakes, saveStudentMistake } from './firebase/spellingDataService';

type ActiveTab = 'practice_lop2' | 'notebook' | 'camera_checker' | 'textbook';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice_lop2');

  // Trạng thái xác thực Giáo Viên
  const [isTeacher, setIsTeacher] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lop2_teacher_preview_auth') === 'true';
    }
    return false;
  });
  const [teacherEmail, setTeacherEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('lop2_teacher_preview_auth') === 'true') {
      return AUTHORIZED_TEACHER_EMAIL;
    }
    return null;
  });

  // Chế độ "Xem như học sinh" dành cho giáo viên kiểm tra giao diện học sinh
  const [isPreviewingAsStudent, setIsPreviewingAsStudent] = useState<boolean>(false);

  // Modals
  const [isTeacherAdminOpen, setIsTeacherAdminOpen] = useState<boolean>(false);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  // Thưởng & tiến độ học sinh
  const [stars, setStars] = useState<number>(() => {
    try {
      const s = localStorage.getItem('stars_lop2');
      if (s) return parseInt(s, 10);
    } catch {}
    return 15;
  });
  const [streak, setStreak] = useState<number>(() => {
    try {
      const st = localStorage.getItem('streak_lop2');
      if (st) return parseInt(st, 10);
    } catch {}
    return 2;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [cameraExpectedText, setCameraExpectedText] = useState<string>('');

  // Sổ từ khó count
  const [mistakesCount, setMistakesCount] = useState<number>(() => {
    return getStudentMistakes().filter((m) => !m.mastered).length;
  });

  // Lắng nghe trạng thái đăng nhập Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user, authorizedAsTeacher) => {
      if (authorizedAsTeacher && user) {
        setIsTeacher(true);
        setTeacherEmail(user.email || AUTHORIZED_TEACHER_EMAIL);
      } else {
        const previewAuth = localStorage.getItem('lop2_teacher_preview_auth') === 'true';
        if (previewAuth) {
          setIsTeacher(true);
          setTeacherEmail(AUTHORIZED_TEACHER_EMAIL);
        } else {
          setIsTeacher(false);
          setTeacherEmail(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Cập nhật số sao vào LocalStorage
  useEffect(() => {
    localStorage.setItem('stars_lop2', stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem('streak_lop2', streak.toString());
  }, [streak]);

  const handleAddStars = (amount: number) => {
    setStars((prev) => prev + amount);
  };

  const handleIncrementStreak = () => {
    setStreak((prev) => prev + 1);
  };

  const handleTeacherLogout = () => {
    logoutTeacher();
    localStorage.removeItem('lop2_teacher_preview_auth');
    setIsTeacher(false);
    setTeacherEmail(null);
    setIsPreviewingAsStudent(false);
  };

  const handleCopyStudentLink = () => {
    const studentUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(studentUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const refreshMistakesCount = () => {
    setMistakesCount(getStudentMistakes().filter((m) => !m.mastered).length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-yellow-50/60 text-gray-800 pb-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5">
        {/* HEADER ỨNG DỤNG (HỖ TRỢ 2 VAI TRÒ GIÁO VIÊN & HỌC SINH) */}
        <Header
          stars={stars}
          streak={streak}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenNotebook={() => {
            setIsNotebookOpen(true);
            refreshMistakesCount();
          }}
          mistakesCount={mistakesCount}
          isTeacher={isTeacher && !isPreviewingAsStudent}
          teacherEmail={teacherEmail}
          isPreviewingAsStudent={isPreviewingAsStudent}
          onTogglePreviewAsStudent={() => setIsPreviewingAsStudent(!isPreviewingAsStudent)}
          onOpenTeacherAdmin={() => setIsTeacherAdminOpen(true)}
          onOpenTeacherLogin={() => setIsTeacherLoginOpen(true)}
          onTeacherLogout={handleTeacherLogout}
          onCopyStudentLink={handleCopyStudentLink}
          copySuccess={copySuccess}
        />

        {/* CÁC TAB CHỨC NĂNG HỌC TẬP DÀNH CHO HỌC SINH LỚP 2 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('practice_lop2')}
            className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border-2 ${
              activeTab === 'practice_lop2'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                : 'bg-white hover:bg-amber-50 text-amber-950 border-amber-200 shadow-xs'
            }`}
          >
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100" />
            <span>🎧 Luyện Nghe - Viết Lớp 2</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notebook');
              setIsNotebookOpen(true);
            }}
            className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border-2 ${
              activeTab === 'notebook'
                ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-102'
                : 'bg-white hover:bg-sky-50 text-sky-950 border-sky-200 shadow-xs'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
            <span>📖 Sổ Từ Khó Của Bé</span>
            {mistakesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {mistakesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('camera_checker')}
            className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border-2 ${
              activeTab === 'camera_checker'
                ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
                : 'bg-white hover:bg-purple-50 text-purple-950 border-purple-200 shadow-xs'
            }`}
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span>🔍 Dò Bài Qua Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('textbook')}
            className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 border-2 ${
              activeTab === 'textbook'
                ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-102'
                : 'bg-white hover:bg-teal-50 text-teal-950 border-teal-200 shadow-xs'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />
            <span>📚 Sách Giáo Khoa – Nghe Đọc Viết Bài</span>
          </button>
        </div>

        {/* NỘI DUNG CHÍNH THEO TAB ĐANG CHỌN */}
        <main>
          {activeTab === 'practice_lop2' && (
            <StudentPracticeScreen
              stars={stars}
              onAddStars={handleAddStars}
              streak={streak}
              onIncrementStreak={handleIncrementStreak}
              onOpenNotebook={() => {
                setIsNotebookOpen(true);
                refreshMistakesCount();
              }}
            />
          )}

          {activeTab === 'notebook' && (
            <StudentPracticeScreen
              stars={stars}
              onAddStars={handleAddStars}
              streak={streak}
              onIncrementStreak={handleIncrementStreak}
              onOpenNotebook={() => setIsNotebookOpen(true)}
            />
          )}

          {activeTab === 'camera_checker' && (
            <div className="max-w-4xl mx-auto">
              <CameraChecker
                expectedText={cameraExpectedText || 'Cây tre xanh mọc quanh bờ ao làng quê.'}
                onSaveErrorsToNotebook={(errs) => {
                  errs.forEach((err) => {
                    saveStudentMistake(err.correct, 'khac', err.hint, false);
                  });
                  refreshMistakesCount();
                }}
                onAddStar={(count) => handleAddStars(count)}
                soundEnabled={soundEnabled}
                gradeLevel={2}
              />
            </div>
          )}

          {activeTab === 'textbook' && (
            <div className="max-w-5xl mx-auto">
              <TextbookDictation
                onOpenCheckCamera={(txt) => {
                  setCameraExpectedText(txt);
                  setActiveTab('camera_checker');
                }}
                onAddStar={(count) => handleAddStars(count)}
                soundEnabled={soundEnabled}
                userRole={isTeacher && !isPreviewingAsStudent ? 'owner' : 'student'}
                currentGrade={2}
                onCopyStudentLink={handleCopyStudentLink}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: BẢNG QUẢN TRỊ GIÁO VIÊN */}
      <TeacherAdminModal
        isOpen={isTeacherAdminOpen}
        onClose={() => setIsTeacherAdminOpen(false)}
        onViewAsStudent={() => {
          setIsTeacherAdminOpen(false);
          setIsPreviewingAsStudent(true);
        }}
        onRefreshCurriculum={() => {
          // Làm mới trang sau khi giáo viên cập nhật bài học
        }}
      />

      {/* MODAL 2: ĐĂNG NHẬP GIÁO VIÊN */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        isTeacher={isTeacher}
        userEmail={teacherEmail}
        onLoginSuccess={() => {
          setIsTeacher(true);
          setTeacherEmail(AUTHORIZED_TEACHER_EMAIL);
          setIsTeacherAdminOpen(true);
        }}
        onLogout={handleTeacherLogout}
      />

      {/* MODAL 3: SỔ TỪ KHÓ CỦA BÉ */}
      <StudentDifficultNotebook
        isOpen={isNotebookOpen}
        onClose={() => {
          setIsNotebookOpen(false);
          refreshMistakesCount();
        }}
        onAddStars={handleAddStars}
      />

      {/* MODAL 4: TRA CỨU QUY TẮC CHÍNH TẢ */}
      <SpellingRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
}
