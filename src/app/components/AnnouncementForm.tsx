import React, { useState } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Send } from 'lucide-react';
import { useAlert } from './AlertProvider';

interface AnnouncementFormProps {
  onBack: () => void;
  onSuccess: () => void;
  demoMode?: boolean;
  classes: any[];
}

export default function AnnouncementForm({ onBack, onSuccess, demoMode = false, classes }: AnnouncementFormProps) {
  const { showAlert } = useAlert();
  const [selectedClass, setSelectedClass] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (demoMode) {
        setTimeout(() => {
          showAlert('공지사항이 등록되었습니다!');
          onSuccess();
          setLoading(false);
        }, 500);
        return;
      }

      await apiCall('/announcements', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass === 'all' ? null : selectedClass,
          title,
          content,
          isPinned
        })
      });

      showAlert('공지사항이 등록되었습니다!');
      onSuccess();
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          돌아가기
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">📢 새 공지사항 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 학급
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                <option value="all">전체 반 (모든 주제)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지 제목을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지 내용을 입력하세요"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            {/* Pin Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="pinned" className="text-sm font-medium text-gray-700">
                상단 고정 (중요 공지)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? '등록중...' : (
                  <>
                    <Send className="w-5 h-5" />
                    작성 완료
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
