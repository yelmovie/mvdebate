"use client";

import React from "react";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import { MOCK_STUDENT_DATA } from "@/lib/mockDashboardData";
import { useStudentGamificationStats } from "@/shared/hooks/useStudentGamificationStats";
import { StreakCard, LevelCard, CoinsCard, StyleBadgeCard, DailyMissionsCard, PraiseCard, NextChallengeCard } from "@/shared/components/GamificationCards";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentHomePage() {
  const router = useRouter();
  const data = MOCK_STUDENT_DATA; 
  const { stats: gameStats } = useStudentGamificationStats();

  return (
    <DashboardLayout role="student" userName={data.name}>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* 1. 오늘의 토론 (Existing) */}
        <DashboardCard 
            title="오늘의 토론" 
            theme="highlight"
            actionButton={
                <span style={{ 
                    fontSize: "0.85rem", 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    background: data.todayTopic.status === "completed" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.2)",
                    color: data.todayTopic.status === "completed" ? "#34d399" : "#fff" 
                }}>
                    {data.todayTopic.status === "completed" ? "완료 ✅" : "미완료"}
                </span>
            }
        >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                    <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px", lineHeight: "1.6" }}>
                        Q. {data.todayTopic.title}
                    </p>
                    <p style={{ color: "var(--ms-text-muted)", fontSize: "0.95rem" }}>
                        {data.todayTopic.status === "completed" 
                            ? "오늘 1회 연습 완료! 정말 잘했어요." 
                            : "오늘 아직 연습하지 않았어요."}
                    </p>
                </div>
                
                <button 
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "20px" }}
                    onClick={() => router.push("/debate")}
                >
                    {data.todayTopic.status === "completed" ? "다시 연습하기" : "토론 연습 시작하기"}
                </button>
            </div>
        </DashboardCard>

        {/* Gamification Cards */}
        {gameStats && (
          <>
            <StreakCard streakDays={gameStats.streakDays} bestStreakDays={gameStats.bestStreakDays} />
            <LevelCard 
              levelName={gameStats.levelName} 
              levelNumber={gameStats.levelNumber} 
              currentXP={gameStats.currentXP} 
              nextLevelXP={gameStats.nextLevelXP} 
            />
            <CoinsCard coins={gameStats.coins} onClick={() => router.push('/student/rewards')} />
            <StyleBadgeCard styleType={gameStats.styleType} />
            <DailyMissionsCard missions={gameStats.dailyMissions} />
            <PraiseCard message={gameStats.praiseMessage} />
            <NextChallengeCard challenge={gameStats.nextChallenge} />
          </>
        )}
      </div>

      <div style={{ opacity: 0.5 }}>
         {/* Hidden Legacy Content for Reference if needed, or remove completely. Keeping Notice only. */}
         <DashboardCard title="공지사항 📢">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.notices.length > 0 ? data.notices.map(notice => (
                    <li key={notice.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", cursor: "pointer", borderBottom: "1px solid var(--ms-border-subtle)", paddingBottom: "8px" }}>
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{notice.title}</span>
                        <span style={{ color: "var(--ms-text-muted)", fontSize: "0.85rem", marginLeft: "10px" }}>{notice.date.slice(5)}</span>
                    </li>
                )) : (
                    <li style={{ color: "var(--ms-text-muted)" }}>새로운 공지가 없습니다.</li>
                )}
            </ul>
         </DashboardCard>
      </div>

      <style jsx>{`
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1rem;
        }
        .stat-label {
            color: var(--ms-text-muted);
        }
        .stat-value {
            font-weight: 600;
            color: var(--ms-primary);
        }
        .text-btn {
            font-size: 0.9rem;
            color: var(--ms-text-muted);
            text-decoration: underline;
            cursor: pointer;
        }
        .flame-animation {
            animation: pulse 1.5s infinite;
            font-size: 1.2rem;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  );
}
