import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  ArrowLeft, TrendingUp, MessageSquare, Trophy, Target,
  Calendar, Clock, Star, Award, Zap, CheckCircle2,
  BarChart3, Activity, BookOpen, Sparkles
} from 'lucide-react';

interface StudentProgressProps {
  onBack: () => void;
  demoMode?: boolean;
  students: any[];
  classId: string;
}

interface DebateHistory {
  id: string;
  topicTitle: string;
  position: string;
  character: string;
  date: string;
  duration: number;
  messageCount: number;
  score: number;
  participationScore: number;
  logicScore: number;
  persuasionScore: number;
  feedback: string;
}

export default function StudentProgress({ onBack, demoMode = false, students, classId }: StudentProgressProps) {
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null);
  const [debates, setDebates] = useState<DebateHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDebates(selectedStudent.id);
    }
  }, [selectedStudent]);

  async function loadStudentDebates(studentId: string) {
    setLoading(true);
    try {
      if (demoMode) {
        // Mock debate history
        const mockDebates: DebateHistory[] = [
          {
            id: 'debate-1',
            topicTitle: '학교에서 스마트폰 사용을 허용해야 한다',
            position: 'for',
            character: '꼬리질문보라',
            date: '2026-02-10',
            duration: 15,
            messageCount: 8,
            score: 85,
            participationScore: 90,
            logicScore: 80,
            persuasionScore: 85,
            feedback: '논리적 근거가 탄탄했고, 상대방의 반론에 잘 대응했습니다. 다만 구체적인 예시를 더 추가하면 더 설득력이 있을 것 같아요!'
          },
          {
            id: 'debate-2',
            topicTitle: '숙제는 학습에 도움이 된다',
            position: 'against',
            character: '말싸움잘하는철수',
            date: '2026-02-08',
            duration: 12,
            messageCount: 6,
            score: 78,
            participationScore: 75,
            logicScore: 80,
            persuasionScore: 80,
            feedback: '좋은 주장이었지만, 좀 더 적극적으로 발언하면 좋겠습니다. 상대방의 의견을 경청하는 태도가 훌륭했어요!'
          },
          {
            id: 'debate-3',
            topicTitle: '온라인 수업이 대면 수업보다 효과적이다',
            position: 'for',
            character: '친절한영희',
            date: '2026-02-05',
            duration: 18,
            messageCount: 10,
            score: 92,
            participationScore: 95,
            logicScore: 90,
            persuasionScore: 90,
            feedback: '매우 우수한 토론이었습니다! 논리적 흐름이 명확했고, 상대방을 설득하는 능력이 돋보였어요. 계속 이런 자세를 유지하세요!'
          }
        ];
        setDebates(mockDebates);
        setLoading(false);
        return;
      }
      
      const data = await apiCall(`/students/${studentId}/debates`);
      // 서버 응답 필드를 프론트 기대 형식으로 안전하게 정규화
      const normalized = (data.debates || []).map((d: any) => ({
        id: d.id,
        topicTitle: d.topicTitle || d.topic || '토론 주제',
        position: d.position || 'for',
        character: d.character || d.characterName || '',
        date: d.date || d.completedAt || d.createdAt,
        duration: typeof d.duration === 'number' ? d.duration : Math.max(1, Math.round((d.messageCount || d.turns || 0) * 1.5)),
        messageCount: d.messageCount ?? d.turns ?? 0,
        score: d.score ?? 0,
        participationScore: d.participationScore ?? d.evaluation?.participationScore ?? 0,
        logicScore: d.logicScore ?? d.evaluation?.logicScore ?? 0,
        persuasionScore: d.persuasionScore ?? d.evaluation?.evidenceScore ?? 0,
        feedback: d.feedback || d.evaluation?.overallFeedback || '',
        status: d.status || 'completed',
      }));
      setDebates(normalized);
    } catch (error) {
      console.error('Error loading student debates:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">학생을 선택해주세요</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const avgScore = debates.length > 0 
    ? Math.round(debates.reduce((acc, d) => acc + d.score, 0) / debates.length)
    : 0;
  const totalMessages = debates.reduce((acc, d) => acc + d.messageCount, 0);
  const totalDuration = debates.reduce((acc, d) => acc + d.duration, 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                대시보드로 돌아가기
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-accent rounded-full shadow-soft">
                <Activity className="w-5 h-5 text-white" />
                <span className="font-bold text-white">학생 진행 상황</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Student Selection */}
          <div className="mb-8 animate-fade-in-up">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              학생 선택
            </h3>
            <div className="flex flex-wrap gap-3">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedStudent?.id === student.id
                      ? 'bg-gradient-primary text-white shadow-medium scale-105'
                      : 'bg-white text-text-secondary border-2 border-border hover:border-primary hover:text-primary shadow-soft'
                  }`}
                >
                  {student.name}
                </button>
              ))}
            </div>
          </div>

          {/* Student Overview Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-border mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-medium">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-text-primary mb-2">{selectedStudent.name}</h2>
                <p className="text-text-secondary">{selectedStudent.email}</p>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gradient-accent rounded-full shadow-soft">
                <Trophy className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-lg">{avgScore}점</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-600">총 토론</p>
                </div>
                <p className="text-3xl font-bold text-blue-700">{debates.length}회</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-600">총 발언</p>
                </div>
                <p className="text-3xl font-bold text-green-700">{totalMessages}개</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-600">총 시간</p>
                </div>
                <p className="text-3xl font-bold text-purple-700">{totalDuration}분</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-600">평균 점수</p>
                </div>
                <p className="text-3xl font-bold text-orange-700">{avgScore}점</p>
              </div>
            </div>
          </div>

          {/* Debate History */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              토론 이력
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">불러오는 중...</p>
              </div>
            ) : debates.length > 0 ? (
              <div className="space-y-6">
                {debates.map((debate, index) => (
                  <div
                    key={debate.id}
                    className="bg-gradient-to-br from-muted to-white rounded-2xl p-6 border border-border hover:border-primary transition-all hover:shadow-soft"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-text-primary mb-2">{debate.topicTitle}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            debate.position === 'for' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {debate.position === 'for' ? '찬성 입장' : '반대 입장'}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                            {debate.character}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            {debate.date && !isNaN(new Date(debate.date).getTime())
                              ? new Date(debate.date).toLocaleDateString('ko-KR')
                              : '날짜 미상'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`px-6 py-3 rounded-full shadow-soft ${debate.score > 0 ? 'bg-gradient-accent' : 'bg-gray-200'}`}>
                          <p className={`text-3xl font-bold ${debate.score > 0 ? 'text-white' : 'text-gray-500'}`}>
                            {debate.score > 0 ? `${debate.score}점` : (debate.status === 'completed' ? '평가중' : '진행중')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-white rounded-xl p-3 border border-border text-center">
                        <p className="text-xs text-text-secondary mb-1">참여도</p>
                        <p className="text-lg font-bold text-primary">{debate.participationScore}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-border text-center">
                        <p className="text-xs text-text-secondary mb-1">논리성</p>
                        <p className="text-lg font-bold text-secondary">{debate.logicScore}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-border text-center">
                        <p className="text-xs text-text-secondary mb-1">설득력</p>
                        <p className="text-lg font-bold text-accent">{debate.persuasionScore}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-border text-center">
                        <p className="text-xs text-text-secondary mb-1">발언수</p>
                        <p className="text-lg font-bold text-text-primary">{debate.messageCount}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-border text-center">
                        <p className="text-xs text-text-secondary mb-1">시간</p>
                        <p className="text-lg font-bold text-text-primary">{debate.duration}분</p>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-text-secondary mb-1">AI 피드백</p>
                          <p className="text-sm text-text-primary leading-relaxed">{debate.feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary">아직 토론 이력이 없습니다</p>
                <p className="text-sm text-text-secondary mt-2">학생이 토론을 완료하면 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
