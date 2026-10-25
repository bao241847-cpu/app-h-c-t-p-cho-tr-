import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Plus,
  BookOpen,
  Sparkles,
  Save,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BookItem, BookSection } from '../types/spelling';
import { saveCustomBook } from '../data/bookShelfData';
import { sfx } from '../utils/audioSpeech';

interface TextbookReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookItem;
  onSaveBook: (updatedBook: BookItem) => void;
}

export const TextbookReviewModal: React.FC<TextbookReviewModalProps> = ({
  isOpen,
  onClose,
  book,
  onSaveBook,
}) => {
  const [editingBookTitle, setEditingBookTitle] = useState(book.title);
  const [sections, setSections] = useState<BookSection[]>(() => {
    return (book.sections || []).map((sec, idx) => ({
      ...sec,
      isPublished: sec.isPublished !== undefined ? sec.isPublished : true,
    }));
  });

  const [expandedSectionId, setExpandedSectionId] = useState<string>(
    book.sections?.[0]?.id || ''
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleTogglePublish = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isPublished: !s.isPublished } : s))
    );
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateSectionFullText = (sectionId: string, newText: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        // Tự động phân tách lại đoạn văn khi giáo viên sửa văn bản
        const paras = newText.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
        // Tách câu
        const sents = newText.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
        // Tách cụm 3-5 chữ
        const words = newText.split(/\s+/).filter(Boolean);
        const chunks: string[] = [];
        for (let i = 0; i < words.length; i += 4) {
          chunks.push(words.slice(i, i + 4).join(' '));
        }

        return {
          ...s,
          fullText: newText,
          paragraphs: paras.length > 0 ? paras : [newText],
          sentences: sents.length > 0 ? sents : [newText],
          chunks: chunks.length > 0 ? chunks : [newText],
        };
      })
    );
  };

  const handleDeleteParagraph = (sectionId: string, paraIdx: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const curParas = s.paragraphs || [s.fullText || ''];
        const updatedParas = curParas.filter((_, idx) => idx !== paraIdx);
        const newFullText = updatedParas.join('\n\n');
        return {
          ...s,
          paragraphs: updatedParas,
          fullText: newFullText,
        };
      })
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      alert('Sách cần có ít nhất 1 bài học!');
      return;
    }
    if (confirm('Cô/thầy có chắc muốn xóa bài đọc này không?')) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    }
  };

  const handlePublishAll = () => {
    const updatedBook: BookItem = {
      ...book,
      title: editingBookTitle.trim() || book.title,
      sections: sections.map((s) => ({ ...s, isPublished: true })),
    };
    saveCustomBook(updatedBook);
    onSaveBook(updatedBook);
    sfx.playSuccess();
    setSaveSuccessMsg('Đã phê duyệt và xuất bản toàn bộ bài đọc cho học sinh!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleSaveDraft = () => {
    const updatedBook: BookItem = {
      ...book,
      title: editingBookTitle.trim() || book.title,
      sections,
    };
    saveCustomBook(updatedBook);
    onSaveBook(updatedBook);
    sfx.playSuccess();
    setSaveSuccessMsg('Đã lưu các chỉnh sửa của cô giáo thành công!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-amber-300 relative text-gray-800">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🔍
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Duyệt & Chỉnh Sửa Nội Dung Sách Giáo Khoa
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Kiểm tra lại câu chữ, sửa sai dấu, xóa đoạn thừa trước khi xuất bản cho bé luyện chép
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Thông báo hướng dẫn giáo viên */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 sm:p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Quy tắc xuất bản bài đọc cho học sinh:</p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Gemini AI đã tự động phân tách sách thành các bài, đoạn văn và cụm từ. Cô giáo vui lòng rà soát lại chính tả, xóa các đoạn không cần luyện.
              <span className="font-bold text-amber-950"> Bài nào có trạng thái "Chưa xuất bản" thì học sinh sẽ hoàn toàn không thấy!</span>
            </p>
          </div>
        </div>

        {/* Trạng thái thành công */}
        {saveSuccessMsg && (
          <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Sửa tên cuốn sách */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1.5">
              Tên Cuốn Sách / Tài Liệu:
            </label>
            <input
              type="text"
              value={editingBookTitle}
              onChange={(e) => setEditingBookTitle(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-amber-500 rounded-2xl font-bold text-sm sm:text-base text-gray-800"
            />
          </div>

          {/* Danh sách các bài đọc đã tách */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Danh Sách Bài Đọc ({sections.length} bài)
              </h3>
              <span className="text-xs text-gray-500">
                {sections.filter((s) => s.isPublished).length}/{sections.length} bài đã xuất bản
              </span>
            </div>

            {sections.map((section, secIdx) => {
              const isExpanded = expandedSectionId === section.id;
              const isPublished = section.isPublished !== false;

              return (
                <div
                  key={section.id}
                  className={`rounded-2xl border-2 transition-all ${
                    isPublished
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'bg-gray-50 border-gray-300 opacity-90'
                  }`}
                >
                  {/* Thanh tóm tắt bài */}
                  <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                      <span className="text-xl">{section.emoji || '📖'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            {section.sectionNumber || `Bài ${secIdx + 1}`}
                          </span>
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                              isPublished
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-gray-200 text-gray-600 border border-gray-300'
                            }`}
                          >
                            {isPublished ? '✓ Đã xuất bản cho bé' : '🔒 Bản nháp (Đang ẩn)'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                          className="font-black text-sm sm:text-base text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-hidden w-full mt-1"
                        />
                      </div>
                    </div>

                    {/* Nút thao tác nhanh bài */}
                    <div className="flex items-center gap-2">
                      {/* Bật / Tắt Xuất bản */}
                      <button
                        onClick={() => handleTogglePublish(section.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isPublished
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                        title={isPublished ? 'Bấm để ẩn bài này với học sinh' : 'Bấm để xuất bản cho học sinh'}
                      >
                        {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isPublished ? 'Ẩn với bé' : 'Xuất bản bài này'}</span>
                      </button>

                      {/* Nút Mở rộng / Thu gọn chi tiết */}
                      <button
                        onClick={() =>
                          setExpandedSectionId(isExpanded ? '' : section.id)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                        title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      {/* Nút Xóa bài */}
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-colors"
                        title="Xóa bài này khỏi sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết nội dung khi mở rộng */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-100 bg-amber-50/40 space-y-4 animate-in slide-in-from-top-2">
                      {/* Sửa toàn văn bản */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Nội dung toàn bài (Cô có thể sửa chữ, sửa dấu trực tiếp tại đây):
                        </label>
                        <textarea
                          rows={4}
                          value={section.fullText || section.content || ''}
                          onChange={(e) =>
                            handleUpdateSectionFullText(section.id, e.target.value)
                          }
                          className="w-full p-3 border-2 border-gray-300 focus:border-amber-500 rounded-2xl text-xs sm:text-sm font-medium text-gray-800 leading-relaxed bg-white"
                        />
                      </div>

                      {/* Các đoạn văn con (có thể xóa đoạn thừa) */}
                      {section.paragraphs && section.paragraphs.length > 1 && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            Các đoạn văn trong bài ({section.paragraphs.length} đoạn):
                          </label>
                          <div className="space-y-2">
                            {section.paragraphs.map((para: string, pIdx: number) => (
                              <div
                                key={pIdx}
                                className="bg-white p-3 rounded-xl border border-gray-200 flex items-start justify-between gap-3 text-xs"
                              >
                                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                                  Đoạn {pIdx + 1}
                                </span>
                                <p className="text-gray-700 flex-1 leading-relaxed">{para}</p>
                                <button
                                  onClick={() => handleDeleteParagraph(section.id, pIdx)}
                                  className="text-gray-400 hover:text-rose-600 p-1 shrink-0"
                                  title="Xóa đoạn này nếu không cần bé luyện"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cụm từ 3-5 chữ để đọc chính tả */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">
                          Các cụm từ 3-5 chữ AI đã chia để đọc chính tả:
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-gray-200">
                          {(section.chunks || []).map((chk: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className="px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900"
                            >
                              {chk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Học sinh sẽ chỉ thấy những bài đọc đã được cô giáo bấm xuất bản.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Tạm Thời</span>
            </button>
            <button
              onClick={handlePublishAll}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>✓ Phê Duyệt & Xuất Bản Cho Bé</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
