"use client";

import { useEffect, useMemo, useState } from "react";
import { loadReports, clearReports } from "../../utils/sessionReportStorage";
import type { DebateSessionReport, RubricScore } from "../../types/domain";
import { getRubrics } from "../../services/configService";
import { getTeacherEmail, setTeacherEmail } from "../../utils/teacherSettingsStorage";

const TEACHER_PASSWORD = "5050";
const AUTH_STORAGE_KEY = "teacher_dashboard_auth";

export default function TeacherDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [reports, setReports] = useState<DebateSessionReport[]>([]);
  const [filterName, setFilterName] = useState("");
  const [filterTopic, setFilterTopic] = useState("");

  const [selectedReport, setSelectedReport] =
    useState<DebateSessionReport | null>(null);
  const [teacherEmail, setTeacherEmailState] = useState("");

  const rubrics = getRubrics();
  const basic = rubrics["basicDebate"];

  // ✅ 모든 훅을 조건부 return 이전에 배치
  // 필터링된 리포트 목록 (조건 처리는 useMemo 내부에서)
  const filtered = useMemo(() => {
    // 안전장치: reports가 없거나 빈 배열이면 빈 배열 반환
    if (!reports || reports.length === 0) return [];
    
    return reports.filter((r) => {
      const nameOk = filterName
        ? r.nickname.toLowerCase().includes(filterName.toLowerCase())
        : true;
      const topicOk = filterTopic
        ? r.topicTitle.toLowerCase().includes(filterTopic.toLowerCase())
        : true;
      return nameOk && topicOk;
    });
  }, [reports, filterName, filterTopic]);

  // 교사 이메일 로드
  useEffect(() => {
    if (isAuthenticated) {
      setTeacherEmailState(getTeacherEmail());
    }
  }, [isAuthenticated]);

  // 인증 상태 확인 (localStorage에서)
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setReports(loadReports());
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setPassword("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // ✅ 조건부 return은 모든 훅 정의 이후에
  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <main>
        <div className="dashboard-card" style={{ maxWidth: 400, margin: "100px auto" }}>
          <h1 className="dashboard-title">교사용 대시보드</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 24 }}>
            접근하려면 비밀번호를 입력하세요.
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                비밀번호
              </label>
              <input
                type="password"
                className="filter-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="비밀번호 입력"
                autoFocus
                style={{ width: "100%" }}
              />
              {error && (
                <p style={{ color: "var(--ms-rose)", fontSize: 13, marginTop: 8 }}>
                  {error}
                </p>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              확인
            </button>
          </form>
        </div>
      </main>
    );
  }

  const handleClear = () => {
    if (!window.confirm("정말 모든 토론 기록을 삭제할까요?")) return;
    clearReports();
    setReports([]);
    setSelectedReport(null);
  };

  /** 특정 리포트의 루브릭을 간단 문자열로 요약 */
  const renderRubricSummary = (report: DebateSessionReport): string => {
    if (!basic || !report.rubricScores || report.rubricScores.length === 0) {
      return "-";
    }

    const map: Record<string, RubricScore> = {};
    for (const rs of report.rubricScores) {
      if (rs.rubricId === "basicDebate") {
        map[rs.itemId] = rs;
      }
    }

    const parts: string[] = [];
    for (const item of basic.items) {
      const rs = map[item.id];
      if (!rs) continue;
      const levelLabel = item.levels[rs.levelIndex] ?? "";
      if (levelLabel) {
        parts.push(`${item.text.replace(/\s/g, "").slice(0, 4)}:${levelLabel}`);
      }
    }

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  /** CSV 다운로드 (엑셀에서 열기 가능) */
  const handleDownloadCSV = () => {
    if (filtered.length === 0) {
      alert("내보낼 기록이 없습니다.");
      return;
    }

    const header = [
      "날짜",
      "학생",
      "주제",
      "입장",
      "주장",
      "근거수",
      "자료수",
      "루브릭요약"
    ];

    const rows = filtered
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((r) => {
        const date = new Date(r.createdAt);
        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const stanceLabel = r.stance === "pro" ? "찬성" : "반대";
        const rubricSummary = renderRubricSummary(r);

        const cells = [
          dateStr,
          r.nickname,
          r.topicTitle,
          stanceLabel,
          r.claim || "",
          String(r.reasonsCount),
          String(r.evidencesCount),
          rubricSummary
        ].map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`);

        return cells.join(",");
      });

    const csvContent = [header.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "debate_reports.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** 브라우저 인쇄(→ PDF로 저장 가능) */
  const handlePrintView = () => {
    if (filtered.length === 0) {
      alert("인쇄할 기록이 없습니다.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableHtml = generatePrintTableHTML(filtered, renderRubricSummary);

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>토론 기록 인쇄</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 4px 6px; }
            th { background: #f3f3f3; }
            h1 { font-size: 18px; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>토론 기록 요약</h1>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  /** 행 클릭 시 상세 보기 모달 오픈 */
  const handleRowClick = (report: DebateSessionReport) => {
    setSelectedReport(report);
  };

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h1 className="dashboard-title">교사용 토론 대시보드</h1>
          <p className="dashboard-subtitle">
            이 브라우저에 저장된 토론 기록을 MovieSSam 다크보드에서 확인합니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/teacher/manage" className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
            선생님 관리
          </a>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: 12, padding: "6px 12px" }}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 교사 이메일 설정 */}
      <section className="dashboard-card">
        <h2 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>토론 결과 수신 이메일</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <input
              type="email"
              className="filter-input"
              placeholder="예: teacher@example.com"
              value={teacherEmail}
              onChange={(e) => setTeacherEmailState(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setTeacherEmail(teacherEmail);
              alert("이메일이 저장되었습니다.");
            }}
          >
            저장
          </button>
        </div>
        <p className="hint-text" style={{ marginTop: 8 }}>
          모의 토론 자기 평가와 AI 요약 PDF가 이 주소로 전송됩니다.
        </p>
      </section>

      <section className="dashboard-card">
        <h2 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>필터 및 내보내기</h2>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "flex-end"
          }}
        >
          <div>
            <label>
              학생 이름 검색:
              <br />
              <input
                className="filter-input"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="학생 이름 검색…"
              />
            </label>
          </div>
          <div>
            <label>
              주제 검색:
              <br />
              <input
                className="filter-input"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                placeholder="주제 키워드 검색…"
              />
            </label>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleDownloadCSV}>
              CSV 다운로드
            </button>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={handlePrintView}>
              PDF 인쇄/저장
            </button>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-danger" onClick={handleClear}>
              전체 기록 삭제
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-card">
        <h2 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>토론 기록 목록</h2>
        <p className="hint-text" style={{ marginBottom: 8 }}>
          * 특정 학생의 행을 클릭하면 세션별 상세 내용을 팝업으로 볼 수 있습니다.
        </p>

        {filtered.length === 0 && (
          <p className="hint-text">
            저장된 기록이 없습니다. 학생 화면에서 "이 토론 기록 저장하기" 버튼을
            눌러 저장할 수 있습니다.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
            <thead>
              <tr>
                <th style={thStyle}>날짜</th>
                <th style={thStyle}>학생</th>
                <th style={thStyle}>주제</th>
                <th style={thStyle}>입장</th>
                <th style={thStyle}>주장 요약</th>
                <th style={thStyle}>근거 수</th>
                <th style={thStyle}>자료 수</th>
                <th style={thStyle}>루브릭</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice()
                .sort((a, b) =>
                  a.createdAt < b.createdAt ? 1 : -1
                )
                .map((r) => {
                  const date = new Date(r.createdAt);
                  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}-${date
                    .getDate()
                    .toString()
                    .padStart(2, "0")} ${date
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${date
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`;

                  const stanceLabel = r.stance === "pro" ? "찬성" : "반대";

                  return (
                    <tr
                      key={r.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(r)}
                    >
                      <td style={tdStyle}>{dateStr}</td>
                      <td style={tdStyle}>
                        <span className="tag tag--student">{r.nickname}</span>
                      </td>
                      <td style={tdStyle}>
                        <span className="tag tag--topic">{r.topicTitle}</span>
                      </td>
                      <td style={tdStyle}>{stanceLabel}</td>
                      <td style={tdStyle}>
                        {r.claim ? r.claim : "(미작성)"}
                      </td>
                      <td style={tdStyle}>{r.reasonsCount}</td>
                      <td style={tdStyle}>{r.evidencesCount}</td>
                      <td style={tdStyle}>
                        <span className="rubric-chip">{renderRubricSummary(r)}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
        )}
      </section>

      {selectedReport && (
        <DetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          basicRubric={basic}
        />
      )}
    </main>
  );
}

const thStyle = {
  borderBottom: "1px solid #ddd",
  padding: "4px 6px",
  textAlign: "left",
  background: "#f3f3f3"
} as const;

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "4px 6px",
  verticalAlign: "top"
} as const;

/** 인쇄용 HTML 테이블 생성 */
function generatePrintTableHTML(
  reports: DebateSessionReport[],
  renderRubricSummary: (r: DebateSessionReport) => string
): string {
  const rowsHtml = reports
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((r) => {
      const date = new Date(r.createdAt);
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const stanceLabel = r.stance === "pro" ? "찬성" : "반대";
      const rubricSummary = renderRubricSummary(r);

      return `
        <tr>
          <td>${escapeHtml(dateStr)}</td>
          <td>${escapeHtml(r.nickname)}</td>
          <td>${escapeHtml(r.topicTitle)}</td>
          <td>${escapeHtml(stanceLabel)}</td>
          <td>${escapeHtml(r.claim || "")}</td>
          <td>${r.reasonsCount}</td>
          <td>${r.evidencesCount}</td>
          <td>${escapeHtml(rubricSummary)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>날짜</th>
          <th>학생</th>
          <th>주제</th>
          <th>입장</th>
          <th>주장</th>
          <th>근거 수</th>
          <th>자료 수</th>
          <th>루브릭</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type DetailModalProps = {
  report: DebateSessionReport;
  onClose: () => void;
  basicRubric: any;
};

function DetailModal({ report, onClose, basicRubric }: DetailModalProps) {
  const date = new Date(report.createdAt);
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const stanceLabel = report.stance === "pro" ? "찬성" : "반대";

  // 루브릭 테이블용 맵
  const rubricMap: Record<string, RubricScore> = {};
  if (report.rubricScores) {
    for (const rs of report.rubricScores) {
      if (rs.rubricId === "basicDebate") {
        rubricMap[rs.itemId] = rs;
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">세션 상세 보기</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="hint-text">
          <strong>학생:</strong> {report.nickname} /{" "}
          <strong>날짜:</strong> {dateStr} / <strong>입장:</strong> {stanceLabel}
        </p>
        <p style={{ fontSize: 14, marginTop: 8 }}>
          <strong>주제:</strong> {report.topicTitle}
        </p>

        <hr style={{ margin: "12px 0", borderColor: "var(--ms-border-subtle)" }} />

        <section style={{ marginBottom: 12 }}>
          <h3 className="section-title">주장(Claim)</h3>
          <p style={{ fontSize: 14 }}>
            {report.claim && report.claim.trim().length > 0
              ? report.claim
              : "(미작성)"}
          </p>
        </section>

        <section style={{ marginBottom: 12 }}>
          <h3 className="section-title">근거(Reasons)</h3>
          {report.reasons && report.reasons.length > 0 ? (
            <ol className="list">
              {report.reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ol>
          ) : (
            <p className="hint-text">(저장된 근거 없음)</p>
          )}
        </section>

        <section style={{ marginBottom: 12 }}>
          <h3 className="section-title">자료/예시(Evidences)</h3>
          {report.evidences && report.evidences.length > 0 ? (
            <ol className="list">
              {report.evidences.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ol>
          ) : (
            <p className="hint-text">(저장된 자료 없음)</p>
          )}
        </section>

        {basicRubric && (
          <section style={{ marginBottom: 12 }}>
            <h3 className="section-title">루브릭 상세</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>선택 수준</th>
                  </tr>
                </thead>
                <tbody>
                  {basicRubric.items.map((item: any) => {
                    const rs = rubricMap[item.id];
                    const label =
                      rs && typeof rs.levelIndex === "number"
                        ? item.levels[rs.levelIndex] ?? "(알 수 없음)"
                        : "(선택 안 함)";
                    return (
                      <tr key={item.id}>
                        <td>{item.text}</td>
                        <td>{label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
