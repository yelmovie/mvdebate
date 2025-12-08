"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { createNotice, getTeacherClasses } from "@/services/teacherService";
import { ClassInfo } from "@/types/schema";

export default function CreateNoticePage() {
  const router = useRouter();
  const { user, getTeacherDisplayName } = useAuth();
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetClass, setTargetClass] = useState<string>("all"); // "all" or classCode
  const [isPinned, setIsPinned] = useState(false);
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
        getTeacherClasses(user.uid).then(setClasses);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("DEBUG: Submit button clicked"); // Debug log
      if (!user) {
          alert("사용자 정보가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
          return;
      }
      if (!title.trim() || !body.trim()) return alert("제목과 내용을 입력해주세요.");

      setSubmitting(true);
      try {
          if (!user) throw new Error("로그인 정보가 없습니다.");
          
          await createNotice({
              teacherId: user.uid,
              classCode: targetClass === "all" ? null : targetClass,
              title,
              body,
              isPinned
          });
          alert("공지사항이 등록되었습니다.");
          router.push("/teacher/dashboard");
      } catch (error: any) {
          console.error("[공지 등록 에러]", error);
          alert(`공지 등록 중 오류가 발생했습니다.\n\n${error?.message || "알 수 없는 오류"}`);
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <DashboardLayout role="teacher" userName={getTeacherDisplayName()} layoutMode="custom">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px" }}>새 공지사항 작성 📢</h1>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Class Selector */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>대상 학급</label>
                    <select 
                        value={targetClass} 
                        onChange={(e) => setTargetClass(e.target.value)}
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-surface)" 
                        }}
                    >
                        <option value="all">전체 반 (모든 학생)</option>
                        {classes.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.schoolName} {c.grade ? `${c.grade}학년` : ""} {c.classNumber ? `${c.classNumber}반` : ""} (코드: {c.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>제목</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="공지 제목을 입력하세요"
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)",
                            color: "#000"
                        }}
                    />
                </div>

                {/* Body */}
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>내용</label>
                    <textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="공지 내용을 입력하세요"
                        rows={8}
                        style={{ 
                            width: "100%", padding: "12px", borderRadius: "8px", 
                            border: "1px solid var(--ms-border)", background: "var(--ms-input-bg, #ffffff)",
                            color: "#000",
                            resize: "vertical"
                        }}
                    />
                </div>

                {/* Pinned */}
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                        type="checkbox" 
                        id="pinned"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        style={{ width: "18px", height: "18px" }}
                    />
                    <label htmlFor="pinned" style={{ fontWeight: 500 }}>상단 고정 (중요 공지)</label>
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
                        {!!submitting ? "저장 중..." : "작성 완료"}
                    </button>
                </div>

            </form>
        </div>
    </DashboardLayout>
  );
}
