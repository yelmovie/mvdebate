"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../../services/authService";
import { getUserProfile } from "../../services/userService";
import { ROLE_HOME_URL, type UserRole } from "../../constants/roles";
import { useAuth } from "../../contexts/AuthContext";
import SignupModal from "./SignupModal";
import ResetPasswordModal from "./ResetPasswordModal";

interface Props {
  onForgotPassword?: () => void;
}

export default function LoginForm({ onForgotPassword }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      // AuthContext handles state updates. 
      // Redirect logic is in LandingPage (src/app/page.tsx) which watches auth state.
    } catch (err) {
      console.error(err);
      setError("구글 로그인 실패");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signIn(email, password);
      // Fetch role to deciding where to redirect
      const profile = await getUserProfile(cred.user.uid);
      
      if (profile) {
        const target = ROLE_HOME_URL[profile.role as UserRole] || "/";
        router.push(target);
      } else {
        // No profile found, maybe redirect to a specific setup page
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
      setLoading(false); // Only stop loading on error, on success we redirect
    } 
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
      <h2>로그인</h2>
      
      {/* Teacher Benefit Banner */}
      <div style={{ background: "var(--ms-surface)", padding: "12px", borderRadius: "8px", border: "1px solid var(--ms-primary)", marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--ms-primary)", marginBottom: "4px" }}>
          👨‍🏫 선생님으로 로그인하시면:
        </div>
        <ul style={{ margin: 0, padding: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--ms-text-muted)" }}>
           <li>실시간으로 우리 반 학생들의 <strong>토론 현황</strong> 확인</li>
           <li>학생별 맞춤형 <strong>토론 결과 리포트</strong> 제공</li>
        </ul>
      </div>

      {error && <div style={{ color: "red", fontSize: "14px" }}>{error}</div>}
      
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="btn"
        disabled={loading}
        style={{
          backgroundColor: "#ffffff",
          color: "#757575",
          border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "10px",
          cursor: "pointer"
        }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "18px", height: "18px" }} />
        Google로 시작하기
      </button>

      <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
        <span style={{ padding: "0 10px", fontSize: "12px", color: "#888" }}>또는 이메일로 로그인</span>
        <div style={{ flex: 1, height: "1px", background: "#ddd" }}></div>
      </div>
      
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
        placeholder="비밀번호" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required
        className="filter-input"
      />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "처리 중..." : "로그인"}
      </button>

      {/* Forgot Password Link */}
      <button 
        type="button" 
        onClick={() => setShowResetPassword(true)}
        style={{ background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", fontSize: "13px", alignSelf: "center" }}
      >
        비밀번호를 잊으셨나요?
      </button>

      <button 
        type="button"
        onClick={() => {
          setShowSignup(true);
          setError("");
        }}
        style={{ background: "none", border: "none", color: "var(--ms-primary)", cursor: "pointer", fontSize: "14px", marginTop: "4px" }}
      >
        계정이 없으신가요? 회원가입
      </button>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
      <ResetPasswordModal 
        open={showResetPassword} 
        onClose={() => setShowResetPassword(false)} 
        initialEmail={email} // Pass current input
      />
    </form>
  );
}
