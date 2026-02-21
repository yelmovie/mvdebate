import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import {
  ArrowLeft, Download, BarChart3, TrendingUp, Users, Filter,
  Award, FileText, PieChart, Gift, Mail, X, ChevronRight,
  MessageSquare, Star, Clock, CheckCircle, AlertCircle, Printer
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useAlert } from './AlertProvider';

interface Student {
  id: string;
  name: string;
  email: string;
  debatesCount: number;
  averageScore: number;
}

interface ClassInfo {
  id: string;
  name: string;
  classCode: string;
}

interface DataDashboardProps {
  onBack: () => void;
  demoMode?: boolean;
  classes?: ClassInfo[];
  allStudents?: Student[];
  initialClassId?: string;
}

// 학생 상세 모달
function StudentDetailModal({
  student,
  classInfo,
  onClose,
  onIssueCoupon,
  demoMode,
}: {
  student: Student;
  classInfo: ClassInfo | null;
  onClose: () => void;
  onIssueCoupon: (student: Student) => void;
  demoMode: boolean;
}) {
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDebates();
  }, []);

  async function loadStudentDebates() {
    if (demoMode) {
      setDebates([
        {
          id: 'd1',
          topicTitle: '학교에서 스마트폰 사용을 허용해야 한다',
          position: 'for',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          evaluation: { participationScore: 88, logicScore: 82, evidenceScore: 75, overallFeedback: '적극적으로 참여했습니다!' },
        },
        {
          id: 'd2',
          topicTitle: '숙제를 폐지해야 한다',
          position: 'against',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          evaluation: { participationScore: 92, logicScore: 90, evidenceScore: 85, overallFeedback: '논리적 근거가 훌륭했습니다!' },
        },
        {
          id: 'd3',
          topicTitle: '인공지능이 선생님을 대체할 수 있다',
          position: 'for',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          evaluation: null,
        },
      ]);
      setLoading(false);
      return;
    }
    try {
      const data = await apiCall(`/students/${student.id}/debates`);
      setDebates(data.debates || []);
    } catch {
      setDebates([]);
    } finally {
      setLoading(false);
    }
  }

  const avgScore = debates
    .filter(d => d.evaluation)
    .reduce((sum, d, _, arr) => {
      const s = (d.evaluation.participationScore + d.evaluation.logicScore + d.evaluation.evidenceScore) / 3;
      return sum + s / arr.length;
    }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-strong animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-border p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{student.name}</h2>
              <p className="text-sm text-text-secondary flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {student.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200">
              <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{student.debatesCount}</p>
              <p className="text-xs text-blue-600 font-semibold">총 토론</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200">
              <Star className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{Math.round(avgScore) || student.averageScore}</p>
              <p className="text-xs text-green-600 font-semibold">평균 점수</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-700">
                {debates.filter(d => d.status === 'completed').length}
              </p>
              <p className="text-xs text-purple-600 font-semibold">완료 토론</p>
            </div>
          </div>

          {/* 쿠폰 발행 버튼 */}
          <button
            onClick={() => onIssueCoupon(student)}
            className="w-full py-3 bg-gradient-accent text-white rounded-2xl font-semibold hover:shadow-glow transition-all shadow-soft flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            이 학생에게 쿠폰 발행하기
          </button>

          {/* 토론 목록 */}
          <div>
            <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              토론 기록
            </h3>
            {loading ? (
              <div className="text-center py-8 text-text-secondary">불러오는 중...</div>
            ) : debates.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">아직 토론 기록이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {debates.map((debate) => (
                  <div key={debate.id} className="bg-muted rounded-2xl p-4 border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm truncate">{debate.topicTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            debate.position === 'for'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {debate.position === 'for' ? '찬성' : '반대'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            debate.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {debate.status === 'completed' ? '완료' : '진행 중'}
                          </span>
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(debate.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      {debate.evaluation && (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-bold text-primary">
                            {Math.round((debate.evaluation.participationScore + debate.evaluation.logicScore + debate.evaluation.evidenceScore) / 3)}점
                          </p>
                        </div>
                      )}
                    </div>
                    {debate.evaluation?.overallFeedback && (
                      <p className="text-xs text-text-secondary mt-2 bg-white rounded-xl p-2 border border-border">
                        💬 {debate.evaluation.overallFeedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 쿠폰 발행 모달
function CouponIssueModal({
  student,
  classInfo,
  onClose,
  onSuccess,
  demoMode,
}: {
  student: Student;
  classInfo: ClassInfo | null;
  onClose: () => void;
  onSuccess: () => void;
  demoMode: boolean;
}) {
  const { showAlert } = useAlert();
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  const COUPONS = [
    { id: 'seat-change', name: '자리 바꾸기 1회권', emoji: '🪑', desc: '원하는 자리로 이동' },
    { id: 'hint-card', name: '음악 함께 듣기권', emoji: '🎵', desc: '좋아하는 음악 친구들과 함께' },
    { id: 'skip-homework', name: '숙제 면제권', emoji: '📚', desc: '오늘 숙제 1회 면제' },
    { id: 'game-time', name: '자유시간 5분권', emoji: '🎮', desc: '쉬는 시간 5분 추가' },
    { id: 'praise', name: '칭찬 상장', emoji: '🏆', desc: '토론왕 공식 인증' },
    { id: 'snack', name: '간식 선택권', emoji: '🍪', desc: '원하는 간식 선택' },
  ];

  async function handleIssue() {
    if (!selectedCoupon) {
      showAlert('쿠폰 종류를 선택해주세요.', 'error');
      return;
    }
    if (!classInfo) {
      showAlert('학급 정보가 없습니다.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (!demoMode) {
        await apiCall('/coupons/issue', {
          method: 'POST',
          body: JSON.stringify({
            classId: classInfo.id,
            couponType: selectedCoupon,
            studentIds: [student.id],
          }),
        });
      }
      showAlert(`${student.name}에게 쿠폰이 발행되었습니다! 🎉`, 'success');
      onSuccess();
    } catch (error: any) {
      showAlert(error.message || '쿠폰 발행에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-strong animate-fade-in-up">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">쿠폰 발행</h3>
              <p className="text-sm text-text-secondary">{student.name}에게 발행</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm font-semibold text-text-secondary mb-4">쿠폰 종류 선택</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {COUPONS.map((coupon) => (
              <button
                key={coupon.id}
                onClick={() => setSelectedCoupon(coupon.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  selectedCoupon === coupon.id
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-1">{coupon.emoji}</div>
                <p className="text-sm font-bold text-text-primary leading-tight">{coupon.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{coupon.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleIssue}
              disabled={loading || !selectedCoupon}
              className="flex-1 py-3 bg-gradient-accent text-white rounded-full font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? '발행 중...' : '쿠폰 발행'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DataDashboard({
  onBack,
  demoMode = false,
  classes = [],
  allStudents = [],
  initialClassId,
}: DataDashboardProps) {
  const { showAlert } = useAlert();
  const [viewMode, setViewMode] = useState<'students' | 'analytics'>('students');
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || 'all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [couponStudent, setCouponStudent] = useState<Student | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId) || null;

  useEffect(() => {
    loadData();
  }, [selectedClassId, selectedPosition]);

  async function loadData() {
    setLoading(true);
    setLoadError(null);

    if (demoMode) {
      const mockStudents: Student[] = [
        { id: 'student-1', name: '김철수', email: 'kim@student.com', debatesCount: 8, averageScore: 85 },
        { id: 'student-2', name: '이영희', email: 'lee@student.com', debatesCount: 12, averageScore: 92 },
        { id: 'student-3', name: '박민수', email: 'park@student.com', debatesCount: 6, averageScore: 78 },
        { id: 'student-4', name: '최지원', email: 'choi@student.com', debatesCount: 10, averageScore: 88 },
        { id: 'student-5', name: '정서연', email: 'jung@student.com', debatesCount: 15, averageScore: 95 },
        { id: 'student-6', name: '강민호', email: 'kang@student.com', debatesCount: 4, averageScore: 72 },
        { id: 'student-7', name: '윤지혜', email: 'yoon@student.com', debatesCount: 9, averageScore: 87 },
        { id: 'student-8', name: '송준호', email: 'song@student.com', debatesCount: 7, averageScore: 81 },
      ];
      const filtered = selectedClassId === 'all'
        ? mockStudents
        : mockStudents.slice(0, 4);
      setStudents(filtered);
      setDashboardData({
        characterStats: [
          { name: '꼬리질문보라', count: 15 },
          { name: '말싸움잘하는철수', count: 12 },
          { name: '반박장인민호', count: 10 },
          { name: '철벽논리지호', count: 8 },
          { name: '칭찬왕주호', count: 7 },
          { name: '단호박다혜', count: 6 },
          { name: '베스트프랜드소영', count: 5 },
          { name: '침착한수정', count: 4 },
        ],
        positionRatio: [
          { name: '찬성', value: 59, color: '#10b981' },
          { name: '반대', value: 41, color: '#f43f5e' },
        ],
        radarData: [
          { subject: '주장 명확성', score: 4.2, fullMark: 5 },
          { subject: '근거 사용', score: 3.8, fullMark: 5 },
          { subject: '주제 충실도', score: 4.5, fullMark: 5 },
          { subject: '토론 예절', score: 4.7, fullMark: 5 },
          { subject: '비판적 사고', score: 3.9, fullMark: 5 },
        ],
        totalDebates: 71,
        avgScore: 85,
        activeStudents: filtered.length,
        totalStudents: mockStudents.length,
      });
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall('/teacher/dashboard-data', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          position: selectedPosition,
        }),
      });
      setStudents(data.students || []);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setLoadError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      setDashboardData({
        students: [],
        totalDebates: 0,
        avgScore: 0,
        activeStudents: 0,
        totalStudents: 0,
        characterStats: [],
        positionRatio: [
          { name: '찬성', value: 50, color: '#10b981' },
          { name: '반대', value: 50, color: '#f43f5e' },
        ],
        radarData: [
          { subject: '주장 명확성', score: 0, fullMark: 5 },
          { subject: '근거 사용', score: 0, fullMark: 5 },
          { subject: '주제 충실도', score: 0, fullMark: 5 },
          { subject: '토론 예절', score: 0, fullMark: 5 },
          { subject: '비판적 사고', score: 0, fullMark: 5 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const className = selectedClass?.name || '전체 학급';
      const dateStr = new Date().toLocaleDateString('ko-KR');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // 표지 페이지
      pdf.setFillColor(255, 107, 107);
      pdf.rect(0, 0, 210, 60, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Debate Dashboard', 15, 30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Class: ${className}`, 15, 42);
      pdf.text(`Date: ${dateStr}`, 15, 52);

      // 통계 요약
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary Statistics', 15, 80);

      pdf.setDrawColor(230, 230, 230);
      pdf.line(15, 84, 195, 84);

      const stats = [
        ['Total Students', `${dashboardData?.totalStudents || students.length}`],
        ['Total Debates', `${dashboardData?.totalDebates || 0}`],
        ['Average Score', `${dashboardData?.avgScore || 0} pts`],
        ['Active Students', `${dashboardData?.activeStudents || students.filter(s => s.debatesCount > 0).length}`],
      ];

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      stats.forEach(([label, value], i) => {
        const x = i % 2 === 0 ? 15 : 110;
        const y = 95 + Math.floor(i / 2) * 20;
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(x, y - 6, 85, 16, 3, 3, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.text(label, x + 4, y + 1);
        pdf.setTextColor(255, 107, 107);
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, x + 4, y + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 30, 30);
      });

      // 학생 목록
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student List', 15, 145);
      pdf.line(15, 149, 195, 149);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(255, 107, 107);
      pdf.rect(15, 153, 180, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Name', 18, 159);
      pdf.text('Debates', 90, 159);
      pdf.text('Avg Score', 140, 159);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 30, 30);
      const displayStudents = filteredStudents.slice(0, 20);
      displayStudents.forEach((student, i) => {
        const y = 168 + i * 10;
        if (i % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, y - 5, 180, 10, 'F');
        }
        pdf.text(student.name, 18, y + 1);
        pdf.text(`${student.debatesCount}회`, 90, y + 1);
        const scoreColor = student.averageScore >= 90 ? [22, 163, 74] : student.averageScore >= 80 ? [37, 99, 235] : student.averageScore >= 70 ? [202, 138, 4] : [220, 38, 38];
        pdf.setTextColor(...scoreColor as [number, number, number]);
        pdf.text(`${student.averageScore}점`, 140, y + 1);
        pdf.setTextColor(30, 30, 30);
      });

      if (displayStudents.length < filteredStudents.length) {
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(9);
        pdf.text(`... and ${filteredStudents.length - displayStudents.length} more students`, 15, 168 + displayStudents.length * 10 + 5);
      }

      // 푸터
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated by AI Debate Platform | ${dateStr}`, 15, 285);
      pdf.text('Page 1', 185, 285);

      pdf.save(`토론_대시보드_${className}_${dateStr}.pdf`);
      showAlert('PDF가 다운로드되었습니다! 📄', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      showAlert('PDF 내보내기에 실패했습니다.', 'error');
    } finally {
      setExportingPdf(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      {/* 에러 배너 */}
      {loadError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-md flex items-center gap-3 max-w-lg w-full">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{loadError}</span>
          <button onClick={loadData} className="text-sm font-bold underline hover:no-underline">재시도</button>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  돌아가기
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <BarChart3 className="w-7 h-7 text-primary" />
                    데이터 대시보드
                  </h1>
                  <p className="text-sm text-text-secondary">
                    {selectedClass ? selectedClass.name : '전체 학급'} 현황 및 통계
                  </p>
                </div>
              </div>
              {/* 학급 선택 */}
              {classes.length > 0 && (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-4 py-2 border-2 border-border rounded-full focus:border-primary outline-none transition-all bg-white text-sm font-semibold text-text-primary"
                >
                  <option value="all">전체 학급</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 요약 카드 */}
          {dashboardData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
              {[
                { label: '전체 학생', value: dashboardData.totalStudents || students.length, icon: Users, color: 'from-blue-400 to-blue-600', bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700' },
                { label: '총 토론', value: dashboardData.totalDebates || 0, icon: MessageSquare, color: 'from-green-400 to-green-600', bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700' },
                { label: '평균 점수', value: `${dashboardData.avgScore || 0}점`, icon: Star, color: 'from-orange-400 to-orange-600', bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700' },
                { label: '참여 학생', value: dashboardData.activeStudents || students.filter(s => s.debatesCount > 0).length, icon: TrendingUp, color: 'from-purple-400 to-purple-600', bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 border ${stat.border}`} style={{ animationDelay: `${i * 50}ms` }}>
                  <stat.icon className={`w-5 h-5 ${stat.text} mb-2`} />
                  <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
                  <p className="text-xs font-semibold text-text-secondary mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setViewMode('students')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-full font-semibold transition-all ${
                viewMode === 'students'
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              학생 현황
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-full font-semibold transition-all ${
                viewMode === 'analytics'
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
              }`}
            >
              <PieChart className="w-5 h-5 inline mr-2" />
              통계 분석
            </button>
          </div>

          {viewMode === 'students' ? (
            <>
              {/* 검색 */}
              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="학생 이름 또는 이메일로 검색..."
                  className="w-full px-5 py-4 bg-white border-2 border-border rounded-full focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-soft"
                />
              </div>

              {/* 학생 카드 */}
              <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border hover:border-primary transition-all shadow-soft hover:shadow-medium animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-text-primary truncate flex items-center gap-2">
                            {student.name}
                            <ChevronRight className="w-4 h-4 text-text-secondary" />
                          </h3>
                          <p className="text-sm text-text-secondary truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 min-w-[90px]">
                          <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> 토론 횟수
                          </p>
                          <p className="text-2xl font-bold text-blue-700">{student.debatesCount}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border-2 min-w-[90px] ${getScoreColor(student.averageScore)}`}>
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                            <Award className="w-3 h-3" /> 평균 점수
                          </p>
                          <p className="text-2xl font-bold">{student.averageScore}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCouponStudent(student);
                          }}
                          className="px-5 py-3 bg-gradient-accent text-white rounded-full font-semibold hover:shadow-glow transition-all shadow-soft flex items-center gap-2 whitespace-nowrap"
                        >
                          <Gift className="w-4 h-4" />
                          쿠폰 발행
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-16 animate-fade-in-up">
                    <Users className="w-20 h-20 text-text-secondary mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-text-primary mb-2">검색 결과가 없습니다</h3>
                    <p className="text-text-secondary">다른 검색어를 시도해보세요</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 분석 필터 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  데이터 필터 및 내보내기
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">입장 필터</label>
                    <select
                      value={selectedPosition}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-white"
                    >
                      <option value="all">모든 입장</option>
                      <option value="for">찬성</option>
                      <option value="against">반대</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-text-secondary mb-2">데이터 내보내기</label>
                    <div className="flex gap-3">
                      <button
                        onClick={handleExportPdf}
                        disabled={exportingPdf}
                        className="flex-1 px-4 py-3 bg-gradient-primary text-white rounded-2xl font-semibold hover:shadow-glow transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <FileText className="w-4 h-4" />
                        {exportingPdf ? 'PDF 생성 중...' : 'PDF 내보내기'}
                      </button>
                      <button
                        onClick={() => {
                          // CSV 내보내기
                          const headers = ['이름', '이메일', '토론횟수', '평균점수'];
                          const rows = filteredStudents.map(s => [s.name, s.email, s.debatesCount, s.averageScore]);
                          const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                          const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `학생데이터_${selectedClass?.name || '전체'}_${new Date().toLocaleDateString('ko-KR')}.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                          showAlert('CSV 파일이 다운로드되었습니다! 📊', 'success');
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-secondary text-white rounded-2xl font-semibold hover:shadow-glow transition-all shadow-soft flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        CSV 내보내기
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 차트 그리드 */}
              {dashboardData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 캐릭터 선택 빈도 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      페르소나 선택 빈도
                    </h3>
                    {dashboardData.characterStats && dashboardData.characterStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={dashboardData.characterStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" stroke="#6b7280" />
                          <YAxis type="category" dataKey="name" width={140} stroke="#6b7280" style={{ fontSize: '11px' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '16px', padding: '12px' }}
                          />
                          <Bar dataKey="count" fill="#FF6B6B" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-text-secondary">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>토론 데이터가 없습니다</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 찬반 비율 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      입장 비율 (찬성 / 반대)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsPieChart>
                        <Pie
                          data={dashboardData.positionRatio}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardData.positionRatio.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '16px', padding: '12px' }}
                          formatter={(value: any) => [`${value}%`, '']}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry: any) => (
                            <span style={{ color: '#374151', fontWeight: 600 }}>
                              {value}: {entry.payload.value}%
                            </span>
                          )}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 레이더 차트 */}
                  <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      평균 평가 점수 (5점 만점)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={dashboardData.radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: 600 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} stroke="#6b7280" />
                        <Radar
                          name="점수"
                          dataKey="score"
                          stroke="#FF6B6B"
                          fill="#FF6B6B"
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '16px', padding: '12px' }}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 플로팅 PDF 버튼 */}
      {viewMode === 'students' && (
        <button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-primary text-white rounded-full shadow-strong hover:shadow-glow transition-all flex items-center justify-center z-50 animate-bounce-slow disabled:opacity-60"
          title="PDF 다운로드"
        >
          {exportingPdf ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-7 h-7" />
          )}
        </button>
      )}

      {/* 학생 상세 모달 */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          classInfo={selectedClass}
          onClose={() => setSelectedStudent(null)}
          onIssueCoupon={(s) => {
            setSelectedStudent(null);
            setCouponStudent(s);
          }}
          demoMode={demoMode}
        />
      )}

      {/* 쿠폰 발행 모달 */}
      {couponStudent && (
        <CouponIssueModal
          student={couponStudent}
          classInfo={selectedClass}
          onClose={() => setCouponStudent(null)}
          onSuccess={() => setCouponStudent(null)}
          demoMode={demoMode}
        />
      )}
    </div>
  );
}
