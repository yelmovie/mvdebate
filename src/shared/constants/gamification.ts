import { DebateStyleType } from "../types/gamification";

export const STYLE_BADGE_MAP: Record<DebateStyleType, { label: string; color: string }> = {
  logical: { label: "🧠 논리왕", color: "#3b82f6" },
  empathetic: { label: "🤝 배려형 토론가", color: "#10b981" },
  funny: { label: "😂 유머러스 스피커", color: "#f59e0b" },
  sharp: { label: "🎯 핵심저격수", color: "#ef4444" },
  starter: { label: "🏃‍♂️ 빠른 스타터", color: "#8b5cf6" },
};

import { TeacherReward } from "../types/gamification";

export const DEFAULT_TEACHER_REWARDS: Omit<TeacherReward, 'id' | 'teacherId'>[] = [
  {
    type: 'HOMEWORK_PASS',
    name: '하루 과제 면제권',
    description: '오늘의 과제를 한번 건너뛸 수 있어요.',
    cost: 80,
    active: true
  },
  {
    type: 'LUNCH_FIRST',
    name: '급식실 1등으로 먹기',
    description: '오늘 점심시간에 가장 먼저 줄을 설 수 있어요.',
    cost: 60,
    active: true
  },
  {
    type: 'DUTY_SKIP',
    name: '1인 1역 면제권',
    description: '오늘의 청소나 당번 활동을 쉴 수 있어요.',
    cost: 50,
    active: true
  }
];
