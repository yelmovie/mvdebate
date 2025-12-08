import React from 'react';
import { ICONS } from "@/constants/icons";
import GamifiedCard from "./GamifiedCard";
import { StudentGamificationStats } from "@/shared/types/gamification";
import { STYLE_BADGE_MAP } from "@/shared/constants/gamification";

// 1. Streak Card
export function StreakCard({ streakDays, bestStreakDays }: { streakDays: number, bestStreakDays: number }) {
  const isGlowing = streakDays >= 3;
  return (
    <GamifiedCard title="연속 참여" iconClassName={`${ICONS.STREAK} ${isGlowing ? 'icon-pulse' : ''}`} highlight={isGlowing} variant={isGlowing ? 'rose' : 'normal'}>
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>
        {streakDays}일 <span style={{ fontSize: "1rem", fontWeight: 400, opacity: 0.8 }}>연속</span>
      </div>
      <div style={{ fontSize: "0.9rem", color: "var(--ms-text-muted)", marginTop: "4px" }}>
        최고 기록: {bestStreakDays}일
      </div>
      <style jsx>{`
        .icon-pulse { animation: pulse 1.5s infinite; color: #ef4444 !important; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </GamifiedCard>
  );
}

// 2. Level Card
export function LevelCard({ levelName, levelNumber, currentXP, nextLevelXP }: Pick<StudentGamificationStats, 'levelName' | 'levelNumber' | 'currentXP' | 'nextLevelXP'>) {
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);
  return (
    <GamifiedCard title="나의 레벨" iconClassName={ICONS.LEVEL}>
      <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
        {levelName} Lv.{levelNumber}
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
        <div style={{ width: `${progress}%`, background: "var(--ms-primary)", height: "100%" }} />
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--ms-text-muted)" }}>
        다음 레벨까지 {nextLevelXP - currentXP} XP
      </div>
    </GamifiedCard>
  );
}

// 3. Coins Card
export function CoinsCard({ coins, onClick }: { coins: number; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default", height: "100%" }}>
      <GamifiedCard title="토론 코인" iconClassName={ICONS.COINS} highlight={false} variant="gold">
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fbbf24" }}>
          {coins.toLocaleString()} TC
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--ms-text-muted)" }}>
          보상 교환소 바로가기 →
        </div>
      </GamifiedCard>
    </div>
  );
}

// 4. Style Badge Card
export function StyleBadgeCard({ styleType }: { styleType: StudentGamificationStats['styleType'] }) {
  const badge = STYLE_BADGE_MAP[styleType];
  return (
    <GamifiedCard title="나의 스타일" iconClassName={ICONS.STYLE_BADGE}>
      <div className="badge-pop" style={{ 
        background: badge.color, 
        color: "white", 
        padding: "8px 16px", 
        borderRadius: "20px", 
        textAlign: "center",
        fontWeight: 700,
        display: "inline-block",
        marginTop: "4px"
      }}>
        {badge.label}
      </div>
      <style jsx>{`
        .badge-pop { animation: pop 0.5s ease-out; }
        @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </GamifiedCard>
  );
}

// 5. Daily Missions Card
export function DailyMissionsCard({ missions }: { missions: StudentGamificationStats['dailyMissions'] }) {
  return (
    <GamifiedCard title="오늘의 미션" iconClassName={ICONS.MISSIONS}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {missions.map(m => (
          <li key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", opacity: m.completed ? 0.6 : 1 }}>
            <span style={{ color: m.completed ? "var(--ms-primary)" : "var(--ms-text-muted)" }}>
              <i className={m.completed ? "fa-solid fa-check-circle" : "fa-regular fa-circle"} />
            </span>
            <span style={{ textDecoration: m.completed ? "line-through" : "none", fontSize: "0.95rem" }}>
              {m.text}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ fontSize: "0.8rem", color: "var(--ms-text-muted)", marginTop: "12px" }}>
        미션 완료하고 XP 받기!
      </div>
    </GamifiedCard>
  );
}

// 6. Praise Card
export function PraiseCard({ message }: { message: string }) {
  return (
    <GamifiedCard title="오늘의 칭찬" iconClassName={ICONS.PRAISE} highlight>
      <div style={{ fontSize: "1.1rem", fontStyle: "italic", lineHeight: "1.5" }}>
        "{message}"
      </div>
    </GamifiedCard>
  );
}

// 7. Next Challenge Card
export function NextChallengeCard({ challenge }: { challenge: string }) {
  return (
    <GamifiedCard title="다음 도전 목표" iconClassName={ICONS.NEXT_CHALLENGE}>
       <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ms-primary)" }}>
         {challenge}
       </div>
    </GamifiedCard>
  );
}
