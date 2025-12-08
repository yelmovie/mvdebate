"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataExportSection from "@/components/exports/DataExportSection";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/schema";
import { LuMessageSquare } from "react-icons/lu";

export default function StudentMyPage() {
  const { user, profile, studentProfile } = useAuth();
  const router = useRouter();

  // Students can access via studentProfile (class code login) or user (if they somehow have Firebase auth)
  const isLoggedIn = !!studentProfile || !!user;

  if (!isLoggedIn) {
    return (
        <div style={{ 
            height: "80vh", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            textAlign: "center",
            gap: "24px" 
        }}>
            <div style={{ fontSize: "4rem" }}>🔒</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>로그인이 필요해요</h2>
            <p style={{ color: "var(--ms-text-muted)", fontSize: "1.1rem" }}>
                마이페이지를 보려면 로그인이 필요합니다.<br/>
                메인 화면으로 돌아가서 로그인해주세요.
            </p>
            <button 
                className="btn btn-primary" 
                onClick={() => router.push('/')}
                style={{ padding: "12px 40px", fontSize: "1.1rem", borderRadius: "30px" }}
            >
                로그인하러 가기 🏠
            </button>
        </div>
    );
  }
  
  // Local state for editing fields initiated with profile data
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [className, setClassName] = useState<string>("");

  useEffect(() => {
    // Prioritize studentProfile for students who log in via class code
    const p = studentProfile || profile;
    if (p) {
       const data = p as any;
       setStudentName(data.displayName || data.name || "");
       setStudentNumber(data.studentNumber ? String(data.studentNumber) : "");
       setClassName(data.classCode || ""); 
    }
  }, [studentProfile, profile]);

  // Mock Data for now
  const myDebateRecordsMock: unknown[] = [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-50">
      {/* Profile Card */}
      <section style={{
          borderRadius: "1.5rem",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          padding: "1.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>마이페이지</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>내 정보</p>
            <p style={{ fontSize: "1.125rem", fontWeight: "600" }}>
              {className} {studentNumber && `${studentNumber}번`} {studentName}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem", fontSize: "0.875rem", color: "#cbd5e1" }}>
            <p>여기에서는 내가 참여한 토론 기록을 모아서 볼 수 있어요.</p>
            <p>파일로 저장해서 포트폴리오나 발표 준비에 활용해 보세요.</p>
          </div>
        </div>
      </section>

      {/* Edit Info Section */}
      <section style={{
          marginTop: "2rem",
          borderRadius: "1rem",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          padding: "1.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "white" }}>내 정보 정리하기</h2>
        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#cbd5e1" }}>
          이름이나 번호가 잘못되어 있다면 선생님과 상의해서 수정해 주세요.
        </p>

        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>이름</label>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "#1e293b",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: "white",
                  outline: "none",
                  border: "1px solid #334155",
              }}
              placeholder="예: 김주안"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>번호</label>
            <input
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "#1e293b",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: "white",
                  outline: "none",
                  border: "1px solid #334155",
              }}
              placeholder="예: 7"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>반 이름 (또는 코드)</label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              style={{
                  borderRadius: "0.75rem",
                  backgroundColor: "#1e293b",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: "white",
                  outline: "none",
                  border: "1px solid #334155",
              }}
              placeholder="예: 5학년 3반"
            />
          </div>
        </div>
      </section>

      {/* Export Section */}
      <DataExportSection
        role="student"
        title="내 토론 기록 내보내기"
        description="내가 참여한 토론 내용을 CSV나 PDF 파일로 저장해서 다시 볼 수 있어요."
        data={myDebateRecordsMock}
      />

      {/* Feedback Button */}
      <section style={{
          marginTop: "2rem",
          borderRadius: "1rem",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          padding: "1.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}>
        <button
          onClick={() => router.push("/feedback")}
          className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LuMessageSquare size={20} />
          시범 운영 피드백 보내기
        </button>
      </section>
    </main>
  );
}
