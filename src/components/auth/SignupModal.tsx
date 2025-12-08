"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../../services/authService";
import { saveUserProfile, findTeacherByClassCode, checkClassCodeExists } from "../../services/userService";
import { ROLE_HOME_URL } from "../../constants/roles";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SignupModal({ open, onClose }: Props) {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic Validation
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      let finalClassCode = "";

      if (role === "teacher") {
        // Teacher Logic
        if (teacherCode !== "5050") {
          setError("선생님 코드가 올바르지 않습니다.");
          setLoading(false);
          return;
        }
        // Strict Validation: 1 Letter + 4 Digits (e.g., A1234)
        const codeRegex = /^[A-Z][0-9]{4}$/;
        if (!codeRegex.test(classCodeInput)) {
           setError("우리 반 코드는 '알파벳 1개 + 숫자 4개' 형식이어야 합니다. (예: A1234)");
           setLoading(false);
           return;
        }
        // Check uniqueness
        const exists = await checkClassCodeExists(classCodeInput);
        if (exists) {
          setError("이미 사용 중인 반 코드입니다. 다른 코드를 입력해주세요.");
          setLoading(false);
          return;
        }
        finalClassCode = classCodeInput;
      } else {
        // Student Logic
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
      }

      // Create Auth User
      const cred = await signUp(email, password);
      
      // Create User Profile
      await saveUserProfile(cred.user.uid, {
        email: email,
        role: role,
        name: name,
        displayName: name, // Use real name
        classCode: finalClassCode,
        createdAt: new Date().toISOString()
      });

      // Close modal and Redirect
      onClose();
      if (role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("이미 사용 중인 이메일입니다.");
      } else if (err.code === 'auth/weak-password') {
        setError("비밀번호는 6자 이상이어야 합니다.");
      } else {
        setError("회원가입 중 오류가 발생했습니다: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px", width: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>회원가입</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ms-text-muted)" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Role Selection */}
          <div style={{ display: "flex", background: "var(--ms-bg-subtle)", padding: "4px", borderRadius: "8px", marginBottom: "8px" }}>
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
                cursor: "pointer",
                transition: "all 0.2s"
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
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              선생님
            </button>
          </div>

          {error && <div style={{ color: "var(--ms-red)", fontSize: "14px", background: "var(--ms-red-light)", padding: "8px", borderRadius: "4px" }}>{error}</div>}

          {/* Common Fields */}
          <input 
            type="text" 
            placeholder="이름" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
            className="filter-input"
          />
          <input 
            type="email" 
            placeholder="이메일" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            className="filter-input"
          />
          <input 
            type="password" 
            placeholder="비밀번호 (6자 이상)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
            minLength={6}
            className="filter-input"
          />
          <input 
            type="password" 
            placeholder="비밀번호 확인" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required
            minLength={6}
            className="filter-input"
          />

            {/* Role Specific Fields */}
          {role === "teacher" ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px", padding: "12px", background: "var(--ms-bg-subtle)", borderRadius: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ms-text-muted)" }}>선생님 인증</div>
                <input 
                  type="password" 
                  placeholder="선생님 코드를 입력하세요" 
                  value={teacherCode} 
                  onChange={e => setTeacherCode(e.target.value)} 
                  className="filter-input"
                  style={{ background: "var(--ms-surface)" }}
                  required
                />
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ms-text-muted)", marginTop: "4px" }}>우리 반 코드 만들기</div>
                <input 
                  type="text" 
                  placeholder="(대문자1+숫자4자리)" 
                  value={classCodeInput} 
                  onChange={e => {
                    // Allow only alphanumeric, max 5 chars, uppercase
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                    setClassCodeInput(val);
                  }} 
                  className="filter-input"
                  style={{ background: "var(--ms-surface)", letterSpacing: "1px", fontWeight: "bold" }}
                  required
                  maxLength={5}
                />
                <div style={{ fontSize: "11px", color: "var(--ms-text-muted)" }}>학생들이 가입할 때 이 코드를 입력해야 합니다.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px", padding: "12px", background: "var(--ms-bg-subtle)", borderRadius: "8px" }}>
                 <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ms-text-muted)" }}>우리 반 코드 입력</div>
                 <input 
                  type="text" 
                  placeholder="(대문자1+숫자4자리)" 
                  value={classCodeInput} 
                  onChange={e => {
                     // Allow only alphanumeric, max 5 chars, uppercase
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "12px", padding: "12px" }}>
            {loading ? "가입 처리 중..." : "회원가입 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
