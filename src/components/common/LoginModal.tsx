"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (nickname: string) => void;
}

export default function LoginModal({ open, onClose, onLoginSuccess }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [studentName, setStudentName] = useState("1번 학생");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 1번~30번 학생 목록 생성
  const studentOptions = Array.from({ length: 30 }, (_, i) => `${i + 1}번 학생`);

  if (!open) return null;

  const handleLogin = () => {
    setError("");

    if (role === "student") {
      if (!studentName) {
        setError("학생 이름을 선택해주세요.");
        return;
      }
      // 학생 로그인 처리
      localStorage.setItem("studentNickname", studentName);
      onLoginSuccess(studentName);
      onClose();
    } else {
      // 교사 로그인 처리
      if (password === "5050") {
        localStorage.setItem("teacher_dashboard_auth", "true");
        router.push("/teacher");
        onClose();
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: "400px" }}>
        <h2 className="modal-title" style={{ fontSize: "24px", marginBottom: "8px" }}>로그인</h2>
        <p style={{ color: "var(--ms-text-muted)", marginBottom: "20px" }}>
          교사 / 학생을 선택하고 들어가요.
        </p>

        {/* 역할 선택 */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "16px" }}>
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
              style={{ marginRight: "8px", width: "18px", height: "18px" }}
            />
            교사
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "16px" }}>
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
              style={{ marginRight: "8px", width: "18px", height: "18px" }}
            />
            학생
          </label>
        </div>

        {/* 입력 폼 */}
        <div style={{ marginBottom: "24px" }}>
          {role === "student" ? (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                이름 선택
              </label>
              <select
                className="filter-input"
                style={{ width: "100%", padding: "12px" }}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              >
                {studentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                비밀번호
              </label>
              <input
                type="password"
                className="filter-input"
                style={{ width: "100%", padding: "12px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: "var(--ms-rose)", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "16px", borderRadius: "12px" }}
          onClick={handleLogin}
        >
          로그인하기
        </button>
      </div>
    </div>
  );
}
