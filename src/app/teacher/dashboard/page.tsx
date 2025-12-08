"use client";

import React from "react";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { 
    getTeacherClasses, 
    getDashboardSummary, 
    getTeacherNotices, 
    getTeacherSchedules, 
    getTeacherReports,
    subscribeToClassStudents,
    updateClassTopic
} from "@/services/teacherService";
import { ClassInfo, Notice, Schedule, DashboardSummary } from "@/types/schema";
import TeacherEmailSettings from "@/components/teacher/TeacherEmailSettings";
import DataExportSection from "@/components/exports/DataExportSection";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { teacherProfile, user, loading: authLoading, getTeacherDisplayName } = useAuth(); 
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  
  // Stats from DashboardSummary (Cost Safe)
  const [stats, setStats] = useState<DashboardSummary>({
      id: "loading",
      teacherId: "",
      classCode: "",
      todayCompletedDebates: 0,
      weekCompletedDebates: 0,
      todayParticipants: 0,
      totalStudents: 0,
      lastUpdatedAt: ""
  });
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reportStats, setReportStats] = useState({ newReports: 0, flagged: 0 });
  
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user) {
        getTeacherClasses(user.uid).then(cls => {
            setClasses(cls);
            if (cls.length > 0) setCurrentClass(cls[0]);
        });
    }
  }, [user]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (currentClass && user) {
        setLoadingData(true);
        
        // Parallel Fetch (Optimized)
        Promise.all([
            getDashboardSummary(currentClass.code),
            getTeacherNotices(user.uid, currentClass.code, 3), // Top 3
            getTeacherSchedules(user.uid, currentClass.code),
            getTeacherReports(user.uid) // We fetch reports to count status. (Ideally, count should be in summary too, but this is acceptable for now)
        ]).then(([dStats, dNotices, dSchedules, dReports]) => {
            setStats(dStats);
            setNotices(dNotices);
            
            // Filter Schedules for This Week
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const day = today.getDay() || 7; 
            const monday = new Date(today);
            monday.setDate(today.getDate() - day + 1);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59);

            const weeklySchedules = dSchedules.filter(s => {
                const d = new Date(s.dateTime);
                return d >= monday && d <= sunday;
            });
            setSchedules(weeklySchedules);

            // Calc Report Stats
            const newCount = dReports.filter(r => r.status === 'new').length;
            const reviewCount = dReports.filter(r => r.status === 'needs_review').length;
            setReportStats({ newReports: newCount, flagged: reviewCount });

        }).catch(err => {
            console.error("Dashboard Fetch Error", err);
        }).finally(() => {
            setLoadingData(false);
        });
    }
  }, [currentClass, user]);

  const teacherName = authLoading ? "..." : getTeacherDisplayName(); 

  // Participation Rate Logic
  const participationRate = stats.totalStudents > 0 
    ? Math.round((stats.todayParticipants / stats.totalStudents) * 100) 
    : 0;
  
  let rateColor = "var(--ms-rose)";
  let rateMessage = "참여 독려가 필요해요. 🥺";
  let rateBg = "rgba(244, 63, 94, 0.1)";

  if (participationRate >= 80) {
    rateColor = "var(--ms-green)";
    rateMessage = "아주 활발한 참여예요! 👏";
    rateBg = "rgba(16, 185, 129, 0.1)";
  } else if (participationRate >= 50) {
    rateColor = "var(--ms-yellow)";
    rateMessage = "좋아요, 조금만 더 참여를 이끌어주세요. 💪";
    rateBg = "rgba(245, 158, 11, 0.1)";
  }

  const displayValue = (val: number) => loadingData ? "-" : val;
  
  const formatTime = (iso: string) => {
      const d = new Date(iso);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout 
        role="teacher" 
        userName={teacherName} 
        layoutMode="custom"
        classInfo={currentClass ? {
            name: (currentClass.schoolName || "") + (currentClass.grade ? ` ${currentClass.grade}학년` : "") + (currentClass.classNumber ? ` ${currentClass.classNumber}반` : " 나의 반"),
            code: currentClass.code
        } : null}
    >
      
      <div className="pc-dashboard-container">
        
        {/* Row 1: Participation & Shortcuts */}
        <div className="dashboard-row top-row">
            <div className="flex-1">
                <DashboardCard title="오늘의 참여 현황 📊" theme="highlight">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                                <span style={{ fontSize: "3rem", fontWeight: "800", color: rateColor }}>
                                    {displayValue(participationRate)}%
                                </span>
                                <span style={{ fontSize: "1rem", color: "var(--ms-text-muted)" }}>
                                    ({displayValue(stats.todayParticipants)}/{displayValue(stats.totalStudents)}명)
                                </span>
                            </div>
                            <div style={{ 
                                padding: "8px 16px", 
                                background: rateBg, 
                                color: rateColor, 
                                borderRadius: "20px",
                                display: "inline-block",
                                fontWeight: 600,
                                fontSize: "0.95rem"
                            }}>
                                {rateMessage}
                            </div>
                        </div>
                        
                        <div style={{ display: "flex", gap: "20px" }}>
                            <div className="mini-stat">
                                <span className="label">오늘 완료된 토론</span>
                                <span className="value">{displayValue(stats.todayCompletedDebates)}건</span>
                            </div>
                            <div className="mini-stat">
                                <span className="label">이번 주 누적</span>
                                <span className="value">{displayValue(stats.weekCompletedDebates)}건</span>
                            </div>
                        </div>
                    </div>
                </DashboardCard>
            </div>

            <div className="shortcut-card-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 {/* Common Topic Setter */}
                <DashboardCard title="오늘의 공통 주제 📌" theme="highlight">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                         {currentClass?.commonTopic ? (
                             <div style={{ marginBottom: '12px' }}>
                                 <p style={{ fontSize: '0.9rem', color: 'var(--ms-text-muted)', marginBottom: '4px' }}>현재 설정된 주제</p>
                                 <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--ms-primary)' }}>
                                     {currentClass.commonTopic.title}
                                 </p>
                                 <p style={{ fontSize: '0.8rem', color: 'var(--ms-text-muted)', marginTop: '4px' }}>
                                     설정일: {new Date(currentClass.commonTopic.updatedAt).toLocaleDateString()}
                                 </p>
                             </div>
                         ) : (
                             <p style={{ color: 'var(--ms-text-muted)', marginBottom: '16px' }}>
                                 아직 설정된 공통 주제가 없습니다.
                             </p>
                         )}
                         
                         <button 
                            className="btn btn-primary"
                            onClick={() => {
                                const newTopic = prompt("학생들이 토론할 공통 주제를 입력해주세요:", currentClass?.commonTopic?.title || "");
                                if (newTopic && newTopic.trim() && currentClass) {
                                    updateClassTopic(currentClass.code, newTopic.trim())
                                        .then(() => {
                                            alert("공통 주제가 설정되었습니다!");
                                            // Optimistic update or reload
                                            setClasses(prev => prev.map(c => 
                                                c.code === currentClass.code 
                                                ? { ...c, commonTopic: { title: newTopic.trim(), updatedAt: new Date().toISOString() } }
                                                : c
                                            ));
                                            setCurrentClass(prev => prev ? { ...prev, commonTopic: { title: newTopic.trim(), updatedAt: new Date().toISOString() } } : null);
                                        })
                                        .catch(err => alert("주제 설정 실패: " + err));
                                }
                            }}
                         >
                            {currentClass?.commonTopic ? "주제 변경하기" : "공통 주제 설정하기"}
                         </button>
                    </div>
                </DashboardCard>

                <DashboardCard title="바로가기">
                    <div className="shortcut-layout">
                        <button className="shortcut-btn" onClick={() => router.push('/teacher/rewards')}>
                                🎁 보상/쿠폰 <br/> 관리
                        </button>
                        <button className="shortcut-btn" onClick={() => router.push('/teacher/manage')}>
                                📜 토론 주제/ <br/> 학생 관리
                        </button>
                    </div>
                </DashboardCard>
            </div>
        </div>

        {/* Row 2: Grid (Alerts, Notices, Schedule) */}
        <div className="dashboard-grid-bottom">
            {/* Alerts */}
            <DashboardCard title="알림 & 피드백 🔔">
                 {(reportStats.newReports === 0 && reportStats.flagged === 0) ? (
                     <div style={{ padding: "20px 0", textAlign: "center", color: "var(--ms-text-muted)" }}>
                        새 리포트가 없습니다.
                     </div>
                 ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        <div className="alert-item" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
                            <span className="icon">📝</span>
                            <span>새로운 AI 리포트 <strong>{reportStats.newReports}건</strong>이 도착했어요.</span>
                        </div>
                        {reportStats.flagged > 0 && (
                            <div className="alert-item" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}>
                                <span className="icon">⚠️</span>
                                <span>검토가 필요한 발언이 <strong>{reportStats.flagged}건</strong> 감지되었어요.</span>
                            </div>
                        )}
                    </div>
                 )}
                <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }} onClick={() => router.push("/teacher/reports")}>
                    리포트 확인하기
                </button>
            </DashboardCard>
            
            {/* Notices */}
            <DashboardCard title="최근 공지사항 📢">
                 {notices.length === 0 ? (
                     <div style={{ padding: "20px 0", textAlign: "center", color: "var(--ms-text-muted)" }}>
                        등록된 공지사항이 없습니다.
                     </div>
                 ) : (
                    <ul style={{ listStyle: "none", padding: 0, gap: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                        {notices.map(n => (
                            <li key={n.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderBottom: '1px solid var(--ms-border-subtle)', paddingBottom: '8px' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                                <span style={{ color: "var(--ms-text-muted)", fontSize: "0.8rem", minWidth: "fit-content", marginLeft: "8px" }}>
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                 )}
                <button className="btn btn-secondary" style={{ width: "100%", marginTop: "16px" }} onClick={() => router.push("/teacher/notices/new")}>
                    새 공지 작성
                </button>
            </DashboardCard>
            
            {/* Schedule */}
            <DashboardCard title="이번 주 일정 🗓️">
                 {schedules.length === 0 ? (
                     <div style={{ padding: "20px 0", textAlign: "center", color: "var(--ms-text-muted)" }}>
                        이번 주 예정된 일정이 없습니다.
                     </div>
                 ) : (
                    <ul style={{ listStyle: "none", padding: 0, gap: "12px", display: "flex", flexDirection: "column" }}>
                        {schedules.map(s => (
                            <li key={s.id} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <div style={{ background: "var(--ms-surface)", border: "1px solid var(--ms-border)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem", minWidth: "60px", textAlign: "center" }}>
                                    {formatTime(s.dateTime)}
                                </div>
                                <div style={{ fontSize: "0.95rem" }}>{s.title}</div>
                            </li>
                        ))}
                    </ul>
                 )}
                 <button className="btn btn-secondary" style={{ width: "100%", marginTop: "16px" }} onClick={() => router.push("/teacher/schedule/new")}>
                    일정 추가
                </button>
            </DashboardCard>
        </div>
        
        {/* Settings & Exports Section */}
        <div className="dashboard-grid-bottom settings-row" style={{ marginTop: "24px" }}>
             <TeacherEmailSettings />
             <DataExportSection 
                role="teacher"
                title="토론 기록 내보내기"
                description="우리 반 토론 결과를 한눈에 확인하고 파일로 저장할 수 있어요."
                data={[]} // TODO: Pass actual history data if available
             />
        </div>
      </div>

      <style jsx>{`
        .pc-dashboard-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .dashboard-row {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .flex-1 {
            flex: 1;
        }
        
        .shortcut-card-container {
            flex: 1; 
            min-height: 100%;
        }

        .shortcut-layout {
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: 100%;
        }

        .shortcut-btn {
            flex: 1;
            width: 100%;
            aspect-ratio: 4 / 3;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            background: rgba(30, 41, 59, 0.5);
            color: var(--ms-text);
            font-weight: 600;
            line-height: 1.4;
            transition: all 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.05);
            text-align: center;
        }
        
        .shortcut-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-2px);
        }

        .dashboard-grid-bottom {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }
        
        .mini-stat {
            display: flex;
            flex-direction: column;
        }
        .mini-stat .label {
            font-size: 0.85rem;
            color: var(--ms-text-muted);
        }
        .mini-stat .value {
            font-size: 1.4rem;
            fontWeight: 700;
            color: var(--ms-text);
        }

        .alert-item {
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9rem;
            display: flex;
            gap: 8px;
            align-items: center;
        }

        /* Desktop Layout (md: 768px+) */
        @media (min-width: 768px) {
            .pc-dashboard-container {
                gap: 40px;
            }

            .dashboard-row.top-row {
                flex-direction: row;
                align-items: stretch;
            }
            
            .shortcut-layout {
                flex-direction: row; 
                gap: 24px;
                align-items: stretch;
            }
            
            .shortcut-btn {
                aspect-ratio: auto;
                height: auto;
                min-height: 120px; 
            }

            .dashboard-grid-bottom {
                grid-template-columns: repeat(3, 1fr);
            }

            .dashboard-grid-bottom.settings-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
      `}</style>
    </DashboardLayout>
  );
}
