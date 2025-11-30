"use client";

import { useEffect, useState } from "react";
import { loadTeachers, addTeacher, removeTeacher } from "../../../utils/teacherStorage";
import type { Teacher } from "../../../types/domain";

const TEACHER_PASSWORD = "5050";
const AUTH_STORAGE_KEY = "teacher_dashboard_auth";

export default function TeacherManagePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // 인증 상태 확인
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      setTeachers(loadTeachers());
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setPassword("");
      setTeachers(loadTeachers());
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setTeachers([]);
  };

  const handleAdd = () => {
    if (!displayName || !email) {
      alert("이름과 이메일을 모두 입력해 주세요.");
      return;
    }

    // 이메일 형식 간단 검증
    if (!email.includes("@") || !email.includes(".")) {
      alert("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      displayName: displayName.trim(),
      email: email.trim()
    };

    addTeacher(newTeacher);
    setTeachers(loadTeachers());
    setDisplayName("");
    setEmail("");
  };

  const handleRemove = (teacherId: string) => {
    if (!window.confirm("정말 이 선생님을 삭제할까요?")) return;
    removeTeacher(teacherId);
    setTeachers(loadTeachers());
  };

  // 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <main>
        <div className="dashboard-card" style={{ maxWidth: 400, margin: "100px auto" }}>
          <h1 className="dashboard-title">선생님 관리</h1>
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

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <h1 className="dashboard-title">선생님 관리</h1>
          <p className="dashboard-subtitle">
            모의 토론 결과를 받을 선생님의 이름과 이메일을 등록합니다.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: 12, padding: "6px 12px" }}>
          로그아웃
        </button>
      </div>

      {/* 새 선생님 추가 */}
      <section className="dashboard-card">
        <h2 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>새 선생님 추가</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
              이름/별명
            </label>
            <input
              className="filter-input"
              placeholder="예: 무비샘, 예리쌤"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
              이메일
            </label>
            <input
              type="email"
              className="filter-input"
              placeholder="예: teacher@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            추가
          </button>
        </div>
        <p className="hint-text" style={{ marginTop: 8 }}>
          이 정보는 모의 토론 결과 메일 보낼 때 사용됩니다. 학생 화면에는 이름/별명만 표시됩니다.
        </p>
      </section>

      {/* 등록된 선생님 목록 */}
      <section className="dashboard-card">
        <h2 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>등록된 선생님 목록</h2>
        {teachers.length === 0 ? (
          <p className="hint-text">등록된 선생님이 없습니다.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 9px" }}>이름/별명</th>
                  <th style={{ textAlign: "left", padding: "10px 9px" }}>이메일</th>
                  <th style={{ textAlign: "right", padding: "10px 9px" }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: "9px 9px" }}>{t.displayName} 선생님</td>
                    <td style={{ padding: "9px 9px" }}>{t.email}</td>
                    <td style={{ padding: "9px 9px", textAlign: "right" }}>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemove(t.id)}
                        style={{ fontSize: 12, padding: "4px 8px" }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

