"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { saveUserProfile, checkClassCodeExists, findTeacherByClassCode } from "../../services/userService";
import { USER_ROLES } from "../../config/authConfig";

interface Props {
  open: boolean;
  onClose?: () => void;
}

export default function RoleSelectionModal({ open, onClose }: Props) {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"student" | "teacher">("student");
  // ... existing states

  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("1"); // Added student number state
  const [teacherCode, setTeacherCode] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    /* ... existing submit logic ... */
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      let finalClassCode = "";
      let finalDisplayName = name;

      if (role === "teacher") {
        if (teacherCode !== "5050") {
          setError("선생님 가입 인증 코드가 올바르지 않습니다. (초기값: 5050)");
          setLoading(false);
          return;
        }
        const codeRegex = /^[A-Z][0-9]{4}$/;
        if (!codeRegex.test(classCodeInput)) {
           setError("우리 반 코드는 '알파벳 1개 + 숫자 4개' 형식이어야 합니다. (예: A1234)");
           setLoading(false);
           return;
        }
        const exists = await checkClassCodeExists(classCodeInput);
        if (exists) {
          setError("이미 사용 중인 반 코드입니다.");
          setLoading(false);
          return;
        }
        finalClassCode = classCodeInput;
      } else {
        // Student
        const codeRegex = /^[A-Z][0-9]{4}$/;
        if (!codeRegex.test(classCodeInput)) {
           setError("우리 반 코드를 올바르게 입력해주세요. (예: A1234)");
           setLoading(false);
           return;
        }
        const teacher = await findTeacherByClassCode(classCodeInput);
        if (!teacher) {
          setError("해당 코드를 가진 선생님을 찾을 수 없습니다.");
          setLoading(false);
          return;
        }
        finalClassCode = classCodeInput;
        // Format nickname: "1번 홍길동"
        finalDisplayName = `${studentNumber}번 ${name}`;
      }

      // Update Profile
      await saveUserProfile(user.uid, {
        role: role === "teacher" ? USER_ROLES.TEACHER : USER_ROLES.STUDENT,
        name: name,
        displayName: finalDisplayName,
        classCode: finalClassCode,
        studentNumber: role === "student" ? Number(studentNumber) : undefined, // Save raw number too if schema supports, or just metadata
        updatedAt: new Date().toISOString()
      });

      alert("가입이 완료되었습니다! 환영합니다.");
      window.location.reload(); 
      
    } catch (err: any) {
      console.error(err);
      setError("오류가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: "400px" }}>
        <h2 className="modal-title">추가 정보 입력</h2>
        <p className="hint-text" style={{ marginBottom: "20px" }}>
          Google 계정으로 로그인하셨군요! <br/>
          서비스 이용을 위해 역할을 선택하고 정보를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", background: "var(--ms-bg-subtle)", padding: "4px", borderRadius: "8px" }}>
            <button
              type="button"
              onClick={() => setRole("student")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: role === "student" ? "var(--ms-surface)" : "transparent",
                color: role === "student" ? "var(--ms-primary)" : "var(--ms-text-muted)",
                fontWeight: role === "student" ? "bold" : "normal",
                boxShadow: role === "student" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer"
              }}
            >
              학생
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: role === "teacher" ? "var(--ms-surface)" : "transparent",
                color: role === "teacher" ? "var(--ms-primary)" : "var(--ms-text-muted)",
                fontWeight: role === "teacher" ? "bold" : "normal",
                boxShadow: role === "teacher" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer"
              }}
            >
              선생님
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
             {role === "student" && (
                <div style={{ width: "80px" }}>
                    <select 
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        className="filter-input"
                        style={{ padding: "12px 8px" }}
                    >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}번</option>
                        ))}
                    </select>
                </div>
             )}
            <input 
                type="text" 
                placeholder="이름 (예: 김철수)" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
                className="filter-input"
                style={{ flex: 1 }}
            />
          </div>

          {role === "teacher" ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "var(--ms-bg-subtle)", borderRadius: "8px" }}>
                <div>
                    <input 
                    type="password" // password type ok if we show hint
                    placeholder="가입 인증 코드 (5050)" 
                    value={teacherCode} 
                    onChange={e => setTeacherCode(e.target.value)} 
                    className="filter-input"
                    style={{ background: "var(--ms-surface)" }}
                    required
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                        <button 
                            type="button" 
                            onClick={() => alert("현재 베타 테스트 기간의 인증 코드는 [5050] 입니다.")}
                            style={{ fontSize: "11px", color: "var(--ms-text-muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                        >
                            인증 코드를 잊으셨나요?
                        </button>
                    </div>
                </div>
                <input 
                  type="text" 
                  placeholder="우리 반 코드 만들기 (예: A1234)" 
                  value={classCodeInput} 
                  onChange={e => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                    setClassCodeInput(val);
                  }} 
                  className="filter-input"
                  style={{ background: "var(--ms-surface)", letterSpacing: "1px", fontWeight: "bold" }}
                  required
                  maxLength={5}
                />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "var(--ms-bg-subtle)", borderRadius: "8px" }}>
                 <input 
                  type="text" 
                  placeholder="우리 반 코드 입력 (예: A1234)" 
                  value={classCodeInput} 
                  onChange={e => {
                     const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                     setClassCodeInput(val);
                  }} 
                  className="filter-input"
                  style={{ background: "var(--ms-surface)", letterSpacing: "1px", fontWeight: "bold" }}
                  required
                  maxLength={5}
                />
            </div>
          )}

          {error && <div style={{ color: "var(--ms-red)", fontSize: "13px" }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "저장 중..." : "가입 완료 및 시작하기"}
          </button>
          
          {onClose && (
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                background: "none", 
                border: "none", 
                fontSize: "13px", 
                color: "var(--ms-text-muted)", 
                textDecoration: "underline", 
                cursor: "pointer",
                marginTop: "12px"
              }}
            >
              건너뛰기 (게스트로 시작)
            </button>
          )}

        </form>
      </div>
    </div>
  );
}
