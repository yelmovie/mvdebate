"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { getTeacherReports, updateReportStatus } from "@/services/teacherService";
import { DebateReport } from "@/types/schema";

export default function TeacherReportsPage() {
  const router = useRouter();
  const { user, getTeacherDisplayName } = useAuth();
  
  const [reports, setReports] = useState<DebateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "needs_review" | "done">("all");
  
  const [selectedReport, setSelectedReport] = useState<DebateReport | null>(null);

  useEffect(() => {
    if (user) {
        fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
      setLoading(true);
      if(!user) return;
      try {
        const data = await getTeacherReports(user.uid);
        setReports(data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        // Silently fail - reports will just show empty state
      } finally {
        setLoading(false);
      }
  };

  const filteredReports = reports.filter(r => {
      if (filter === "all") return true;
      return r.status === filter;
  });

  const handleStatusUpdate = async (reportId: string, newStatus: "done") => {
      if(confirm("검토 완료 처리하시겠습니까?")) {
          await updateReportStatus(reportId, newStatus);
          // Refresh local
          setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
          if(selectedReport && selectedReport.id === reportId) {
              setSelectedReport({ ...selectedReport, status: newStatus });
          }
      }
  };

  const downloadReport = (report: DebateReport) => {
      const element = document.createElement("a");
      const file = new Blob([report.content || report.summary || "내용 없음"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${report.title || "리포트"}_${report.createdAt}.txt`;
      document.body.appendChild(element);
      element.click();
  };

  const statusLabels = {
      "new": { label: "신규", color: "var(--ms-primary)" },
      "needs_review": { label: "검토필요", color: "var(--ms-rose)" },
      "done": { label: "완료", color: "var(--ms-text-muted)" }
  };

  return (
    <DashboardLayout role="teacher" userName={getTeacherDisplayName()} layoutMode="custom">
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>AI 리포트 관리 📝</h1>
                <div style={{ display: "flex", gap: "8px" }}>
                    {(["all", "new", "needs_review", "done"] as const).map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                padding: "8px 16px", borderRadius: "20px", border: "1px solid var(--ms-border)",
                                background: filter === f ? "var(--ms-primary)" : "transparent",
                                color: filter === f ? "#fff" : "var(--ms-text)",
                                fontWeight: 500
                            }}
                        >
                            {f === "all" ? "전체" : statusLabels[f]?.label || f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
                {loading ? (
                    <div>로딩 중...</div>
                ) : filteredReports.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--ms-text-muted)" }}>
                        도착한 리포트가 없습니다.
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                        {filteredReports.map(report => (
                            <div 
                                key={report.id} 
                                onClick={() => setSelectedReport(report)}
                                style={{ 
                                    background: "var(--ms-surface)", padding: "16px", borderRadius: "12px",
                                    border: "1px solid var(--ms-border)", cursor: "pointer",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    transition: "background 0.2s"
                                }}
                                className="report-item"
                            >
                                <div>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                                        {report.status && (
                                            <span style={{ 
                                                fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px",
                                                background: statusLabels[report.status as keyof typeof statusLabels]?.color || "#ccc",
                                                color: "#fff"
                                            }}>
                                                {statusLabels[report.status as keyof typeof statusLabels]?.label || report.status}
                                            </span>
                                        )}
                                        <span style={{ fontWeight: 600 }}>{report.title || "무제 리포트"}</span>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--ms-text-muted)" }}>
                                        {new Date(report.createdAt).toLocaleString()} · 학생 ID: {report.studentId}
                                    </div>
                                </div>
                                <div style={{ fontSize: "1.2rem", color: "var(--ms-text-muted)" }}>›</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div style={{ 
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }} onClick={() => setSelectedReport(null)}>
                    <div style={{ 
                        background: "var(--ms-surface)", width: "90%", maxWidth: "600px", maxHeight: "80vh", 
                        borderRadius: "16px", padding: "24px", overflowY: "auto", position: "relative"
                    }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setSelectedReport(null)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "1.5rem" }}
                        >
                            &times;
                        </button>
                        
                        <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "12px" }}>{selectedReport.title || "리포트 상세"}</h2>
                        <div style={{ marginBottom: "20px", color: "var(--ms-text-muted)", fontSize: "0.9rem" }}>
                            {new Date(selectedReport.createdAt).toLocaleString()} | {selectedReport.classCode} | {statusLabels[selectedReport.status as keyof typeof statusLabels]?.label}
                        </div>
                        
                        <div style={{ 
                            background: "var(--ms-bg)", padding: "16px", borderRadius: "8px", 
                            minHeight: "200px", whiteSpace: "pre-wrap", marginBottom: "20px"
                        }}>
                            {selectedReport.content || selectedReport.summary || "내용이 없습니다."}
                        </div>
                        
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button className="btn btn-secondary" onClick={() => downloadReport(selectedReport)}>
                                💾 텍스트 다운로드
                            </button>
                            {selectedReport.status !== "done" && (
                                <button className="btn btn-primary" onClick={() => handleStatusUpdate(selectedReport.id!, "done")}>
                                    ✅ 검토 완료 처리
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </DashboardLayout>
  );
}
