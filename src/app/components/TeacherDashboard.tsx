import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  LogOut, Plus, Users, MessageSquare, Trophy, Gift,
  ChevronRight, TrendingUp, Bell, FileText, BarChart3,
  Sparkles, CheckCircle2, ArrowRight, Clock, Target,
  Settings, Download, HelpCircle, Trash2, AlertTriangle
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  demoMode?: boolean;
  themeMode?: 'light' | 'dark';
}

export default function TeacherDashboard({ user, onLogout, demoMode = false, themeMode = 'light' }: TeacherDashboardProps) {
  const { showAlert } = useAlert();
  const [viewMode, setViewMode] = useState<'dashboard' | 'coupon' | 'announcement' | 'data' | 'report' | 'topics' | 'progress' | 'settings' | 'export' | 'help'>('dashboard');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkAddStudent, setShowBulkAddStudent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [bulkStudentData, setBulkStudentData] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id);
    }
  }, [selectedClass]);

  async function loadClasses() {
    try {
      if (demoMode) {
        const mockClasses = [
          {
            id: 'class-1',
            name: '3학년 1반',
            classCode: 'ABC12',
            createdAt: new Date().toISOString()
          },
          {
            id: 'class-2',
            name: '3학년 2반',
            classCode: 'DEF34',
            createdAt: new Date().toISOString()
          },
          {
            id: 'class-3',
            name: '3학년 3반',
            classCode: 'GHI56',
            createdAt: new Date().toISOString()
          }
        ];
        setClasses(mockClasses);
        if (mockClasses.length > 0 && !selectedClass) {
          setSelectedClass(mockClasses[0]);
        }
        return;
      }
      
      const data = await apiCall('/teacher/classes');
      setClasses(data.classes);
      if (data.classes.length > 0 && !selectedClass) {
        setSelectedClass(data.classes[0]);
      }
    } catch (error: any) {
      console.error('Error loading classes:', error);
      if (error.message?.includes('인증')) {
        showAlert('로그인이 만료되었습니다. 다시 로그인해주세요.', 'error');
        setTimeout(() => {
          onLogout();
        }, 2000);
      } else {
        showAlert('학급 목록을 불러오는데 실패했습니다.', 'error');
      }
    }
  }

  async function loadStudents(classId: string) {
    try {
      if (demoMode) {
        const mockStudents = [
          { id: 'student-1', name: '김철수', email: 'kim@student.com', debatesCount: 5, averageScore: 85 },
          { id: 'student-2', name: '이영희', email: 'lee@student.com', debatesCount: 3, averageScore: 92 },
          { id: 'student-3', name: '박민수', email: 'park@student.com', debatesCount: 7, averageScore: 78 },
          { id: 'student-4', name: '최지원', email: 'choi@student.com', debatesCount: 4, averageScore: 88 },
          { id: 'student-5', name: '정서연', email: 'jung@student.com', debatesCount: 6, averageScore: 95 },
          { id: 'student-6', name: '강민호', email: 'kang@student.com', debatesCount: 2, averageScore: 72 }
        ];
        setStudents(mockStudents);
        return;
      }
      
      const data = await apiCall(`/classes/${classId}/students`);
      setStudents(data.students);
    } catch (error: any) {
      console.error('Error loading students:', error);
      if (error.message?.includes('인증')) {
        showAlert('로그인이 만료되었습니다. 다시 로그인해주세요.', 'error');
        setTimeout(() => {
          onLogout();
        }, 2000);
      } else {
        showAlert('학생 목록을 불러오는데 실패했습니다.', 'error');
      }
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (demoMode) {
        const newClass = {
          id: `class-${Date.now()}`,
          name: className,
          classCode: Math.random().toString(36).substring(2, 7).toUpperCase(),
          createdAt: new Date().toISOString()
        };
        setClasses([...classes, newClass]);
        setSelectedClass(newClass);
        setShowCreateClass(false);
        setClassName('');
        setLoading(false);
        return;
      }
      
      const data = await apiCall('/classes', {
        method: 'POST',
        body: JSON.stringify({ name: className }),
      });

      setClasses([...classes, data.class]);
      setSelectedClass(data.class);
      setShowCreateClass(false);
      setClassName('');
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    console.log('handleAddStudent called', { selectedClass, studentName, demoMode });
    
    if (!selectedClass) {
      showAlert('학급을 선택해주세요.');
      return;
    }
    
    if (!studentName.trim()) {
      showAlert('학생 이름을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      if (demoMode) {
        console.log('Demo mode: adding student', studentName);
        const sanitizedName = studentName.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const newStudent = {
          id: `student-${Date.now()}`,
          name: studentName,
          email: `${(selectedClass.classCode || 'demo').toLowerCase()}.${sanitizedName}.${Date.now()}@student.aidebate.app`,
          debatesCount: 0,
          averageScore: 0
        };
        setStudents([...students, newStudent]);
        setShowAddStudent(false);
        setStudentName('');
        setLoading(false);
        showAlert('학생이 성공적으로 추가되었습니다.', 'success');
        return;
      }
      
      console.log('API mode: adding student', studentName);
      const data = await apiCall(`/classes/${selectedClass.id}/students`, {
        method: 'POST',
        body: JSON.stringify({ name: studentName }),
      });

      console.log('Student added successfully:', data);
      setStudents([...students, data.student]);
      setShowAddStudent(false);
      setStudentName('');
      showAlert('학생이 성공적으로 추가되었습니다.', 'success');
    } catch (error: any) {
      console.error('Add student error:', error);
      showAlert(error.message || '학생 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStudent() {
    if (!studentToDelete || !selectedClass) return;
    setLoading(true);
    try {
      if (demoMode) {
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        showAlert('학생이 삭제되었습니다.', 'success');
        setLoading(false);
        return;
      }
      await apiCall(`/classes/${selectedClass.id}/students/${studentToDelete.id}`, {
        method: 'DELETE'
      });
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
      showAlert('학생이 삭제되었습니다.', 'success');
    } catch (error: any) {
      showAlert(error.message || '학생 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkAddStudents(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass) return;
    
    if (!bulkStudentData.trim()) {
      showAlert('학생 이름을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      // Parse format: one name per line
      const lines = bulkStudentData.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        showAlert('최소 1명의 학생 이름을 입력해주세요.');
        setLoading(false);
        return;
      }
      
      const newStudents = lines.map((line, index) => {
        const name = line.trim();
        const sanitizedName = name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return {
          id: `student-${Date.now()}-${index}`,
          name: name || `학생${index + 1}`,
          email: `${(selectedClass.classCode || 'demo').toLowerCase()}.${sanitizedName}.${Date.now()}-${index}@student.aidebate.app`,
          debatesCount: 0,
          averageScore: 0
        };
      });

      if (demoMode) {
        setStudents([...students, ...newStudents]);
        setShowBulkAddStudent(false);
        setBulkStudentData('');
        setLoading(false);
        return;
      }
      
      const data = await apiCall(`/classes/${selectedClass.id}/students/bulk`, {
        method: 'POST',
        body: JSON.stringify({ students: newStudents }),
      });

      setStudents([...students, ...data.students]);
      setShowBulkAddStudent(false);
      setBulkStudentData('');
      showAlert(`${data.students.length}명의 학생이 성공적으로 추가되었습니다.`, 'success');
    } catch (error: any) {
      console.error('Bulk add students error:', error);
      showAlert(error.message || '학생 일괄 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClass(cls: Class) {
    setClassToDelete(cls);
    setShowDeleteConfirm(true);
  }

  function handleFirstConfirm() {
    setShowDeleteConfirm(false);
    setShowDeleteFinalConfirm(true);
  }

  async function handleFinalDelete() {
    if (!classToDelete) return;
    
    setLoading(true);
    try {
      if (demoMode) {
        const updatedClasses = classes.filter(c => c.id !== classToDelete.id);
        setClasses(updatedClasses);
        if (selectedClass?.id === classToDelete.id) {
          setSelectedClass(updatedClasses.length > 0 ? updatedClasses[0] : null);
        }
        showAlert('학급이 삭제되었습니다.', 'success');
      } else {
        await apiCall(`/classes/${classToDelete.id}`, {
          method: 'DELETE'
        });
        
        const updatedClasses = classes.filter(c => c.id !== classToDelete.id);
        setClasses(updatedClasses);
        if (selectedClass?.id === classToDelete.id) {
          setSelectedClass(updatedClasses.length > 0 ? updatedClasses[0] : null);
        }
        showAlert('학급이 삭제되었습니다.', 'success');
      }
    } catch (error: any) {
      showAlert(error.message || '학급 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
      setShowDeleteFinalConfirm(false);
      setClassToDelete(null);
    }
  }

  function handleCancelDelete() {
    setShowDeleteConfirm(false);
    setShowDeleteFinalConfirm(false);
    setClassToDelete(null);
  }

  // Calculate dashboard metrics
  const todayParticipants = students.filter(s => s.debatesCount > 0).length;
  const ongoingDebates = students.reduce((acc, s) => acc + s.debatesCount, 0);
  const avgParticipation = students.length > 0 
    ? Math.round((todayParticipants / students.length) * 100) 
    : 0;
  
  // Calculate class stats for mobile cards
  const classStats = {
    activeStudentsToday: todayParticipants,
    debatesThisWeek: ongoingDebates,
    averageScore: students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
      : 0
  };

  // Render different views
  if (viewMode === 'topics') {
    return (
      <TopicManagement
        onBack={() => setViewMode('dashboard')}
        classId={selectedClass?.id || ''}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'coupon') {
    return (
      <CouponManager
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
        classes={classes}
        students={students}
      />
    );
  }

  if (viewMode === 'announcement') {
    return (
      <AnnouncementForm
        onBack={() => setViewMode('dashboard')}
        onSuccess={() => setViewMode('dashboard')}
        demoMode={demoMode}
        classes={classes}
      />
    );
  }

  if (viewMode === 'data') {
    return (
      <DataDashboard
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'report') {
    return (
      <ReportPreview
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'progress') {
    return (
      <StudentProgress
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
        students={students}
        classId={selectedClass?.id || ''}
      />
    );
  }

  if (viewMode === 'settings') {
    if (!selectedClass) {
      showAlert('학급을 먼저 선택해주세요.', 'error');
      setViewMode('dashboard');
      return null;
    }
    return (
      <ClassSettings
        onBack={() => setViewMode('dashboard')}
        classData={selectedClass}
        students={students}
        onClassUpdate={(updatedClass) => {
          setSelectedClass(updatedClass);
          const updatedClasses = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
          setClasses(updatedClasses);
        }}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'export') {
    return (
      <DataExport
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'help') {
    return (
      <HelpSupport
        onBack={() => setViewMode('dashboard')}
        demoMode={demoMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">선생님 대시보드</h1>
                  <p className="text-sm text-text-secondary">학급 & 토론 관리</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* 사용자 정보는 상단 Header에 표시됨 */}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  안녕하세요, {user.name} 선생님! 👋
                </h2>
                <p className="text-text-secondary text-lg">오늘도 학생들의 토론 여정을 응원합니다</p>
              </div>
              
              {/* 선택된 학급 코드 표시 */}
              {selectedClass && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl px-8 py-6 shadow-strong border-2 border-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/10"></div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-gray-400 mb-1 tracking-wide uppercase">학급 코드</p>
                    <div className="text-3xl font-black tracking-wider" 
                      style={{ 
                        color: '#00FF88',
                        textShadow: '0 0 15px rgba(0, 255, 136, 0.9), 0 0 30px rgba(0, 255, 136, 0.6), 0 0 45px rgba(0, 255, 136, 0.4)',
                        filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 1))',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {selectedClass.classCode}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{selectedClass.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Class Selection Tags */}
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  학급 선택
                </h3>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-semibold shadow-soft"
                >
                  <Plus className="w-4 h-4" />
                  새 학급
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="relative group">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className={`px-6 py-4 rounded-full font-semibold transition-all ${
                        selectedClass?.id === cls.id
                          ? 'bg-gradient-primary text-white shadow-medium'
                          : 'bg-white text-text-secondary border-2 border-border hover:border-primary hover:text-primary shadow-soft'
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-base">{cls.name}</span>
                        {selectedClass?.id === cls.id && (
                          <span className="text-xl font-black tracking-wider whitespace-nowrap" 
                            style={{ 
                              color: '#00FF88',
                              textShadow: '0 0 10px rgba(0, 255, 136, 0.8), 0 0 20px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.3)',
                              filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.9))'
                            }}
                          >
                            {cls.classCode}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-medium z-10"
                      title="학급 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-text-secondary">첫 학급을 만들어보세요!</p>
                )}
              </div>
            </div>

          {selectedClass ? (
            <>
              {/* Key Metrics */}
              <div className="mb-8">
                {/* Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Metric 1: Today's Participants */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 shadow-soft animate-fade-in-up hover:-translate-y-1 transition-all" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center shadow-soft">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-semibold">+12%</span>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-green-700 mb-1">
                      {todayParticipants}
                    </div>
                    <p className="text-sm text-green-600 font-medium">오늘 참여 학생</p>
                    <p className="text-xs text-green-600 mt-1">전체 {students.length}명 중</p>
                  </div>

                  {/* Metric 2: Ongoing Debates */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 shadow-soft animate-fade-in-up hover:-translate-y-1 transition-all" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-blue-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold">실시간</span>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-1">
                      {ongoingDebates}
                    </div>
                    <p className="text-sm text-blue-600 font-medium">완료한 토론</p>
                    <p className="text-xs text-blue-600 mt-1">이번 주 누적</p>
                  </div>

                  {/* Metric 3: Average Participation */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200 shadow-soft animate-fade-in-up hover:-translate-y-1 transition-all" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center shadow-soft">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-purple-700">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold">우수</span>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-purple-700 mb-1">
                      {avgParticipation}%
                    </div>
                    <p className="text-sm text-purple-600 font-medium">평균 참여율</p>
                    <p className="text-xs text-purple-600 mt-1">학급 전체 기준</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  빠른 기능
                </h3>
                {/* Mobile: Vertical stack */}
                <div className="md:hidden flex flex-col gap-3">
                  {/* Action 1: Coupons */}
                  <button
                    onClick={() => setViewMode('coupon')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <Gift className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">보상/쿠폰 지급</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">우수 학생에게 쿠폰을 발행하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 2: Announcements */}
                  <button
                    onClick={() => setViewMode('announcement')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <Bell className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">공지사항 전송</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">학급 전체에 메시지를 보내세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 3: Data Dashboard */}
                  <button
                    onClick={() => setViewMode('data')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">통계 대시보드</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">학급 전체 분석 데이터를 확인하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 4: Reports */}
                  <button
                    onClick={() => setViewMode('report')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">리포트 미리보기</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">학생별 토론 결과를 확인하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 5: Student Progress */}
                  <button
                    onClick={() => setViewMode('progress')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">학생 진행 상황</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">개별 학생의 발전 과정을 추적하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 6: Topic Management */}
                  <button
                    onClick={() => setViewMode('topics')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">주제 관리</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">새로운 토론 주제를 추가하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 7: Settings */}
                  <button
                    onClick={() => setViewMode('settings')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <Settings className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">학급 설정</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">학급 정보와 설정을 관리하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 8: Export Data */}
                  <button
                    onClick={() => setViewMode('export')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <Download className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">데이터 내보내기</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">학급 데이터를 파일로 저장하세요</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>

                  {/* Action 9: Help & Support */}
                  <button
                    onClick={() => setViewMode('help')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <HelpCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-text-primary mb-0.5 truncate">도움말 & 지원</h4>
                        <p className="text-sm text-text-secondary line-clamp-1">사용 가이드와 문의하기</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                </div>
                
                {/* Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Action 1: Coupons */}
                  <button
                    onClick={() => setViewMode('coupon')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '500ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <Gift className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">보상/쿠폰 지급</h4>
                    <p className="text-sm text-text-secondary">우수 학생에게 쿠폰을 발행하세요</p>
                  </button>

                  {/* Action 2: Announcements */}
                  <button
                    onClick={() => setViewMode('announcement')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '600ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <Bell className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">공지사항 전송</h4>
                    <p className="text-sm text-text-secondary">학급 전체에 메시지를 보내세요</p>
                  </button>

                  {/* Action 3: Data Dashboard */}
                  <button
                    onClick={() => setViewMode('data')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '700ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">통계 대시보드</h4>
                    <p className="text-sm text-text-secondary">학급 전체 분석 데이터를 확인하세요</p>
                  </button>

                  {/* Action 4: Reports */}
                  <button
                    onClick={() => setViewMode('report')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '800ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">리포트 미리보기</h4>
                    <p className="text-sm text-text-secondary">학생별 토론 결과를 확인하세요</p>
                  </button>

                  {/* Action 5: Student Progress */}
                  <button
                    onClick={() => setViewMode('progress')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '900ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">학생 진행 상황</h4>
                    <p className="text-sm text-text-secondary">개별 학생의 발전 과정을 추적하세요</p>
                  </button>

                  {/* Action 6: Topic Management */}
                  <button
                    onClick={() => setViewMode('topics')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '1000ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">주제 관리</h4>
                    <p className="text-sm text-text-secondary">새로운 토론 주제를 추가하세요</p>
                  </button>

                  {/* Action 7: Settings */}
                  <button
                    onClick={() => setViewMode('settings')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-primary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '1100ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <Settings className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">학급 설정</h4>
                    <p className="text-sm text-text-secondary">학급 정보와 설정을 관리하세요</p>
                  </button>

                  {/* Action 8: Export Data */}
                  <button
                    onClick={() => setViewMode('export')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-secondary shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '1200ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <Download className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">데이터 내보내기</h4>
                    <p className="text-sm text-text-secondary">학급 데이터를 파일로 저장하세요</p>
                  </button>

                  {/* Action 9: Help & Support */}
                  <button
                    onClick={() => setViewMode('help')}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border hover:border-accent shadow-soft hover:shadow-medium transition-all text-left animate-fade-in-up"
                    style={{ animationDelay: '1300ms' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">도움말 & 지원</h4>
                    <p className="text-sm text-text-secondary">사용 가이드와 문의하기</p>
                  </button>
                </div>
              </div>

              {/* Student List */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    학생 목록
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold shadow-soft">
                      총 {students.length}명
                    </span>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-secondary text-white rounded-full hover:shadow-glow transition-all font-semibold shadow-soft"
                    >
                      <Plus className="w-4 h-4" />
                      학생 추가
                    </button>
                    <button
                      onClick={() => setShowBulkAddStudent(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-secondary border-2 border-secondary rounded-full hover:bg-secondary hover:text-white transition-all font-semibold shadow-soft"
                    >
                      <Users className="w-4 h-4" />
                      일괄 추가
                    </button>
                  </div>
                </div>
                
                {students.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {students.map((student, index) => (
                      <div
                        key={student.id}
                        className="bg-gradient-to-br from-muted to-white rounded-2xl p-4 border border-border hover:border-primary transition-all hover:shadow-soft group relative"
                        style={{ animationDelay: `${1200 + index * 50}ms` }}
                      >
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          title="학생 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-soft">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-text-primary truncate pr-6">{student.name}</h4>
                            <p className="text-xs text-text-secondary truncate">{student.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 text-center border border-border">
                            <p className="text-xs text-text-secondary">토론</p>
                            <p className="text-lg font-bold text-primary">{student.debatesCount}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center border border-border">
                            <p className="text-xs text-text-secondary">평균</p>
                            <p className="text-lg font-bold text-secondary">{student.averageScore}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                    <p className="text-text-secondary">아직 등록된 학생이 없습니다</p>
                    <p className="text-sm text-text-secondary mt-2">학생들이 학급 코드로 가입하면 여기에 표시됩니다</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-medium">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">학급을 만들어주세요</h3>
              <p className="text-text-secondary mb-6">학급을 만들고 학생들을 초대하여 토론을 시작하세요</p>
              <button
                onClick={() => setShowCreateClass(true)}
                className="px-8 py-4 bg-gradient-primary text-white rounded-full font-bold shadow-medium hover:shadow-glow transition-all"
              >
                첫 학급 만들기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">학생 삭제</h3>
                <p className="text-sm text-text-secondary">{studentToDelete.name}</p>
              </div>
            </div>

            {/* 경고 안내 박스 */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 space-y-2">
              <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                삭제 시 아래 데이터가 함께 삭제됩니다
              </p>
              <ul className="text-sm text-red-600 space-y-1 pl-6 list-disc">
                <li>모든 토론 기록 및 채팅 내용</li>
                <li>AI 평가 점수 및 피드백</li>
                <li>학생 계정 및 로그인 정보</li>
              </ul>
              <p className="text-xs text-red-500 font-semibold mt-2">⚠️ 이 작업은 되돌릴 수 없습니다.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-text-secondary rounded-full hover:bg-gray-200 transition-colors font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-strong animate-scale-in">
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-secondary" />
              학생 추가
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  학생 이름
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 김철수"
                  required
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all"
                />
                <p className="text-xs text-text-secondary mt-2">
                  💡 이메일과 비밀번호는 자동으로 생성됩니다
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudent(false);
                    setStudentName('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-full font-semibold text-text-secondary hover:bg-muted transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-secondary text-white rounded-full font-bold shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Students Modal */}
      {showBulkAddStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-strong animate-scale-in">
            <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-secondary" />
              학생 일괄 추가
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              한 줄에 한 명씩, 학생 이름만 입력하세요
            </p>
            <form onSubmit={handleBulkAddStudents} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  학생 명단 (한 줄에 한 명)
                </label>
                <textarea
                  value={bulkStudentData}
                  onChange={(e) => setBulkStudentData(e.target.value)}
                  placeholder="김철수&#10;이영희&#10;박민수"
                  rows={10}
                  required
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all font-mono text-sm resize-none"
                />
                <p className="text-xs text-text-secondary mt-2">
                  💡 팁: Excel에서 복사하여 붙여넣기 가능합니다
                </p>
              </div>
              <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl p-4 border border-secondary/20">
                <p className="text-sm text-text-primary mb-2">
                  <strong>예시:</strong>
                </p>
                <code className="text-xs text-text-secondary block font-mono bg-white p-2 rounded">
                  김철수<br />
                  이영희<br />
                  박민수
                </code>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAddStudent(false);
                    setBulkStudentData('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-full font-semibold text-text-secondary hover:bg-muted transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-secondary text-white rounded-full font-bold shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '일괄 추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-strong animate-fade-in-up">
            <h2 className="text-2xl font-bold text-text-primary mb-6">새 학급 만들기</h2>
            <form onSubmit={handleCreateClass}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  학급 이름
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="예: 3학년 1반"
                  className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateClass(false);
                    setClassName('');
                  }}
                  className="flex-1 px-6 py-3 bg-white border-2 border-border text-text-secondary rounded-full font-semibold hover:bg-muted transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold hover:shadow-glow transition-all disabled:opacity-50 shadow-soft"
                >
                  {loading ? '생성 중...' : '만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - First Step */}
      {showDeleteConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">학급을 삭제하시겠습니까?</h2>
            <p className="text-text-secondary text-center mb-2">
              <span className="font-bold text-primary">{classToDelete.name}</span> 학급을 삭제하려고 합니다.
            </p>
            <p className="text-sm text-red-600 text-center mb-6">
              이 작업은 되돌릴 수 없으며, 학급과 관련된 모든 데이터가 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-6 py-3 bg-gray-200 text-text-primary rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleFirstConfirm}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all shadow-soft"
              >
                다음 단계
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Final Step */}
      {showDeleteFinalConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-strong animate-fade-in-up border-4 border-red-500">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">정말로 삭제하시겠습니까?</h2>
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6">
              <p className="text-text-primary text-center mb-2 font-semibold">
                학급: <span className="text-red-600">{classToDelete.name}</span>
              </p>
              <p className="text-text-primary text-center font-semibold">
                반코드: <span className="text-red-600">{classToDelete.classCode}</span>
              </p>
            </div>
            <p className="text-sm text-red-600 text-center mb-2 font-bold">
              ⚠️ 최종 경고 ⚠️
            </p>
            <p className="text-sm text-text-secondary text-center mb-6">
              이 학급의 모든 학생, 토론 기록, 평가 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-6 py-3 bg-gray-200 text-text-primary rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all shadow-medium disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '확인, 삭제합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
