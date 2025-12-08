"use client";

import React, { useState } from "react";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import GamifiedCard from "@/shared/components/GamifiedCard";
import { useStudentRewards } from "@/shared/hooks/useRewards";
import { useStudentGamificationStats } from "@/shared/hooks/useStudentGamificationStats";
import { ICONS } from "@/constants/icons";
import { useRouter } from "next/navigation";

export default function StudentRewardsPage() {
  const router = useRouter();
  const { stats } = useStudentGamificationStats();
  const { availableRewards, myRequests, requestReward, loading } = useStudentRewards();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleRequest = async (reward: any) => { // using any for quick mock type compat if needed, but preferred stricter
    if (confirm(`'${reward.name}'을(를) ${reward.cost} TC에 교환 신청할까요?`)) {
      setProcessing(reward.id);
      await requestReward(reward);
      alert("신청되었습니다! 선생님이 승인하면 코인이 차감됩니다.");
      setProcessing(null);
    }
  };

  if (loading || !stats) return <div style={{ padding: "40px", textAlign: "center" }}>보상 목록을 불러오고 있어요... 🎁</div>;

  return (
    <DashboardLayout role="student" userName="학생">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>토론 코인 교환소 🪙</h2>
        <div style={{ background: "rgba(251, 191, 36, 0.15)", padding: "10px 20px", borderRadius: "30px", border: "1px solid #fbbf24", color: "#fbbf24", fontWeight: 800 }}>
          내가 가진 코인: {stats.coins.toLocaleString()} TC
        </div>
      </div>

      <p style={{ marginBottom: "24px", color: "var(--ms-text-muted)" }}>
        모은 코인으로 원하는 보상으로 교환해 보세요! 선생님의 승인이 필요합니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {availableRewards.map(reward => {
             const canAfford = stats.coins >= reward.cost;
             return (
               <GamifiedCard key={reward.id} title={reward.name} variant="normal">
                  <p style={{ color: "var(--ms-text-muted)", fontSize: "0.95rem", minHeight: "40px", marginBottom: "12px" }}>
                    {reward.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: canAfford ? "#fbbf24" : "var(--ms-text-muted)" }}>
                        {reward.cost} TC
                    </span>
                    <button 
                        className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`} 
                        disabled={!canAfford || processing === reward.id}
                        onClick={() => handleRequest(reward)}
                        style={{ opacity: canAfford ? 1 : 0.5 }}
                    >
                        {processing === reward.id ? '신청 중...' : '교환 신청'}
                    </button>
                  </div>
               </GamifiedCard>
             );
        })}
      </div>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>나의 교환 신청 내역</h3>
      <div style={{ background: "var(--ms-surface)", borderRadius: "12px", padding: "20px", border: "1px solid var(--ms-border)" }}>
        {myRequests.length === 0 ? (
            <p style={{ color: "var(--ms-text-muted)", textAlign: "center" }}>아직 신청한 내역이 없어요.</p>
        ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myRequests.map(req => {
                    let statusColor = "#fbbf24"; // pending
                    let statusText = "승인 대기 중";
                    if (req.status === "approved") { statusColor = "#10b981"; statusText = "승인됨 (사용 가능)"; }
                    if (req.status === "rejected") { statusColor = "#ef4444"; statusText = "거절됨"; }

                    return (
                        <li key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--ms-border-subtle)", paddingBottom: "10px" }}>
                            <div>
                                <span style={{ fontWeight: 600 }}>{req.rewardName}</span>
                                <span style={{ fontSize: "0.85rem", color: "var(--ms-text-muted)", marginLeft: "8px" }}>
                                    ({new Date(req.requestedAt).toLocaleDateString()})
                                </span>
                            </div>
                            <span style={{ fontSize: "0.9rem", color: statusColor, fontWeight: 600 }}>
                                {statusText}
                            </span>
                        </li>
                    );
                })}
            </ul>
        )}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button className="text-btn" onClick={() => router.push('/student/home')}>
             ← 대시보드로 돌아가기
        </button>
      </div>

    </DashboardLayout>
  );
}
