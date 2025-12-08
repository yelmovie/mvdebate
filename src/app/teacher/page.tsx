"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import type { StudentStatus } from "../../lib/memoryStore";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [statuses, setStatuses] = useState<Record<number, StudentStatus>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStatuses = async () => {
    try {
      const res = await fetch("/api/teacher/students");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.students);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  };

  // Auth Protection
  useEffect(() => {
    if (!loading) {
       if (!user) {
         // Not logged in -> Redirect to home
         router.push("/");
         return;
       }
       // If logged in but not a teacher? (Optional strict check, but user might be loading profile)
       if (profile && 'role' in profile && profile.role !== "teacher") {
          router.push("/");
       }
    }
  }, [user, profile, loading, router]);

  // Polling
  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate numbers 1 to 30
  const studentNumbers = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <main className="teacher-dashboard">
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <Link href="/" style={{ textDecoration: 'none', color: 'var(--ms-text-muted)', fontSize: 14 }}>
             ← 홈으로 돌아가기
           </Link>
           <h1 style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>👨‍🏫 실시간 토론 현황판</h1>
           <p style={{ color: "var(--ms-text-muted)", fontSize: 14 }}>
             학생들이 <strong>'1번 학생'</strong> 등으로 닉네임을 설정하고 토론을 시작하면 이곳에 표시됩니다.
           </p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span style={{ fontSize: 12, color: "var(--ms-text-muted)" }}>
             마지막 업데이트: {lastUpdated}
           </span>
           <button 
             onClick={() => fetchStatuses()} 
             className="btn btn-secondary"
             style={{ marginLeft: 12, padding: "6px 12px", fontSize: 13 }}
           >
             새로고침
           </button>
        </div>
      </header>

      <div className="student-grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
        gap: 16 
      }}>
        {studentNumbers.map((num) => {
          const status = statuses[num];
          const isActive = !!status;
          
          let cardStyle = {
            border: "1px solid var(--ms-border-subtle)",
            borderRadius: "12px",
            padding: "16px",
            background: "var(--ms-surface)",
            minHeight: "140px",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            opacity: isActive ? 1 : 0.6,
            boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          };
          
          let statusColor = "#9ca3af"; // Gray
          let statusText = "대기중";
          let statusBg = "var(--ms-bg)";

          if (isActive) {
            const lastActiveTime = new Date(status.lastActive).getTime();
            const now = new Date().getTime();
            const isOnline = (now - lastActiveTime) < 60000; // 1 min timeout

            if (status.turnCount >= 20) {
              statusColor = "#3b82f6"; // Blue
              statusText = "토론 완료";
              statusBg = "rgba(59, 130, 246, 0.1)";
            } else if (status.turnCount > 0) {
              statusColor = "#10b981"; // Green
              statusText = "토론 진행중";
              statusBg = "rgba(16, 185, 129, 0.1)";
            } else {
              statusColor = "#f59e0b"; // Yellow
              statusText = "준비중";
              statusBg = "rgba(245, 158, 11, 0.1)";
            }

            if (!isOnline && status.turnCount < 20) {
               statusText = "오프라인";
               statusColor = "#6b7280";
               statusBg = "rgba(107, 114, 128, 0.1)";
            }
          }

          return (
            <div key={num} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                        fontSize: 18, 
                        fontWeight: "bold",
                        color: isActive ? "var(--ms-text)" : "var(--ms-text-muted)"
                    }}>
                      {num}번
                    </span>
                    {isActive && status.name && (
                      <span style={{ fontSize: 14, color: "var(--ms-text-muted)" }}>
                        {status.name.replace(/^\d+번\s*/, '')}
                      </span>
                    )}
                 </div>
                 <span style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    color: statusColor,
                    backgroundColor: statusBg
                 }}>
                   {statusText}
                 </span>
              </div>
              
              {isActive ? (
                <div style={{ fontSize: 13 }}>
                  <div style={{ marginBottom: 4, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={status.topic}>
                    {status.topic || "주제 선택 중"}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: "var(--ms-text-muted)" }}>
                    <span>{status.stance === "pro" ? "찬성" : status.stance === "con" ? "반대" : "-"}</span>
                    <span>{status.turnCount} 턴</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--ms-text-muted)", height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
