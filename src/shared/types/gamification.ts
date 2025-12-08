export type DebateStyleType = 'logical' | 'empathetic' | 'funny' | 'sharp' | 'starter';

export interface StudentGamificationStats {
  streakDays: number;
  bestStreakDays: number;
  levelName: string;
  levelNumber: number;
  currentXP: number;
  nextLevelXP: number;
  coins: number;
  styleType: DebateStyleType;
  weeklyParticipations: number;
  avgArgumentsPerDebate: number;
  dailyMissions: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  praiseMessage: string;
  nextChallenge: string;
}

export type RewardType = 'HOMEWORK_PASS' | 'LUNCH_FIRST' | 'DUTY_SKIP' | 'CUSTOM';

export interface TeacherReward {
  id: string;
  teacherId: string;
  type: RewardType;
  name: string;
  description: string;
  cost: number;
  active: boolean;
}

export interface RewardRequest {
  id: string;
  studentId: string;
  studentName: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}
