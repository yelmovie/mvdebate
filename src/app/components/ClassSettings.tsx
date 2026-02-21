import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, Users, Key, BookOpen, 
  Save, RefreshCw, Edit, Trash2, Plus, Check, X,
  AlertCircle, Clock, Calendar
} from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';

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

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
}

interface ClassSettingsProps {
  onBack: () => void;
  classData: Class;
  students: Student[];
  onClassUpdate: (updatedClass: Class) => void;
  demoMode?: boolean;
}

export default function ClassSettings({ 
  onBack, 
  classData, 
  students: initialStudents,
  onClassUpdate,
  demoMode = false 
}: ClassSettingsProps) {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'info' | 'students' | 'topics' | 'settings'>('info');
  const [className, setClassName] = useState(classData.name);
  const [classCode, setClassCode] = useState(classData.classCode);
  const [students, setStudents] = useState(initialStudents);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteStudent, setShowDeleteStudent] = useState<string | null>(null);
  const [showRegenerateCode, setShowRegenerateCode] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    autoAssignTopics: true,
    allowStudentTopicChoice: true,
    requirePreparation: true,
    minDebateTime: 10,
    maxDebateTime: 30,
    enableNotifications: true,
    showRankings: true
  });

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      if (demoMode) {
        setTopics([
          { 
            id: 'topic-1', 
            title: '학교 급식에 채식 메뉴를 늘려야 한다', 
            description: '환경과 건강을 고려한 급식 개선',
            difficulty: '쉬움',
            category: '학교생활'
          },
          { 
            id: 'topic-2', 
            title: '학생들의 스마트폰 사용을 제한해야 한다', 
            description: '교육 환경에서의 디지털 기기 사용',
            difficulty: '보통',
            category: '교육'
          },
          { 
            id: 'topic-3', 
            title: '기후 변화에 대응하기 위해 개인의 노력이 중요하다', 
            description: '환경 보호를 위한 개인의 역할',
            difficulty: '어려움',
            category: '환경'
          }
        ]);
        return;
      }

      const data = await apiCall(`/classes/${classData.id}/topics`);
      setTopics(data.topics || []);
    } catch (error: any) {
      console.error('Error loading topics:', error);
    }
  }

  async function handleSaveBasicInfo() {
    if (!className.trim()) {
      showAlert('학급 이름을 입력해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        const updatedClass = { ...classData, name: className };
        onClassUpdate(updatedClass);
        setIsEditing(false);
        showAlert('학급 정보가 저장되었습니다.', 'success');
        setLoading(false);
        return;
      }

      const data = await apiCall(`/classes/${classData.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: className })
      });

      onClassUpdate(data.class);
      setIsEditing(false);
      showAlert('학급 정보가 저장되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateCode() {
    setLoading(true);
    try {
      if (demoMode) {
        const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        setClassCode(newCode);
        const updatedClass = { ...classData, classCode: newCode };
        onClassUpdate(updatedClass);
        setShowRegenerateCode(false);
        showAlert('반코드가 재생성되었습니다.', 'success');
        setLoading(false);
        return;
      }

      const data = await apiCall(`/classes/${classData.id}/regenerate-code`, {
        method: 'POST'
      });

      setClassCode(data.classCode);
      const updatedClass = { ...classData, classCode: data.classCode };
      onClassUpdate(updatedClass);
      setShowRegenerateCode(false);
      showAlert('반코드가 재생성되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '반코드 재생성에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStudent(studentId: string) {
    setLoading(true);
    try {
      if (demoMode) {
        setStudents(students.filter(s => s.id !== studentId));
        setShowDeleteStudent(null);
        showAlert('학생이 삭제되었습니다.', 'success');
        setLoading(false);
        return;
      }

      await apiCall(`/classes/${classData.id}/students/${studentId}`, {
        method: 'DELETE'
      });

      setStudents(students.filter(s => s.id !== studentId));
      setShowDeleteStudent(null);
      showAlert('학생이 삭제되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '학생 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    setLoading(true);
    try {
      if (demoMode) {
        showAlert('설정이 저장되었습니다.', 'success');
        setLoading(false);
        return;
      }

      await apiCall(`/classes/${classData.id}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      showAlert('설정이 저장되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '설정 저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-soft">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">학급 설정</h1>
                  <p className="text-sm text-text-secondary">{classData.name}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                }`}
              >
                기본 정보
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'students'
                    ? 'bg-gradient-secondary text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-secondary'
                }`}
              >
                학생 관리 ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'topics'
                    ? 'bg-gradient-accent text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-accent'
                }`}
              >
                토론 주제 ({topics.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                }`}
              >
                고급 설정
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in-up">
            {/* Basic Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Class Name Card */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold text-text-primary">학급 이름</h3>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-primary rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                        placeholder="학급 이름을 입력하세요"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveBasicInfo}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setClassName(classData.name);
                            setIsEditing(false);
                          }}
                          className="px-6 py-3 bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-text-primary">{className}</p>
                  )}
                </div>

                {/* Class Code Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-strong border-2 border-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">반코드</h3>
                      </div>
                      <button
                        onClick={() => setShowRegenerateCode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        재생성
                      </button>
                    </div>
                    
                    <div className="text-4xl font-black tracking-wider mb-2" 
                      style={{ 
                        color: '#00FF88',
                        textShadow: '0 0 15px rgba(0, 255, 136, 0.9), 0 0 30px rgba(0, 255, 136, 0.6), 0 0 45px rgba(0, 255, 136, 0.4)',
                        filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 1))'
                      }}
                    >
                      {classCode}
                    </div>
                    <p className="text-sm text-gray-400">학생들은 이 코드로 학급에 가입할 수 있습니다</p>
                  </div>
                </div>

                {/* Class Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold text-text-primary">학급 정보</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-text-secondary mb-1">등록 학생 수</p>
                      <p className="text-2xl font-bold text-primary">{students.length}명</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-text-secondary mb-1">생성일</p>
                      <p className="text-lg font-bold text-text-primary">
                        {new Date(classData.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-text-secondary mb-1">활성 토론</p>
                      <p className="text-2xl font-bold text-secondary">
                        {students.reduce((acc, s) => acc + s.debatesCount, 0)}회
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-text-secondary mb-1">평균 점수</p>
                      <p className="text-2xl font-bold text-accent">
                        {students.length > 0 
                          ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
                          : 0}점
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold text-text-primary">학생 목록</h3>
                  </div>

                  <div className="space-y-3">
                    {students.map((student) => (
                      <div 
                        key={student.id}
                        className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{student.name[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold text-text-primary">{student.name}</p>
                              <p className="text-sm text-text-secondary">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-text-secondary">
                              토론: <span className="font-semibold text-primary">{student.debatesCount}회</span>
                            </span>
                            <span className="text-text-secondary">
                              평균: <span className="font-semibold text-accent">{student.averageScore}점</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDeleteStudent(student.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    
                    {students.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-text-secondary">등록된 학생이 없습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-bold text-text-primary">토론 주제</h3>
                  </div>

                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <div 
                        key={topic.id}
                        className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-text-primary flex-1">{topic.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            topic.difficulty === '쉬움' 
                              ? 'bg-green-100 text-green-700'
                              : topic.difficulty === '보통'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{topic.description}</p>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {topic.category}
                        </span>
                      </div>
                    ))}
                    
                    {topics.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-text-secondary">등록된 토론 주제가 없습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-text-primary">학급 설정</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Auto Assign Topics */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">자동 주제 배정</p>
                        <p className="text-sm text-text-secondary">학생에게 자동으로 토론 주제를 배정합니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoAssignTopics}
                          onChange={(e) => setSettings({ ...settings, autoAssignTopics: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Allow Student Topic Choice */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">학생 주제 선택 허용</p>
                        <p className="text-sm text-text-secondary">학생이 직접 토론 주제를 선택할 수 있습니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.allowStudentTopicChoice}
                          onChange={(e) => setSettings({ ...settings, allowStudentTopicChoice: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>

                    {/* Require Preparation */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">사전 준비 필수</p>
                        <p className="text-sm text-text-secondary">토론 전 사전 준비 단계를 거쳐야 합니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.requirePreparation}
                          onChange={(e) => setSettings({ ...settings, requirePreparation: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>

                    {/* Min Debate Time */}
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary mb-1">최소 토론 시간</p>
                          <p className="text-sm text-text-secondary">토론의 최소 진행 시간 (분)</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">{settings.minDebateTime}분</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="5"
                        value={settings.minDebateTime}
                        onChange={(e) => setSettings({ ...settings, minDebateTime: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Max Debate Time */}
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary mb-1">최대 토론 시간</p>
                          <p className="text-sm text-text-secondary">토론의 최대 진행 시간 (분)</p>
                        </div>
                        <span className="text-2xl font-bold text-secondary">{settings.maxDebateTime}분</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="10"
                        value={settings.maxDebateTime}
                        onChange={(e) => setSettings({ ...settings, maxDebateTime: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                      />
                    </div>

                    {/* Enable Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">알림 활성화</p>
                        <p className="text-sm text-text-secondary">학생의 토론 활동에 대한 알림을 받습니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableNotifications}
                          onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Show Rankings */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">순위표 표시</p>
                        <p className="text-sm text-text-secondary">학생들에게 토론 순위를 공개합니다</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showRankings}
                          onChange={(e) => setSettings({ ...settings, showRankings: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    설정 저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Code Confirmation Modal */}
      {showRegenerateCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">반코드 재생성</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              반코드를 재생성하면 기존 코드는 사용할 수 없게 됩니다. 새로운 학생들은 새 코드로만 가입할 수 있습니다. 계속하시겠습니까?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenerateCode(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-colors font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleRegenerateCode}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold disabled:opacity-50"
              >
                재생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {showDeleteStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">학생 삭제</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              정말로 이 학생을 삭제하시겠습니까? 학생의 모든 토론 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteStudent(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-colors font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteStudent)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
