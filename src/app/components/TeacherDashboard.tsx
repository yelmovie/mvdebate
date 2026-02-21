import React, { useState, useEffect } from 'react';
import { apiCall } from '../../lib/api';
import {
  Plus, Users, MessageSquare, Trophy, Gift,
  TrendingUp, Bell, FileText, BarChart3, Sparkles,
  Settings, Download, HelpCircle, Trash2, ChevronRight, Copy
} from 'lucide-react';
import TopicManagement from './TopicManagement';
import CouponManager from './CouponManager';
import AnnouncementForm from './AnnouncementForm';
import DataDashboard from './DataDashboard';
import ReportPreview from './ReportPreview';
import StudentProgress from './StudentProgress';
import ClassSettings from './ClassSettings';
import DataExport from './DataExport';
import HelpSupport from './HelpSupport';
import { useAlert } from './AlertProvider';
import { AppUser } from '../App';

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────
interface Class {
  id: string;
  name: string;
  classCode: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  debatesCount: number;
  averageScore: number;
}

type ViewMode =
  | 'dashboard' | 'coupon' | 'announcement' | 'data'
  | 'report' | 'topics' | 'progress' | 'settings' | 'export' | 'help';

interface TeacherDashboardProps {
  user: AppUser;
  onLogout: () => void;
  demoMode?: boolean;
  themeMode?: 'light' | 'dark';
}

// ────────────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────────────
export default function TeacherDashboard({
  user, onLogout, demoMode = false, themeMode = 'light'
}: TeacherDashboardProps) {
  const { showAlert } = useAlert();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Class | null>(null);
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selectedClass) loadStudents(selectedClass.id); }, [selectedClass]);

  async function loadClasses() {
    try {
      if (demoMode) {
        const mock: Class[] = [
          { id: 'class-1', name: '3학년 1반', classCode: 'ABC12', createdAt: new Date().toISOString() },
          { id: 'class-2', name: '3학년 2반', classCode: 'DEF34', createdAt: new Date().toISOString() },
          { id: 'class-3', name: '4학년 1반', classCode: 'GHI56', createdAt: new Date().toISOString() },
        ];
        setClasses(mock);
        if (!selectedClass) setSelectedClass(mock[0]);
        return;
      }
      const data = await apiCall('/teacher/classes');
      setClasses(data.classes || []);
      if (data.classes?.length > 0 && !selectedClass) setSelectedClass(data.classes[0]);
    } catch (err: any) {
      if (err.message?.includes('인증')) {
        showAlert('로그인이 만료되었습니다. 다시 로그인해주세요.', 'error');
        setTimeout(onLogout, 2000);
      } else {
        showAlert('학급 목록을 불러오는 데 실패했습니다.', 'error');
      }
    }
  }

  async function loadStudents(classId: string) {
    try {
      if (demoMode) {
        setStudents([
          { id: 's1', name: '김철수', email: 'kim@student.com', debatesCount: 5, averageScore: 85 },
          { id: 's2', name: '이영희', email: 'lee@student.com', debatesCount: 3, averageScore: 92 },
          { id: 's3', name: '박민수', email: 'park@student.com', debatesCount: 7, averageScore: 78 },
          { id: 's4', name: '최수진', email: 'choi@student.com', debatesCount: 4, averageScore: 88 },
          { id: 's5', name: '정서연', email: 'jung@student.com', debatesCount: 6, averageScore: 95 },
          { id: 's6', name: '강동현', email: 'kang@student.com', debatesCount: 2, averageScore: 72 },
        ]);
        return;
      }
      const data = await apiCall(`/teacher/students?classId=${classId}`);
      setStudents(data.students || []);
    } catch {
      showAlert('학생 목록을 불러오는 데 실패했습니다.', 'error');
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!className.trim()) return;
    setLoading(true);
    try {
      const data = await apiCall('/teacher/classes', {
        method: 'POST',
        body: JSON.stringify({ name: className }),
      });
      setClasses((prev) => [...prev, data.class]);
      setSelectedClass(data.class);
      setClassName('');
      setShowCreateClass(false);
      showAlert('학급이 생성되었습니다!', 'success');
    } catch (err: any) {
      showAlert(err.message || '학급 생성에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !studentName.trim()) return;
    setLoading(true);
    try {
      await apiCall('/teacher/students', {
        method: 'POST',
        body: JSON.stringify({ classId: selectedClass.id, name: studentName, email: studentEmail }),
      });
      await loadStudents(selectedClass.id);
      setStudentName('');
      setStudentEmail('');
      setShowAddStudent(false);
      showAlert('학생이 추가되었습니다!', 'success');
    } catch (err: any) {
      showAlert(err.message || '학생 추가에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClass(cls: Class) {
    setLoading(true);
    try {
      await apiCall(`/teacher/classes/${cls.id}`, { method: 'DELETE' });
      setClasses((prev) => prev.filter((c) => c.id !== cls.id));
      if (selectedClass?.id === cls.id) setSelectedClass(null);
      setShowDeleteConfirm(null);
      showAlert('학급이 삭제되었습니다.', 'success');
    } catch (err: any) {
      showAlert(err.message || '학급 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function copyClassCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      showAlert('반코드가 복사되었습니다!', 'success');
    });
  }

  // ── 서브 화면 분기 ──────────────────────────────────────
  if (viewMode === 'topics') return <TopicManagement onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'coupon') return <CouponManager onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'announcement') return <AnnouncementForm onBack={() => setViewMode('dashboard')} demoMode={demoMode} selectedClass={selectedClass} />;
  if (viewMode === 'data') return <DataDashboard onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'report') return <ReportPreview onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'progress') return <StudentProgress user={user} onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'settings') return <ClassSettings onBack={() => setViewMode('dashboard')} demoMode={demoMode} selectedClass={selectedClass} />;
  if (viewMode === 'export') return <DataExport onBack={() => setViewMode('dashboard')} demoMode={demoMode} />;
  if (viewMode === 'help') return <HelpSupport onBack={() => setViewMode('dashboard')} />;

  // ── 메인 대시보드 ──────────────────────────────────────
  const navItems = [
    { id: 'topics', icon: <MessageSquare className="w-5 h-5" />, label: '토론 주제 관리' },
    { id: 'data', icon: <BarChart3 className="w-5 h-5" />, label: '데이터 대시보드' },
    { id: 'report', icon: <FileText className="w-5 h-5" />, label: '운영 결과 리포트' },
    { id: 'announcement', icon: <Bell className="w-5 h-5" />, label: '공지 보내기' },
    { id: 'coupon', icon: <Gift className="w-5 h-5" />, label: '쿠폰 관리' },
    { id: 'export', icon: <Download className="w-5 h-5" />, label: '데이터 내보내기' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: '학급 설정' },
    { id: 'help', icon: <HelpCircle className="w-5 h-5" />, label: '도움말 & 문의' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 인사 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            안녕하세요, {user.name} 선생님! 👋
          </h1>
          <p className="text-text-secondary">오늘도 학생들의 토론을 응원합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 학급 목록 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  내 학급
                </h2>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold hover:shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>

              {/* 학급 생성 폼 */}
              {showCreateClass && (
                <form onSubmit={handleCreateClass} className="mb-4 p-4 bg-background rounded-2xl">
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="학급명 (예: 3학년 1반)"
                    className="w-full px-4 py-3 border-2 border-border rounded-2xl text-sm focus:border-primary outline-none mb-3"
                    required
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="flex-1 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold disabled:opacity-50">
                      {loading ? '생성 중...' : '생성'}
                    </button>
                    <button type="button" onClick={() => setShowCreateClass(false)} className="flex-1 py-2 border-2 border-border rounded-full text-sm font-semibold">
                      취소
                    </button>
                  </div>
                </form>
              )}

              {classes.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-4">학급이 없습니다. 추가해주세요.</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                        selectedClass?.id === cls.id
                          ? 'bg-gradient-primary text-white shadow-soft'
                          : 'bg-background hover:bg-border'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${selectedClass?.id === cls.id ? 'text-white' : 'text-text-primary'}`}>
                          {cls.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                            selectedClass?.id === cls.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                          }`}>
                            {cls.classCode}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyClassCode(cls.classCode); }}
                            className={`${selectedClass?.id === cls.id ? 'text-white/70 hover:text-white' : 'text-text-secondary hover:text-primary'}`}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className={`w-4 h-4 ${selectedClass?.id === cls.id ? 'text-white' : 'text-text-secondary'}`} />
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(cls); }}
                          className={`p-1 rounded-full ${selectedClass?.id === cls.id ? 'hover:bg-white/20 text-white/70' : 'hover:bg-red-100 text-text-secondary hover:text-red-500'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 퀵 메뉴 */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                빠른 메뉴
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setViewMode(item.id as ViewMode)}
                    className="flex flex-col items-center gap-2 p-3 bg-background rounded-2xl hover:bg-primary/10 hover:text-primary transition-all group"
                  >
                    <div className="text-text-secondary group-hover:text-primary transition-colors">{item.icon}</div>
                    <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors text-center break-keep leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 학생 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-soft p-6 h-full">
              {!selectedClass ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">학급을 선택해주세요</h3>
                  <p className="text-text-secondary">왼쪽에서 학급을 선택하거나 새로 만들어주세요.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{selectedClass.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-text-secondary">반코드:</span>
                        <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-0.5 rounded-full text-sm">
                          {selectedClass.classCode}
                        </span>
                        <button onClick={() => copyClassCode(selectedClass.classCode)} className="text-text-secondary hover:text-primary">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-full font-semibold text-sm hover:shadow-glow transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      학생 추가
                    </button>
                  </div>

                  {/* 학생 추가 폼 */}
                  {showAddStudent && (
                    <form onSubmit={handleAddStudent} className="mb-4 p-4 bg-background rounded-2xl">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="학생 이름"
                          className="px-4 py-3 border-2 border-border rounded-2xl text-sm focus:border-primary outline-none"
                          required
                          autoFocus
                        />
                        <input
                          type="email"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="이메일 (선택)"
                          className="px-4 py-3 border-2 border-border rounded-2xl text-sm focus:border-primary outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold disabled:opacity-50">
                          {loading ? '추가 중...' : '추가'}
                        </button>
                        <button type="button" onClick={() => setShowAddStudent(false)} className="flex-1 py-2 border-2 border-border rounded-full text-sm font-semibold">
                          취소
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 학생 목록 */}
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">👤</div>
                      <p className="text-text-secondary">등록된 학생이 없습니다.</p>
                      <button
                        onClick={() => setShowAddStudent(true)}
                        className="mt-4 px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold text-sm hover:shadow-glow transition-all"
                      >
                        첫 학생 추가하기
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">이름</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary hidden sm:table-cell">이메일</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">토론 수</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">평균 점수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.id} className="border-b border-border hover:bg-background transition-colors">
                              <td className="py-3 px-4 font-semibold text-text-primary">{student.name}</td>
                              <td className="py-3 px-4 text-text-secondary text-sm hidden sm:table-cell">{student.email || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                  <MessageSquare className="w-3 h-3" />
                                  {student.debatesCount}회
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
                                  student.averageScore >= 90 ? 'bg-green-100 text-green-700' :
                                  student.averageScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  <Trophy className="w-3 h-3" />
                                  {student.averageScore}점
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-strong p-8 max-w-sm w-full">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">학급 삭제</h3>
                <p className="text-text-secondary">
                  <strong className="text-text-primary">{showDeleteConfirm.name}</strong>을 삭제하면
                  모든 학생 데이터가 함께 삭제됩니다. 계속하시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 border-2 border-border rounded-2xl font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDeleteClass(showDeleteConfirm)}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
