import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  LogOut, MessageSquare, Trophy, Gift, Sparkles, BookOpen,
  TrendingUp, Award, ChevronRight, Plus, Shuffle, X, Users, User,
  Flame, Target, Zap, Star, CheckCircle2, Bell, BellRing, Pin, ChevronDown, ChevronUp
} from 'lucide-react';
import DebateSetup from './DebateSetup';
import DebatePreparation from './DebatePreparation';
import DebateChat from './DebateChat';
import DebateReflection from './DebateReflection';
import DebateResult from './DebateResult';

interface User {
  id: string;
  name: string;
  email: string;
}

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  demoMode?: boolean;
  themeMode?: 'light' | 'dark';
}

interface Class {
  id: string;
  name: string;
  classCode: string;
}

interface Topic {
  id?: string;
  title: string;
  description: string;
  isRandom?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Debate {
  id: string;
  topicTitle: string;
  position: string;
  status: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  message?: string; // Legacy field
  couponType?: string;
  customName?: string;
  customDescription?: string;
  createdAt: string;
  used?: boolean;
  usedAt?: string;
}

interface Announcement {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  isRead?: boolean;
}

type ViewMode = 'dashboard' | 'setup' | 'preparation' | 'chat' | 'reflection' | 'result';
type TabMode = 'random' | 'teacher';

export default function StudentDashboard({ user, onLogout, demoMode = false, themeMode = 'light' }: StudentDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [tabMode, setTabMode] = useState<TabMode>('random');
  const [classes, setClasses] = useState<Class[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentDebateId, setCurrentDebateId] = useState<string | null>(null);
  const [currentDebate, setCurrentDebate] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [streak, setStreak] = useState(3);

  // 공지사항 관련 상태
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementList, setShowAnnouncementList] = useState(false);
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (demoMode) {
        setClasses([
          { id: 'class-1', name: '3학년 1반', classCode: 'ABC12' }
        ]);
        setTopics([
          { id: 'topic-1', title: '학교에서 스마트폰 사용 허용', description: '학생들의 학교 내 스마트폰 사용을 허용해야 하는가?', difficulty: 'easy' },
          { id: 'topic-2', title: '교복 자율화', description: '학교에서 교복을 자율화해야 하는가?', difficulty: 'medium' },
          { id: 'topic-3', title: '학생 인권과 규칙', description: '학생 인권과 학교 규칙 중 무엇이 우선인가?', difficulty: 'hard' },
          { id: 'topic-4', title: 'AI 사용 허용', description: '학교에서 AI 도구 사용을 허용해야 하는가?', difficulty: 'medium' },
          { id: 'topic-5', title: '급식 메뉴 선택권', description: '학생들에게 급식 메뉴 선택권을 줘야 하는가?', difficulty: 'easy' },
        ]);
        setDebates([
          { id: 'debate-1', topicTitle: '온라인 수업 vs 오프라인 수업', position: '찬성', status: 'completed', createdAt: '2024-02-01' },
          { id: 'debate-2', topicTitle: '숙제의 필요성', position: '반대', status: 'completed', createdAt: '2024-02-05' },
          { id: 'debate-3', topicTitle: '교복 착용 의무화', position: '찬성', status: 'in_progress', createdAt: '2024-02-08' }
        ]);
        setCoupons([
          { id: 'coupon-1', message: '토론 우수상 🏆', createdAt: '2024-02-10', used: false },
          { id: 'coupon-2', couponType: 'seat-change', createdAt: '2024-02-12', used: false },
          { id: 'coupon-3', couponType: 'hint-card', createdAt: '2024-02-08', used: false },
          { id: 'coupon-4', couponType: 'penalty-pass', createdAt: '2024-02-15', used: false }
        ]);
        // 데모 공지사항
        const demoAnnouncements: Announcement[] = [
          {
            id: 'ann-1',
            teacherId: 'teacher-1',
            teacherName: '김선생님',
            classId: 'class-1',
            title: '📢 이번 주 토론 주제 안내',
            content: '이번 주 토론 주제는 "AI 사용 허용"입니다. 미리 준비해 오세요!\n\n준비물: 본인의 의견 3가지 이상',
            isPinned: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isRead: false
          },
          {
            id: 'ann-2',
            teacherId: 'teacher-1',
            teacherName: '김선생님',
            classId: null,
            title: '✅ 토론 평가 기준 변경 안내',
            content: '다음 달부터 토론 평가 기준이 변경됩니다.\n\n1. 논리성 (40점)\n2. 근거 제시 (30점)\n3. 반박 능력 (30점)',
            isPinned: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isRead: false
          }
        ];
        setAnnouncements(demoAnnouncements);
        setAnnouncementsLoaded(true);
        // 읽지 않은 공지가 있으면 팝업 표시
        const unread = demoAnnouncements.filter(a => !a.isRead);
        if (unread.length > 0) {
          setSelectedAnnouncement(unread[0]);
          setShowAnnouncementPopup(true);
        }
        return;
      }
      
      const [classesData, debatesData, couponsData] = await Promise.all([
        apiCall('/my-classes'),
        apiCall('/my-debates'),
        apiCall('/my-coupons'),
      ]);

      setClasses(classesData.classes);
      setDebates(debatesData.debates);
      setCoupons(couponsData.coupons);

      if (classesData.classes.length > 0) {
        const topicsData = await apiCall(`/classes/${classesData.classes[0].id}/topics`);
        setTopics(topicsData.topics);
      }

      // 공지사항 로드
      await loadAnnouncements();
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (error.message?.includes('인증')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        onLogout();
      }
    }
  }

  async function loadAnnouncements() {
    try {
      const data = await apiCall('/student/announcements');
      const anns: Announcement[] = data.announcements || [];
      setAnnouncements(anns);
      setAnnouncementsLoaded(true);

      // 읽지 않은 공지 중 최신 1개를 팝업으로 표시
      const unread = anns.filter(a => !a.isRead);
      if (unread.length > 0) {
        setSelectedAnnouncement(unread[0]);
        setShowAnnouncementPopup(true);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setAnnouncementsLoaded(true);
    }
  }

  async function handleMarkAsRead(announcementId: string) {
    try {
      setAnnouncements(prev =>
        prev.map(a => a.id === announcementId ? { ...a, isRead: true } : a)
      );
      if (!demoMode) {
        await apiCall(`/student/announcements/${announcementId}/read`, { method: 'POST' });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  function handleClosePopup() {
    if (selectedAnnouncement) {
      handleMarkAsRead(selectedAnnouncement.id);
    }
    setShowAnnouncementPopup(false);
    setSelectedAnnouncement(null);
  }

  function handleOpenAnnouncement(ann: Announcement) {
    setSelectedAnnouncement(ann);
    setShowAnnouncementPopup(true);
    setShowAnnouncementList(false);
  }

  const randomTopics: Topic[] = [
    // 초급
    { title: '학교에서 스마트폰 사용을 허용해야 한다', description: '학생들의 학교 내 스마트폰 사용에 대한 찬반 토론', difficulty: 'easy', isRandom: true },
    { title: '숙제를 폐지해야 한다', description: '학교 숙제의 필요성에 대한 토론', difficulty: 'easy', isRandom: true },
    { title: '교복을 입지 않아도 된다', description: '학교 교복 착용 의무화에 대한 토론', difficulty: 'easy', isRandom: true },
    { title: '급식에 디저트를 매일 제공해야 한다', description: '학교 급식 메뉴 개선에 대한 토론', difficulty: 'easy', isRandom: true },
    { title: '체육 시간을 늘려야 한다', description: '체육 수업 시간 확대에 대한 토론', difficulty: 'easy', isRandom: true },
    { title: '반려동물과 함께 등교할 수 있어야 한다', description: '학교 내 반려동물 동반 허용', difficulty: 'easy', isRandom: true },
    // 중급
    { title: '시험을 없애야 한다', description: '학교 시험 제도의 필요성에 대한 토론', difficulty: 'medium', isRandom: true },
    { title: '온라인 수업이 더 효과적이다', description: '온라인 vs 오프라인 수업의 효과성 비교', difficulty: 'medium', isRandom: true },
    { title: '인공지능 사용을 학교에서 허용해야 한다', description: '교육에서의 AI 활용에 대한 토론', difficulty: 'medium', isRandom: true },
    { title: '학생 인권이 학교 규칙보다 중요하다', description: '학생 인권과 학교 규칙의 우선순위', difficulty: 'medium', isRandom: true },
    { title: '성적 공개를 금지해야 한다', description: '학생 성적 공개의 적절성', difficulty: 'medium', isRandom: true },
    { title: '게임은 스포츠로 인정받아야 한다', description: 'e스포츠의 정당성과 가치', difficulty: 'medium', isRandom: true },
    // 고급
    { title: 'AI가 인간의 일자리를 대체할 것이다', description: '인공지능과 미래 노동시장의 변화', difficulty: 'hard', isRandom: true },
    { title: '기후변화는 개인이 아닌 기업이 책임져야 한다', description: '환경 책임의 주체에 대한 논쟁', difficulty: 'hard', isRandom: true },
    { title: '소셜미디어 사용 연령을 제한해야 한다', description: '청소년 온라인 활동 규제', difficulty: 'hard', isRandom: true },
  ];

  async function handleSelectRandomTopic() {
    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setSelectedTopic(randomTopic);
    setViewMode('setup');
  }

  function handleSelectTopic(topic: Topic) {
    setSelectedTopic(topic);
    setViewMode('setup');
  }

  async function handleDebateCreated(debateId: string) {
    setCurrentDebateId(debateId);
    
    if (demoMode) {
      setCurrentDebate({
        id: debateId,
        topicTitle: selectedTopic?.title,
        topicDescription: selectedTopic?.description,
        position: 'for',
        character: 'default',
        status: 'preparing'
      });
      setViewMode('preparation');
      return;
    }
    
    const data = await apiCall(`/debates/${debateId}`);
    setCurrentDebate(data.debate);
    setViewMode('preparation');
  }

  async function handlePreparationComplete() {
    setViewMode('chat');
  }

  async function handleDebateComplete() {
    setViewMode('reflection');
  }

  async function handleReflectionComplete() {
    setViewMode('result');
  }

  async function handleUseCoupon(couponId: string) {
    // 쿠폰 정보 가져오기
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    // 쿠폰 이름 결정
    let couponName = '';
    if (coupon.couponType === 'custom') {
      couponName = coupon.customName || '커스텀 쿠폰';
    } else if (coupon.couponType) {
      const couponTypes: Record<string, string> = {
        'seat-change': '자리 바꾸기 1회권',
        'hint-card': '원하는 음악 친구들과 함께듣기 권',
        'nomination': '숙제 지목권',
        'penalty-pass': '급식먼저먹기 권'
      };
      couponName = couponTypes[coupon.couponType] || '보상 쿠폰';
    } else {
      couponName = coupon.message || '보상 쿠폰';
    }

    // 확인 창 표시
    const confirmed = confirm(`정말 "${couponName}"을(를) 사용하시겠습니까?\n\n사용 후에는 취소할 수 없습니다.`);
    if (!confirmed) return;

    try {
      if (demoMode) {
        // Update coupon locally in demo mode
        setCoupons(prev => prev.map(c => 
          c.id === couponId 
            ? { ...c, used: true, usedAt: new Date().toISOString() }
            : c
        ));
        alert('쿠폰을 사용했습니다! 🎉');
        return;
      }

      await apiCall(`/coupons/${couponId}/use`, {
        method: 'POST'
      });

      // Update local state
      setCoupons(prev => prev.map(c => 
        c.id === couponId 
          ? { ...c, used: true, usedAt: new Date().toISOString() }
          : c
      ));

      alert('쿠폰을 사용했습니다! 🎉');
    } catch (error: any) {
      console.error('Error using coupon:', error);
      alert(error.message || '쿠폰 사용에 실패했습니다.');
    }
  }

  function handleBackToDashboard() {
    setViewMode('dashboard');
    setSelectedTopic(null);
    setCurrentDebateId(null);
    setCurrentDebate(null);
    loadData();
  }

  const stats = {
    totalDebates: debates.length,
    completedDebates: debates.filter(d => d.status === 'completed').length,
    inProgressDebates: debates.filter(d => d.status === 'in_progress').length,
    totalCoupons: coupons.length,
    weeklyProgress: 60, // Mock: 이번 주 진행률
  };

  const difficultyConfig = {
    easy: { label: '초급', color: 'bg-gradient-secondary', textColor: 'text-white', icon: '🌱' },
    medium: { label: '중급', color: 'bg-gradient-accent', textColor: 'text-text-primary', icon: '⚡' },
    hard: { label: '고급', color: 'bg-gradient-primary', textColor: 'text-white', icon: '🔥' },
  };

  if (viewMode === 'setup' && selectedTopic) {
    return (
      <DebateSetup
        user={user}
        topic={selectedTopic}
        onDebateCreated={handleDebateCreated}
        onCancel={handleBackToDashboard}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'preparation' && currentDebateId) {
    return (
      <DebatePreparation
        debateId={currentDebateId}
        debate={currentDebate}
        onComplete={handlePreparationComplete}
        onCancel={handleBackToDashboard}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'chat' && currentDebateId) {
    return (
      <DebateChat
        debateId={currentDebateId}
        debate={currentDebate}
        onComplete={handleDebateComplete}
        onCancel={handleBackToDashboard}
        demoMode={demoMode}
        user={user}
      />
    );
  }

  if (viewMode === 'reflection' && currentDebateId) {
    return (
      <DebateReflection
        debateId={currentDebateId}
        onComplete={handleReflectionComplete}
        onSkip={handleReflectionComplete}
        demoMode={demoMode}
      />
    );
  }

  if (viewMode === 'result' && currentDebateId) {
    return (
      <DebateResult
        debateId={currentDebateId}
        onBack={handleBackToDashboard}
        demoMode={demoMode}
      />
    );
  }

  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-accent"></div>

      {/* ===== 공지사항 팝업 ===== */}
      {showAnnouncementPopup && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            {/* 팝업 헤더 */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  {selectedAnnouncement.isPinned
                    ? <Pin className="w-5 h-5 text-white" />
                    : <BellRing className="w-5 h-5 text-white" />
                  }
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium">
                    {selectedAnnouncement.isPinned ? '📌 중요 공지' : '📢 선생님 공지사항'}
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {selectedAnnouncement.teacherName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePopup}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* 팝업 본문 */}
            <div className="px-6 py-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedAnnouncement.title}</h3>
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
              <p className="text-xs text-gray-400 text-right">
                {new Date(selectedAnnouncement.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            {/* 팝업 하단 */}
            <div className="px-6 pb-6 flex gap-3">
              {unreadCount > 1 && (
                <button
                  onClick={() => {
                    handleClosePopup();
                    setShowAnnouncementList(true);
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-semibold"
                >
                  다른 공지 보기 ({unreadCount - 1}개)
                </button>
              )}
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-opacity text-sm font-bold shadow-medium"
              >
                확인했어요 ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 공지사항 목록 사이드 패널 ===== */}
      {showAnnouncementList && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowAnnouncementList(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mt-20 mr-2 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="text-white font-bold">선생님 공지사항</h3>
                {unreadCount > 0 && (
                  <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    읽지 않음 {unreadCount}
                  </span>
                )}
              </div>
              <button onClick={() => setShowAnnouncementList(false)}>
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">공지사항이 없어요</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {announcements.map(ann => (
                    <button
                      key={ann.id}
                      onClick={() => handleOpenAnnouncement(ann)}
                      className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${!ann.isRead ? 'bg-primary/3' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!ann.isRead ? 'bg-primary' : 'bg-gray-200'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {ann.isPinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                            <p className={`text-sm font-semibold truncate ${!ann.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                              {ann.title}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">{ann.content}</p>
                          <p className="text-xs text-gray-300 mt-1">
                            {ann.teacherName} · {new Date(ann.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* 상단: 학생 프로필 + 오늘의 미션 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* 프로필 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-medium">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-1">{user.name}님, 환영해요! 👋</h1>
                  <p className="text-sm text-text-secondary">오늘도 멋진 토론을 시작해볼까요?</p>
                </div>
              </div>

              {/* 통계 + 공지사항 알림 버튼 */}
              <div className="flex items-center gap-3">
                {/* 공지사항 알림 버튼 */}
                <button
                  onClick={() => setShowAnnouncementList(true)}
                  className="relative w-12 h-12 bg-white rounded-2xl shadow-soft border border-border flex items-center justify-center hover:shadow-medium transition-shadow"
                >
                  <Bell className="w-5 h-5 text-text-secondary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {/* 연속 참여 스트릭 */}
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-accent rounded-full shadow-soft">
                  <Flame className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">{streak}일 연속</span>
                </div>
              </div>
            </div>

            {/* 이번 주 진행률 */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-bold text-text-primary">이번 주 토론 진행률</span>
                </div>
                <span className="text-2xl font-bold text-primary">{stats.weeklyProgress}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${stats.weeklyProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm overflow-x-auto pb-2">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-text-secondary">완료: <strong className="text-text-primary">{stats.completedDebates}</strong></span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-text-secondary">진행 중: <strong className="text-text-primary">{stats.inProgressDebates}</strong></span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-text-secondary">보상: <strong className="text-text-primary">{stats.totalCoupons}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* 좌측: 진행 중인 토론 (Sticky Sidebar) */}
            <div className="lg:col-span-1">
              {/* 공지사항 배너 (사이드바 최상단) */}
              {announcements.length > 0 && (
                <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-primary/20 overflow-hidden">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors"
                    onClick={() => setShowAnnouncementList(!showAnnouncementList)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Bell className="w-4 h-4 text-primary" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary">선생님 공지사항</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {showAnnouncementList
                      ? <ChevronUp className="w-4 h-4 text-primary" />
                      : <ChevronDown className="w-4 h-4 text-primary" />
                    }
                  </button>

                  {/* 최신 공지 미리보기 */}
                  {!showAnnouncementList && (
                    <button
                      onClick={() => handleOpenAnnouncement(announcements[0])}
                      className="w-full px-4 pb-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {announcements[0].isPinned && <Pin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className={`text-xs font-semibold truncate ${!announcements[0].isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                            {announcements[0].title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{announcements[0].content}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}

              <div className="lg:sticky lg:top-8 bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-soft border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-text-primary">진행 중인 토론</h3>
                </div>
                
                {stats.inProgressDebates > 0 ? (
                  <div className="space-y-3">
                    {debates.filter(d => d.status === 'in_progress').map(debate => (
                      <div key={debate.id} className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                        <div className="flex items-start gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary mt-0.5" />
                          <h4 className="font-semibold text-sm text-text-primary line-clamp-2">{debate.topicTitle}</h4>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">입장: {debate.position === 'for' ? '찬성' : '반대'}</p>
                        <button
                          onClick={async () => {
                            setCurrentDebateId(debate.id);
                            if (demoMode) {
                              setCurrentDebate(debate);
                            } else {
                              try {
                                const data = await apiCall(`/debates/${debate.id}`);
                                setCurrentDebate(data.debate);
                              } catch {
                                setCurrentDebate(debate);
                              }
                            }
                            setViewMode('chat');
                          }}
                          className="w-full py-2 bg-gradient-primary text-white font-semibold text-sm rounded-full hover:shadow-glow transition-all"
                        >
                          계속하기
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💭</div>
                    <p className="text-sm text-text-secondary">진행 중인 토론이 없어요</p>
                  </div>
                )}

                {/* 완료한 토론 */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-secondary" />
                    <h3 className="font-bold text-text-primary text-sm">완료한 토론</h3>
                  </div>
                  <div className="text-center p-4 bg-gradient-secondary/10 rounded-2xl">
                    <div className="text-3xl font-bold text-secondary mb-1">{stats.completedDebates}</div>
                    <p className="text-xs text-text-secondary">개의 토론 완료</p>
                  </div>
                </div>

                {/* 나의 보상 */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-accent" />
                      <h3 className="font-bold text-text-primary text-sm">나의 보상</h3>
                    </div>
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {coupons.length}개
                    </span>
                  </div>
                  
                  {coupons.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {coupons.map((coupon) => {
                        // Determine coupon name and description
                        let couponName = '';
                        let couponDescription = '';
                        
                        if (coupon.couponType === 'custom') {
                          couponName = coupon.customName || '커스텀 쿠폰';
                          couponDescription = coupon.customDescription || '';
                        } else if (coupon.couponType) {
                          // Map coupon types to names
                          const couponTypes: Record<string, { name: string; description: string }> = {
                            'seat-change': { name: '자리 바꾸기 1회권', description: '원하는 자리로 이동' },
                            'hint-card': { name: '원하는 음악 친구들과 함께듣기 권', description: '점심시간 음악 선곡' },
                            'nomination': { name: '숙제 지목권', description: '숙제 검사 면제' },
                            'penalty-pass': { name: '급식먼저먹기 권', description: '급식 줄서기 면제' }
                          };
                          const type = couponTypes[coupon.couponType];
                          couponName = type?.name || '보상 쿠폰';
                          couponDescription = type?.description || '';
                        } else {
                          // Legacy coupon with message field
                          couponName = coupon.message || '보상 쿠폰';
                        }
                        
                        return (
                          <div 
                            key={coupon.id}
                            className={`p-3 rounded-2xl border transition-all ${
                              coupon.used
                                ? 'bg-gray-100 border-gray-200 opacity-60'
                                : 'bg-gradient-to-br from-sunflower-yellow/20 to-sunflower-yellow/10 border-sunflower-yellow/30 hover:border-sunflower-yellow/50 hover:shadow-soft group'
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-1">
                              <Sparkles className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-transform ${
                                coupon.used ? 'text-gray-400' : 'text-sunflower-yellow group-hover:rotate-12'
                              }`} />
                              <div className="flex-1">
                                <p className={`text-sm font-semibold line-clamp-2 ${
                                  coupon.used ? 'text-gray-500' : 'text-text-primary'
                                }`}>
                                  {couponName}
                                </p>
                                {couponDescription && (
                                  <p className="text-xs text-text-secondary mt-0.5">
                                    {couponDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              {coupon.used ? (
                                <div className="w-full py-2.5 bg-gray-200 rounded-xl flex items-center justify-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-bold text-gray-500">사용완료</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleUseCoupon(coupon.id)}
                                  className="w-full py-2.5 bg-gradient-to-r from-sunflower-yellow to-sunflower-yellow/80 hover:shadow-glow text-white font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
                                >
                                  사용하기
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/50 rounded-2xl">
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="text-xs text-text-secondary">아직 받은 보상이 없어요</p>
                      <p className="text-xs text-text-secondary mt-1">열심히 토론하면 받을 수 있어요!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측: 주제 선택 영역 */}
            <div className="lg:col-span-3 min-w-0">
              {/* 섹션 타이틀 */}
              <div className="mb-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-soft border border-border">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-text-secondary" style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>1단계: 주제 선택</span>
                </div>
              </div>
              
              {/* 카테고리 탭 */}
              {/* 탭 모드 버튼 - 모바일 최적화 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                <button
                  onClick={() => setTabMode('random')}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                    tabMode === 'random'
                      ? 'bg-gradient-primary text-white shadow-medium sm:scale-105'
                      : 'bg-white text-text-secondary hover:bg-muted shadow-soft'
                  }`}
                  style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}
                >
                  <div className="flex items-center justify-center gap-2 min-w-0">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>랜덤 주제</span>
                  </div>
                </button>
                <button
                  onClick={() => setTabMode('teacher')}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                    tabMode === 'teacher'
                      ? 'bg-gradient-secondary text-white shadow-medium sm:scale-105'
                      : 'bg-white text-text-secondary hover:bg-muted shadow-soft'
                  }`}
                  style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}
                >
                  <div className="flex items-center justify-center gap-2 min-w-0">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>선생님 주제</span>
                  </div>
                </button>
              </div>

              {/* 주제 카드 그리드 - 데스크톱 고정 레이아웃 */}
              {tabMode === 'random' ? (
                <div className="grid grid-cols-3 gap-6">
                  {randomTopics.map((topic, index) => {
                    const config = difficultyConfig[topic.difficulty || 'medium'];
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectTopic(topic)}
                        className="group bg-white rounded-3xl p-6 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 text-left border border-border overflow-hidden relative w-full min-w-0 min-h-[200px]"
                        style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                      >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 flex flex-col h-full min-w-0">
                          {/* 난이도 뱃지 */}
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.color} rounded-full mb-4 shadow-soft self-start`}>
                            <span className="text-sm">{config.icon}</span>
                            <span className={`text-sm font-bold ${config.textColor}`} style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>{config.label}</span>
                          </div>

                          {/* 주제명 */}
                          <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-primary transition-colors" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                            {topic.title}
                          </h3>

                          {/* 설명 */}
                          <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{topic.description}</p>

                          {/* CTA 버튼 */}
                          <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                            <span style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>토론하기</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* 랜덤 주제 생성 버튼 */}
                  <button
                    onClick={handleSelectRandomTopic}
                    className="group bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 text-center border-2 border-dashed border-primary/30 hover:border-primary/60 w-full min-w-0 min-h-[200px]"
                    style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-medium flex-shrink-0">
                        <Shuffle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2" style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>랜덤 주제</h3>
                      <p className="text-sm text-text-secondary" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>랜덤으로 주제 선택하기</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {topics.length > 0 ? (
                    topics.map((topic) => {
                      const config = difficultyConfig[topic.difficulty || 'medium'];
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleSelectTopic(topic)}
                          className="group bg-white rounded-3xl p-6 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 text-left border border-border overflow-hidden relative w-full min-w-0 min-h-[200px]"
                          style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                        >
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10 flex flex-col h-full min-w-0">
                            {/* 난이도 뱃지 */}
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${config.color} rounded-full mb-4 shadow-soft self-start`}>
                              <span className="text-sm">{config.icon}</span>
                              <span className={`text-sm font-bold ${config.textColor}`} style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>{config.label}</span>
                            </div>

                            {/* 주제명 */}
                            <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-secondary transition-colors" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                              {topic.title}
                            </h3>

                            {/* 설명 */}
                            <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{topic.description}</p>

                            {/* CTA 버튼 */}
                            <div className="flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                              <span style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>토론하기</span>
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="w-full text-center py-20">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-bold text-text-primary mb-2" style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>아직 등록된 주제가 없어요</h3>
                      <p className="text-text-secondary" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word', whiteSpace: 'normal' }}>선생님이 주제를 추가하면 여기에 표시됩니다</p>
                    </div>
                  )}
                </div>
              )}

              {/* 나의 보상 상자 - 큰 섹션 */}
              {coupons.length > 0 && (
                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-3xl p-8 shadow-medium border border-accent/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-soft">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-text-primary">나의 보상 상자</h2>
                          <p className="text-sm text-text-secondary">열심히 토론한 당신을 위한 보상이에요!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-5 py-3 bg-accent rounded-full shadow-soft">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="text-xl font-bold text-white">{coupons.length}개</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {coupons.map((coupon, index) => {
                        // Determine coupon name and description
                        let couponName = '';
                        let couponDescription = '';
                        
                        if (coupon.couponType === 'custom') {
                          couponName = coupon.customName || '커스텀 쿠폰';
                          couponDescription = coupon.customDescription || '';
                        } else if (coupon.couponType) {
                          const couponTypes: Record<string, { name: string; description: string }> = {
                            'seat-change': { name: '자리 바꾸기 1회권', description: '원하는 자리로 이동' },
                            'hint-card': { name: '원하는 음악 친구들과 함께듣기 권', description: '점심시간 음악 선곡' },
                            'nomination': { name: '숙제 지목권', description: '숙제 검사 면제' },
                            'penalty-pass': { name: '급식먼저먹기 권', description: '급식 줄서기 면제' }
                          };
                          const type = couponTypes[coupon.couponType];
                          couponName = type?.name || '보상 쿠폰';
                          couponDescription = type?.description || '';
                        } else {
                          couponName = coupon.message || '보상 쿠폰';
                        }

                        return (
                          <div
                            key={coupon.id}
                            className={`group rounded-2xl p-5 shadow-soft transition-all duration-300 border ${
                              coupon.used
                                ? 'bg-gray-100/80 backdrop-blur-sm border-gray-200 opacity-70'
                                : 'bg-white/80 backdrop-blur-sm hover:shadow-medium hover:-translate-y-1 border-accent/10 hover:border-accent/30'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft transition-transform ${
                                coupon.used
                                  ? 'bg-gray-300 text-gray-500'
                                  : 'bg-gradient-accent text-white group-hover:scale-110'
                              }`}>
                                <Award className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold mb-1 line-clamp-2 ${
                                  coupon.used ? 'text-gray-500' : 'text-text-primary'
                                }`}>
                                  {couponName}
                                </h3>
                                {couponDescription && (
                                  <p className="text-xs text-text-secondary mb-2">
                                    {couponDescription}
                                  </p>
                                )}
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  정산시각 유약 선구 {new Date(coupon.createdAt).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-accent/10">
                              {coupon.used ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500">사용완료</span>
                                  </div>
                                  {coupon.usedAt && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(coupon.usedAt).toLocaleDateString('ko-KR', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleUseCoupon(coupon.id)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-accent text-white rounded-full hover:shadow-glow transition-all font-semibold"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  사용하기
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
