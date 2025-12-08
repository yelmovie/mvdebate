"use client";

import { useState, useEffect } from "react";
import { getSessionHistory } from "../../services/historyService";
import { exportToCsv } from "../../utils/exportUtils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TeacherBoardModal({ open, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    if (open) {
      const storedEmail = localStorage.getItem("teacherEmail");
      const storedName = localStorage.getItem("teacherName");
      
      if (storedEmail) setSavedEmail(storedEmail);
      if (storedName) setSavedName(storedName);

      setPassword("");
      setEmail(storedEmail || "");
      setName(storedName || "");
      setIsAuthenticated(false);
    }
  }, [open]);

  if (!open) return null;

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        alert(data.message || "비밀번호가 틀렸습니다.");
      }
    } catch (e) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSave = () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!email.includes("@")) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    
    localStorage.setItem("teacherEmail", email.trim());
    localStorage.setItem("teacherName", name.trim());
    setSavedEmail(email.trim());
    setSavedName(name.trim());
    
    alert("선생님 정보가 등록되었습니다!");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-box" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: "400px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">선생님 게시판</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {!isAuthenticated ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: "var(--ms-text)" }}>관리자 비밀번호를 입력하세요.</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="filter-input"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button className="btn btn-primary" onClick={handleLogin}>
                확인
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, color: "var(--ms-text)" }}>
                학생들이 토론 결과를 보낼 <strong>선생님 이메일</strong>을 등록해주세요.
              </p>
              
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--ms-text-muted)" }}>현재 등록된 정보:</span>
                <div style={{ fontWeight: 600, color: "var(--ms-primary)" }}>
                  {savedName ? `${savedName} 선생님` : "(이름 없음)"} <br/>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ms-text-soft)" }}>
                    {savedEmail || "(이메일 없음)"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="선생님 성함 (예: 김철수)"
                  className="filter-input"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="filter-input"
                />
              </div>
              <button className="btn btn-primary" onClick={handleSave}>
                이메일 등록/수정
              </button>

              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px dashed var(--ms-border-subtle)" }} />
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 14, color: "var(--ms-text)" }}>
                  <strong>데이터 내보내기 (베타)</strong><br/>
                  <span style={{ fontSize: 12, color: "var(--ms-text-muted)" }}>
                    현재 기기에 저장된 토론 기록을 CSV로 다운로드합니다.
                  </span>
                </p>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    const history = getSessionHistory();
                    if (history.length === 0) {
                      alert("저장된 토론 기록이 없습니다.");
                      return;
                    }
                    exportToCsv(history, `debate_export_${new Date().toISOString().slice(0,10)}.csv`);
                  }}
                >
                  📄 CSV로 내보내기
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    window.location.href = "/teacher/report";
                  }}
                >
                  📊 리포트 보기 (PDF)
                </button>

                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--ms-border-subtle)" }}>
                  <p style={{ fontSize: 14, color: "var(--ms-text)", marginBottom: "8px" }}>
                    <strong>실시간 현황판</strong><br/>
                    <span style={{ fontSize: 12, color: "var(--ms-text-muted)" }}>
                      학생들의 진행 상황을 실시간으로 확인합니다.
                    </span>
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      window.location.href = "/teacher";
                    }}
                    style={{ width: "100%", background: "#4caf50", borderColor: "#4caf50" }}
                  >
                    👨‍🏫 실시간 대시보드 입장
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
