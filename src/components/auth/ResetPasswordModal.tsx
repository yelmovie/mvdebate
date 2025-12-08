"use client";

import { useState } from "react";
import { resetPassword } from "../../services/authService";
import { passwordResetErrors } from "../../constants/authMessages";

interface Props {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function ResetPasswordModal({ open, onClose, initialEmail = "" }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!email.trim()) {
      setMessage({ type: "error", text: passwordResetErrors["auth/missing-email"] });
      return;
    }
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setMessage({ type: "error", text: passwordResetErrors["auth/invalid-email"] });
        return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setMessage({ type: "success", text: "비밀번호 재설정 이메일을 보냈어요. 메일함을 확인해 주세요." });
    } catch (error: any) {
      console.error(error);
      const errorMessage = passwordResetErrors[error.code] || passwordResetErrors.default;
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px", width: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>비밀번호 재설정</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ms-text-muted)" }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: "14px", color: "var(--ms-text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
            가입하신 이메일 주소를 입력하시면,<br/> 
            비밀번호를 재설정할 수 있는 링크를 보내드립니다.<br/>
            (메일 제목과 내용은 Firebase 콘솔에서 수정 가능합니다.)
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input 
            type="email" 
            placeholder="가입한 이메일 입력" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            className="filter-input"
            disabled={loading || (message?.type === "success")}
          />
          
          {message && (
            <div style={{ 
                fontSize: "13px", 
                padding: "10px", 
                borderRadius: "4px",
                background: message.type === "success" ? "var(--ms-green-light)" : "var(--ms-red-light)",
                color: message.type === "success" ? "var(--ms-green)" : "var(--ms-red)"
            }}>
                {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || (message?.type === "success")}
          >
            {loading ? "전송 중..." : "재설정 메일 보내기"}
          </button>
          
          {message?.type === "success" && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                style={{ marginTop: "8px" }}
               >
                   닫기
               </button>
          )}
        </form>
      </div>
    </div>
  );
}
