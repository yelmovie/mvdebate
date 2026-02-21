import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { ArrowLeft, Send, Bell, Pin, Trash2, Plus, ChevronRight, X } from 'lucide-react';
import { useAlert } from './AlertProvider';

interface AnnouncementFormProps {
  onBack: () => void;
  onSuccess: () => void;
  demoMode?: boolean;
  classes: any[];
}

interface Announcement {
  id: string;
  teacherName: string;
  classId: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

type PageMode = 'list' | 'write';

export default function AnnouncementForm({ onBack, onSuccess, demoMode = false, classes }: AnnouncementFormProps) {
  const { showAlert } = useAlert();
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // 작성 폼 상태
  const [selectedClass, setSelectedClass] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setListLoading(true);
    try {
      if (demoMode) {
        setAnnouncements([
          {
            id: 'ann-1',
            teacherName: '선생님',
            classId: 'class-1',
            title: '📢 이번 주 토론 주제 안내',
            content: '이번 주 토론 주제는 "AI 사용 허용"입니다. 미리 준비해 오세요!\n\n준비물: 본인의 의견 3가지 이상',
            isPinned: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'ann-2',
            teacherName: '선생님',
            classId: null,
            title: '✅ 토론 평가 기준 변경 안내',
            content: '다음 달부터 토론 평가 기준이 변경됩니다.\n\n1. 논리성 (40점)\n2. 근거 제시 (30점)\n3. 반박 능력 (30점)',
            isPinned: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } else {
        const data = await apiCall('/teacher/announcements');
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setListLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (demoMode) {
        const newAnn: Announcement = {
          id: `ann-${Date.now()}`,
          teacherName: '선생님',
          classId: selectedClass === 'all' ? null : selectedClass,
          title,
          content,
          isPinned,
          createdAt: new Date().toISOString()
        };
        setAnnouncements(prev => [newAnn, ...prev]);
        showAlert('공지사항이 등록되었습니다!', 'success');
        setPageMode('list');
        resetForm();
        setLoading(false);
        return;
      }

      await apiCall('/announcements', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass === 'all' ? null : selectedClass,
          title,
          content,
          isPinned,
        }),
      });

      showAlert('공지사항이 등록되었습니다!', 'success');
      resetForm();
      setPageMode('list');
      loadAnnouncements();
    } catch (error: any) {
      showAlert(error.message || '공지사항 등록에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(ann: Announcement) {
    if (!window.confirm(`"${ann.title}" 공지사항을 삭제하시겠습니까?`)) return;

    try {
      if (demoMode) {
        setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
        if (selectedAnnouncement?.id === ann.id) setSelectedAnnouncement(null);
        showAlert('공지사항이 삭제되었습니다.', 'success');
        return;
      }
      await apiCall(`/announcements/${ann.id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
      if (selectedAnnouncement?.id === ann.id) setSelectedAnnouncement(null);
      showAlert('공지사항이 삭제되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '삭제에 실패했습니다.', 'error');
    }
  }

  function resetForm() {
    setSelectedClass('all');
    setTitle('');
    setContent('');
    setIsPinned(false);
  }

  function getClassName(classId: string | null) {
    if (!classId) return '전체 반';
    const cls = classes.find(c => c.id === classId);
    return cls?.name || '알 수 없는 반';
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-accent"></div>

      {/* 상세 보기 모달 */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-primary px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedAnnouncement.isPinned
                  ? <Pin className="w-5 h-5 text-white" />
                  : <Bell className="w-5 h-5 text-white" />
                }
                <div>
                  <p className="text-white/70 text-xs">
                    {selectedAnnouncement.isPinned ? '📌 중요 공지' : '📢 공지사항'}
                  </p>
                  <p className="text-white text-sm font-bold">{getClassName(selectedAnnouncement.classId)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)}>
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedAnnouncement.title}</h3>
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {new Date(selectedAnnouncement.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <button
                  onClick={() => handleDelete(selectedAnnouncement)}
                  className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          대시보드로
        </button>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">📢 공지사항 관리</h1>
            <p className="text-text-secondary mt-1">학생들에게 전달할 공지사항을 작성하고 관리하세요</p>
          </div>
          {pageMode === 'list' && (
            <button
              onClick={() => { resetForm(); setPageMode('write'); }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-2xl shadow-medium hover:shadow-strong transition-shadow font-bold"
            >
              <Plus className="w-5 h-5" />
              새 공지 작성
            </button>
          )}
        </div>

        {pageMode === 'list' ? (
          /* ===== 공지사항 목록 ===== */
          <div className="space-y-4">
            {listLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-text-secondary">불러오는 중...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-border p-16 text-center">
                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">아직 공지사항이 없어요</h3>
                <p className="text-text-secondary text-sm mb-6">학생들에게 첫 번째 공지사항을 작성해보세요!</p>
                <button
                  onClick={() => setPageMode('write')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-2xl font-bold shadow-medium"
                >
                  <Plus className="w-5 h-5" />
                  새 공지 작성하기
                </button>
              </div>
            ) : (
              announcements.map(ann => {
                const cls = getClassName(ann.classId);
                return (
                  <div
                    key={ann.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border transition-all hover:shadow-medium cursor-pointer ${
                      ann.isPinned ? 'border-primary/30 bg-primary/2' : 'border-border'
                    }`}
                    onClick={() => setSelectedAnnouncement(ann)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            ann.isPinned ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            {ann.isPinned
                              ? <Pin className="w-5 h-5 text-primary" />
                              : <Bell className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {ann.isPinned && (
                                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">📌 고정</span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{cls}</span>
                            </div>
                            <h3 className="text-base font-bold text-text-primary truncate">{ann.title}</h3>
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{ann.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(ann); }}
                            className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3 pl-13">
                        {new Date(ann.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ===== 공지사항 작성 폼 ===== */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-border p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">새 공지사항 작성</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 대상 학급 */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">대상 학급</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white text-text-primary"
                >
                  <option value="all">전체 반 (모든 학생)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white text-text-primary"
                  required
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지 내용을 입력하세요"
                  rows={8}
                  className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white text-text-primary resize-none"
                  required
                />
              </div>

              {/* 고정 옵션 */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="pinned" className="flex items-center gap-2 text-sm font-semibold text-text-primary cursor-pointer">
                  <Pin className="w-4 h-4 text-primary" />
                  상단 고정 (중요 공지 - 학생 화면에서 먼저 표시됩니다)
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setPageMode('list'); resetForm(); }}
                  className="flex-1 py-3.5 border border-border text-text-secondary rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-opacity font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      공지 등록하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
