"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";

export default function TeacherEmailSettings() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedName, setSavedName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("teacherEmail");
    const storedName = localStorage.getItem("teacherName");
    
    if (storedEmail) {
        setSavedEmail(storedEmail);
        setEmail(storedEmail);
    }
    if (storedName) {
        setSavedName(storedName);
        setName(storedName);
    }
  }, []);

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
  };

  return (
    <DashboardCard title="알림용 이메일 설정 📧">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 14, color: "var(--ms-text)" }}>
            학생들이 토론 결과를 보낼 <strong>선생님 이메일</strong>을 등록해주세요.
        </p>
        
        <div style={{ background: "var(--ms-bg-subtle)", padding: "12px", borderRadius: "8px" }}>
            <span style={{ fontSize: 12, color: "var(--ms-text-muted)" }}>현재 등록된 정보</span>
            <div style={{ fontWeight: 600, color: "var(--ms-primary)", marginTop: "4px" }}>
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
                style={{ padding: "8px", border: "1px solid var(--ms-border)", borderRadius: "6px" }}
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="filter-input"
                style={{ padding: "8px", border: "1px solid var(--ms-border)", borderRadius: "6px" }}
            />
        </div>
        <button 
            className="btn btn-primary" 
            onClick={handleSave}
            style={{ width: "100%", padding: "10px" }}
        >
            이메일 등록/수정
        </button>
      </div>
    </DashboardCard>
  );
}
