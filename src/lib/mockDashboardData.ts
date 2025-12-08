export interface StudentDashboardStats {
  name: string;
  todayTopic: {
    title: string;
    status: "not_started" | "completed";
    myStance: "pro" | "con" | null;
  };
  stats: {
    weeklyParticipations: number;
    avgArgumentsPerDebate: number;
    usedExpressionsCount: number;
  };
  level: {
    levelName: string;
    levelNumber: number;
    streakDays: number;
    recentBadges: Array<{ id: number; name: string; iconEmoji: string }>;
  };
  notices: Array<{ id: number; title: string; date: string }>;
  todaySentence: {
    english: string;
    korean: string;
    id: string;
  };
}

export interface TeacherDashboardStats {
  name: string;
  participation: {
    totalStudents: number;
    todayParticipants: number;
    todayDebatesCount: number;
    weeklyTotalSessions: number;
  };
  todayTopics: Array<{ title: string; class: string; pro: number; con: number }>;
  notices: Array<{ id: number; title: string; views: number }>;
  alerts: {
    newReports: number;
    flagged: number;
  };
  schedule: Array<{ id: number; time: string; event: string }>;
}

export const MOCK_STUDENT_DATA: StudentDashboardStats = {
  name: "예리",
  todayTopic: {
    title: "학교 급식에 채식 메뉴를 의무화해야 한다",
    status: "not_started",
    myStance: null
  },
  stats: {
    weeklyParticipations: 4,
    avgArgumentsPerDebate: 3.5,
    usedExpressionsCount: 12
  },
  level: {
    levelName: "초보 토론가",
    levelNumber: 2,
    streakDays: 4, // Streak > 3 for animation
    recentBadges: [
      { id: 1, name: "달변가", iconEmoji: "🗣️" },
      { id: 2, name: "열정왕", iconEmoji: "🔥" },
      { id: 3, name: "지식인", iconEmoji: "📚" }
    ]
  },
  notices: [
    { id: 1, title: "이번 주 토론 주제 안내", date: "2024-12-07" },
    { id: 2, title: "시스템 점검 안내", date: "2024-12-05" },
    { id: 3, title: "우수 토론자 시상 결과", date: "2024-12-01" }
  ],
  todaySentence: {
    english: "I agree with you, but I think...",
    korean: "네 말에 동의해. 하지만 내 생각엔...",
    id: "sent_001"
  }
};

export const MOCK_TEACHER_DATA: TeacherDashboardStats = {
  name: "김선생님",
  participation: {
    totalStudents: 60,
    todayParticipants: 48, // 80% (Grean zone)
    todayDebatesCount: 52,
    weeklyTotalSessions: 128
  },
  todayTopics: [
    { title: "학교 급식 채식 의무화", class: "3-1", pro: 15, con: 12 },
    { title: "AI 숙제 도우미 허용", class: "3-2", pro: 20, con: 8 }
  ],
  notices: [
    { id: 1, title: "수행평가 기준 안내", views: 45 },
    { id: 2, title: "가정통신문 발송", views: 32 },
    { id: 3, title: "겨울방학 일정", views: 28 }
  ],
  alerts: {
    newReports: 5,
    flagged: 2 // Needs review
  },
  schedule: [
    { id: 1, time: "10:00", event: "3-1반 실전 토론" },
    { id: 2, time: "14:00", event: "3-2반 실전 토론" }
  ]
};
