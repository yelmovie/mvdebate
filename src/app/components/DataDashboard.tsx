import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  ArrowLeft, Download, BarChart3, TrendingUp, Users, Filter,
  Award, FileText, PieChart, Gift, Mail
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

interface DataDashboardProps {
  onBack: () => void;
  demoMode?: boolean;
}

export default function DataDashboard({ onBack, demoMode = false }: DataDashboardProps) {
  const { showAlert } = useAlert();
  const [viewMode, setViewMode] = useState<'students' | 'analytics'>('students');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedPosition]);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    if (demoMode) {
      // Mock student data
      setStudents([
        { id: 'student-1', name: '김철수', email: 'kim@student.com', debatesCount: 8, averageScore: 85 },
        { id: 'student-2', name: '이영희', email: 'lee@student.com', debatesCount: 12, averageScore: 92 },
        { id: 'student-3', name: '박민수', email: 'park@student.com', debatesCount: 6, averageScore: 78 },
        { id: 'student-4', name: '최지원', email: 'choi@student.com', debatesCount: 10, averageScore: 88 },
        { id: 'student-5', name: '정서연', email: 'jung@student.com', debatesCount: 15, averageScore: 95 },
        { id: 'student-6', name: '강민호', email: 'kang@student.com', debatesCount: 4, averageScore: 72 },
        { id: 'student-7', name: '윤지혜', email: 'yoon@student.com', debatesCount: 9, averageScore: 87 },
        { id: 'student-8', name: '송준호', email: 'song@student.com', debatesCount: 7, averageScore: 81 }
      ]);

      // Mock dashboard data
      setDashboardData({
        characterStats: [
          { name: '꼬리질문 보뱀', count: 15 },
          { name: '팜씩한 검하는 형수', count: 12 },
          { name: '친화한 연의', count: 10 },
          { name: '발랄웃긴 민준', count: 8 },
          { name: '철벽논리 지호', count: 7 },
          { name: '사과왕 하늘', count: 6 },
          { name: '유쾌한 해든', count: 5 },
          { name: '뜨거운 감자 은비', count: 4 }
        ],
        positionRatio: [
          { name: '찬성', value: 59, color: '#10b981' },
          { name: '반대', value: 41, color: '#f43f5e' }
        ],
        radarData: [
          { subject: '주장 명확성', score: 4.2, fullMark: 5 },
          { subject: '근거 사용', score: 3.8, fullMark: 5 },
          { subject: '주제 충실도', score: 4.5, fullMark: 5 },
          { subject: '토론 예절', score: 4.7, fullMark: 5 },
          { subject: '비판적 사고', score: 3.9, fullMark: 5 }
        ]
      });
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall('/teacher/dashboard-data', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          position: selectedPosition
        })
      });
      setStudents(data.students || []);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setLoadError(error?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      // 에러 시에도 빈 데이터 구조로 표시
      setDashboardData({
        students: [],
        totalDebates: 0,
        avgScore: 0,
        activeStudents: 0,
        totalStudents: 0,
        avgTurns: 0,
        trendData: [],
        scoreDistribution: [
          { name: '0-60점', value: 0, color: '#FF6B6B' },
          { name: '60-80점', value: 0, color: '#FFD93D' },
          { name: '80-100점', value: 0, color: '#6BCB77' }
        ],
        radarData: [
          { subject: '논리성', score: 0, fullMark: 5 },
          { subject: '근거 사용', score: 0, fullMark: 5 },
          { subject: '주제 충실도', score: 0, fullMark: 5 },
          { subject: '토론 예절', score: 0, fullMark: 5 },
          { subject: '비판적 사고', score: 0, fullMark: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(type: 'pdf' | 'excel') {
    if (!dashboardData) return;
    
    const filename = `토론데이터_${new Date().toLocaleDateString()}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
    
    // Export logic would go here
    showAlert(`${type.toUpperCase()} 다운로드: ${filename}`);
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }

  function getScoreBadgeColor(score: number): string {
    if (score >= 90) return 'bg-gradient-secondary';
    if (score >= 80) return 'bg-gradient-primary';
    if (score >= 70) return 'bg-gradient-accent';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-text-secondary font-medium">데이터를 불러올 수 없습니다.</p>
          <button onClick={loadData} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90">
            다시 시도
          </button>
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
          <span className="text-lg">⚠️</span>
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
                  <p className="text-sm text-text-secondary">학급 현황 및 통계 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View Mode Toggle */}
          <div className="flex gap-3 mb-8 animate-fade-in-up">
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
              {/* Search */}
              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="학생 이름 또는 이메일로 검색..."
                  className="w-full px-5 py-4 bg-white border-2 border-border rounded-full focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-soft"
                />
              </div>

              {/* Student Cards */}
              <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border hover:border-primary transition-all shadow-soft hover:shadow-medium animate-fade-in-up"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar & Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-text-primary truncate">
                            {student.name}
                          </h3>
                          <p className="text-sm text-text-secondary truncate">
                            <Mail className="w-4 h-4 inline mr-1" />
                            {student.email}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                        {/* Debates Count */}
                        <div className="px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 min-w-[100px]">
                          <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            토론 횟수
                          </p>
                          <p className="text-2xl font-bold text-blue-700">{student.debatesCount}</p>
                        </div>

                        {/* Average Score */}
                        <div className={`px-4 py-2 rounded-2xl border-2 min-w-[100px] ${getScoreColor(student.averageScore)}`}>
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            평균 점수
                          </p>
                          <p className="text-2xl font-bold">{student.averageScore}</p>
                        </div>

                        {/* Action Button */}
                        <button
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
              {/* Filters */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  데이터 필터
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">학년/반</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-white"
                    >
                      <option value="all">전체</option>
                      <option value="class-1">3학년 1반</option>
                      <option value="class-2">3학년 2반</option>
                      <option value="class-3">3학년 3반</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">입장</label>
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
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">내보내기</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex-1 px-4 py-3 bg-gradient-primary text-white rounded-2xl font-semibold hover:shadow-glow transition-all shadow-soft flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="flex-1 px-4 py-3 bg-gradient-secondary text-white rounded-2xl font-semibold hover:shadow-glow transition-all shadow-soft flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Character Stats - Horizontal Bar Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    페르소나 선택 빈도
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dashboardData.characterStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis type="category" dataKey="name" width={150} stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '12px'
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {dashboardData.characterStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                        ))}
                      </Bar>
                      <defs>
                        {dashboardData.characterStats.map((entry: any, index: number) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF6B6B" />
                            <stop offset="100%" stopColor="#FFD93D" />
                          </linearGradient>
                        ))}
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Position Ratio - Donut Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    입장 비율 (찬성 / 반대)
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={dashboardData.positionRatio}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.positionRatio.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '12px'
                        }}
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

                {/* Radar Chart - Full Width */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border shadow-soft animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    평균 평가 점수 (5점 만점)
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={dashboardData.radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" stroke="#6b7280" style={{ fontSize: '14px', fontWeight: 600 }} />
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
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '12px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {viewMode === 'students' && (
        <button
          onClick={() => handleExport('pdf')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-primary text-white rounded-full shadow-strong hover:shadow-glow transition-all flex items-center justify-center z-50 animate-bounce-slow"
          title="리포트 다운로드"
        >
          <Download className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
