import React from "react";

interface Props {
  role: "student" | "teacher";
  name: string;
  classInfo?: {
    name: string;
    code: string;
  } | null;
}

export default function GreetingHeader({ role, name, classInfo }: Props) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <header style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <h1 className="dashboard-title" style={{ fontSize: "1.8rem", textAlign: "left", marginBottom: "0" }}>
        {dateStr}, {name}{(!name.endsWith("선생님") && !name.endsWith("학생")) && (role === "student" ? " 학생" : " 선생님")} {role === "student" ? "안녕하세요! 👋" : "환영합니다! 👨‍🏫"}
      </h1>
      <p className="dashboard-subtitle" style={{ textAlign: "left", marginTop: "0", color: "var(--ms-text-muted)" }}>
        {role === "student" 
          ? "오늘도 AI와 함께 즐겁게 토론 실력을 키워봐요." 
          : "우리 반 학생들의 토론 활동을 한눈에 확인해보세요."}
      </p>

      {/* Class Badge for Teacher */}
      {role === "teacher" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {classInfo ? (
               <div style={{ 
                   display: "inline-flex", 
                   alignItems: "center", 
                   gap: "16px", 
                   background: "linear-gradient(to right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))", 
                   padding: "12px 24px", 
                   borderRadius: "16px",
                   border: "1px solid rgba(59, 130, 246, 0.3)",
                   boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
               }}>
                 <span style={{ fontSize: "1.1rem", color: "#e2e8f0", fontWeight: "600" }}>
                    🏫 {classInfo.name || "나의 반"}
                 </span>
                 <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.2)" }}></div>
                 <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "1rem", color: "#94a3b8" }}>입장 코드:</span>
                    <span style={{ 
                        fontSize: "2rem", // Very large
                        fontWeight: "800", 
                        color: "#38bdf8", // Sky blue for high visibility
                        letterSpacing: "2px",
                        lineHeight: "1",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}>
                        {classInfo.code}
                    </span>
                 </div>
               </div>
            ) : (
               <div style={{ 
                   display: "inline-flex", 
                   alignItems: "center", 
                   background: "rgba(30, 41, 59, 0.6)", 
                   padding: "4px 12px", 
                   borderRadius: "20px",
                   fontSize: "0.75rem",
                   color: "#94a3b8"
               }}>
                 아직 선택된 반이 없습니다.
               </div>
            )}
          </div>
      )}
    </header>
  );
}
