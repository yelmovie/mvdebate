"use client";

import { useState } from "react";
import { resetPassword } from "../../services/authService";

interface Props {
  onBack?: () => void;
}

export default function ResetPasswordForm({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await resetPassword(email);
      setMessage("비밀번호 재설정 이메일을 보냈습니다. 메일함을 확인해주세요.");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("등록되지 않은 이메일입니다.");
      } else {
        setError("오류가 발생했습니다: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
      <h2>비밀번호 찾기</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>
        가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
      </p>
      
      {message && <div style={{ color: "green", fontSize: "14px", fontWeight: "bold" }}>{message}</div>}
      {error && <div style={{ color: "red", fontSize: "14px" }}>{error}</div>}
      
      <input 
        type="email" 
        placeholder="이메일" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        required
        className="filter-input"
      />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "전송 중..." : "재설정 메일 보내기"}
      </button>

      {onBack && (
        <button 
          type="button" 
          onClick={onBack}
          style={{ background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", fontSize: "13px" }}
        >
          돌아가기
        </button>
      )}
    </form>
  );
}
