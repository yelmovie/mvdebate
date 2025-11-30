"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSessionHistory } from "../../../services/historyService";
import { DebateSessionReport } from "../../../types/domain";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { exportToCsv } from "../../../utils/exportUtils";
import TeacherAnalytics from "../../../components/teacher/TeacherAnalytics";

// Mock Data for Analytics
const MOCK_ANALYTICS = {
  personaUsage: [
    { personaId: "bo-ra", count: 8 },
    { personaId: "chul-soo", count: 5 },
    { personaId: "yeong-hee", count: 6 },
    { personaId: "min-ho", count: 4 },
    { personaId: "ji-ho", count: 3 },
  ],
  stanceStats: {
    pro: 15,
    con: 11
  },
  avgScores: {
    clarity: 4.2,
    evidence: 3.8,
    relevance: 4.5
  }
};

export default function TeacherReportPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DebateSessionReport[]>([]);
  const [filters, setFilters] = useState({
    grade: "",
    classNumber: "",
    topic: "",
    stance: ""
  });
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSessionHistory());
  }, []);

  const filteredHistory = history.filter(r => {
    if (filters.grade && r.grade !== filters.grade) return false;
    if (filters.classNumber && r.classNumber !== filters.classNumber) return false;
    if (filters.topic && !r.topicTitle.includes(filters.topic)) return false;
    if (filters.stance && r.stance !== filters.stance) return false;
    return true;
  });

  const totalSessions = filteredHistory.length;
  const uniqueStudents = new Set(filteredHistory.map(r => r.nickname)).size;
  const totalTurns = filteredHistory.reduce((acc, curr) => acc + (curr.turnCount || 0), 0);
  const avgTurns = totalSessions > 0 ? (totalTurns / totalSessions).toFixed(1) : "0";
  
  const proCount = filteredHistory.filter(r => r.stance === "pro").length;
  const conCount = filteredHistory.filter(r => r.stance === "con").length;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff" // Ensure white background
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`beta_report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="dashboard-title">교사용 데이터 대시보드</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => router.push("/teacher")}>
            돌아가기
          </button>
          <button className="btn btn-primary" onClick={() => exportToCsv(filteredHistory)}>
            CSV 데이터 내보내기
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div style={{ marginBottom: 24 }}>
        <TeacherAnalytics 
          personaUsage={MOCK_ANALYTICS.personaUsage}
          stanceStats={MOCK_ANALYTICS.stanceStats}
          avgScores={MOCK_ANALYTICS.avgScores}
        />
      </div>

      {/* 필터 섹션 */}
      <div className="dashboard-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>데이터 필터</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input 
            className="filter-input" 
            placeholder="학년 (예: 3)" 
            value={filters.grade}
            onChange={e => setFilters({...filters, grade: e.target.value})}
            style={{ width: "100px" }}
          />
          <input 
            className="filter-input" 
            placeholder="반 (예: 1)" 
            value={filters.classNumber}
            onChange={e => setFilters({...filters, classNumber: e.target.value})}
            style={{ width: "100px" }}
          />
          <input 
            className="filter-input" 
            placeholder="주제 검색" 
            value={filters.topic}
            onChange={e => setFilters({...filters, topic: e.target.value})}
          />
          <select 
            className="filter-input"
            value={filters.stance}
            onChange={e => setFilters({...filters, stance: e.target.value})}
          >
            <option value="">모든 입장</option>
            <option value="pro">찬성</option>
            <option value="con">반대</option>
          </select>
        </div>
      </div>

      {/* 리포트 미리보기 (PDF 대상) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: "bold" }}>리포트 미리보기</h3>
          <button className="btn btn-secondary" onClick={handleDownloadPdf} style={{ fontSize: "12px", padding: "4px 8px" }}>
            PDF로 저장
          </button>
        </div>
        
        <div ref={reportRef} style={{ padding: "40px", background: "white", borderRadius: "8px", color: "#333", border: "1px solid #ddd" }}>
          <h2 style={{ textAlign: "center", marginBottom: "40px", fontSize: "24px", fontWeight: "bold" }}>
            AI 토론 웹앱 운영 결과 리포트
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>총 참여 학생 수</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>{uniqueStudents}명</div>
            </div>
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>총 토론 세션 수</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>{totalSessions}회</div>
            </div>
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>평균 토론 길이</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>{avgTurns}턴</div>
            </div>
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>찬성 vs 반대 비율</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>
                {proCount} : {conCount}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #eee", paddingBottom: "8px" }}>
            운영 요약
          </h3>
          <ul style={{ lineHeight: "1.8", fontSize: "15px", marginBottom: "40px" }}>
            <li>
              <strong>필터 조건:</strong> {filters.grade ? `${filters.grade}학년 ` : ""}{filters.classNumber ? `${filters.classNumber}반 ` : ""}{!filters.grade && !filters.classNumber ? "전체" : ""}
            </li>
            <li>
              <strong>주요 성과:</strong> 학생들이 AI와의 1:1 토론을 통해 자신의 주장을 논리적으로 펼치는 연습을 수행함.
            </li>
          </ul>

          <div style={{ textAlign: "center", fontSize: "12px", color: "#999", marginTop: "60px" }}>
            MovieSSam Debate Lab - Report
            <br />
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="dashboard-card">
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>상세 데이터 ({filteredHistory.length}건)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ms-border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "8px" }}>날짜</th>
                <th style={{ padding: "8px" }}>학생</th>
                <th style={{ padding: "8px" }}>학년/반</th>
                <th style={{ padding: "8px" }}>주제</th>
                <th style={{ padding: "8px" }}>입장</th>
                <th style={{ padding: "8px" }}>턴 수</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--ms-border-subtle)" }}>
                  <td style={{ padding: "8px" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "8px" }}>{r.nickname}</td>
                  <td style={{ padding: "8px" }}>{r.grade ? `${r.grade}학년` : "-"}/{r.classNumber ? `${r.classNumber}반` : "-"}</td>
                  <td style={{ padding: "8px" }}>{r.topicTitle}</td>
                  <td style={{ padding: "8px" }}>
                    <span className={`badge-stance ${r.stance}`}>
                      {r.stance === "pro" ? "찬성" : "반대"}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>{r.turnCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
