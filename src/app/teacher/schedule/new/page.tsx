"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { createSchedule, getTeacherClasses } from "@/services/teacherService";
import { ClassInfo } from "@/types/schema";

export default function CreateSchedulePage() {
  const router = useRouter();
  const { user, getTeacherDisplayName } = useAuth();
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [targetClass, setTargetClass] = useState<string>("all");
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
        getTeacherClasses(user.uid).then(setClasses);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (!title.trim() || !date || !time) return alert("필수 정보를 입력해주세요.");

      setSubmitting(true);
      try {
          const dateTime = new Date(`${date}T${time}`).toISOString();
          
          await createSchedule({
              teacherId: user.uid,
              classCode: targetClass === "all" ? null : targetClass,
              title,
              dateTime,
              description
          });
          alert("일정이 등록되었습니다.");
          router.push("/teacher/dashboard");
      } catch (error) {
          console.error(error);
          alert("일정 등록 중 오류가 발생했습니다.");
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <DashboardLayout role="teacher" userName={getTeacherDisplayName()} layoutMode="custom">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px" }}>새 일정 등록 🗓️</h1>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* DateTime */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>날짜</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ 
                                width: "100%", padding: "12px", borderRadius: "8px", 
                                border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)", color: "#000"
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>시간</label>
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ 
                                width: "100%", padding: "12px", borderRadius: "8px", 
                                border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)", color: "#000"
                            }}
                        />
                    </div>
                </div>

                {/* Class Selector */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--ms-text)" }}>대상 학급 (코드)</label>
                    <select 
                        value={targetClass} 
                        onChange={(e) => setTargetClass(e.target.value)}
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-surface)",
                            color: "var(--ms-text)" 
                        }}
                    >
                        <option value="all">전체 반</option>
                        {classes.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.schoolName} {c.grade ? `${c.grade}학년` : ""} {c.classNumber ? `${c.classNumber}반` : ""} (코드: {c.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>일정 제목</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 실전 토론 수업, 수행평가 등"
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)", color: "#000"
                        }}
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>메모 (선택)</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="상세 내용을 입력하세요"
                        rows={3}
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)", color: "#000",
                            resize: "vertical"
                        }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        style={{ 
                            flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid var(--ms-border)",
                            background: "transparent", color: "var(--ms-text)" 
                        }}
                    >
                        취소
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn-primary"
                        style={{ 
                            flex: 2, padding: "14px", borderRadius: "12px", border: "none",
                            background: "var(--ms-primary)", color: "#fff", fontWeight: "bold",
                            opacity: submitting ? 0.7 : 1
                        }}
                    >
                        {!!submitting ? "저장 중..." : "등록 완료"}
                    </button>
                </div>

            </form>
        </div>
    </DashboardLayout>
  );
}
