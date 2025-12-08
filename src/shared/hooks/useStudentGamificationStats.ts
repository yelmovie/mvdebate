import { useState, useEffect } from 'react';
import { StudentGamificationStats } from '../types/gamification';

const MOCK_STATS: StudentGamificationStats = {
  streakDays: 4,
  bestStreakDays: 12,
  levelName: '초보 토론가',
  levelNumber: 2,
  currentXP: 340,
  nextLevelXP: 500,
  coins: 1250,
  styleType: 'logical',
  weeklyParticipations: 4,
  avgArgumentsPerDebate: 3.5,
  dailyMissions: [
    { id: 'm1', text: '토론 1회 완료하기', completed: true },
    { id: 'm2', text: '근거 3개 이상 말하기', completed: false },
    { id: 'm3', text: 'AI에게 질문하기', completed: false },
  ],
  praiseMessage: "오늘 너의 목소리는 자신감이 있었어 👏",
  nextChallenge: "다음에는 논거를 하나 더 말해볼까?"
};

export function useStudentGamificationStats() {
  const [stats, setStats] = useState<StudentGamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
}
