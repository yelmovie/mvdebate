"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../../services/authService";
import { saveUserProfile } from "../../services/userService";
import { ROLES, ROLE_HOME_URL, type UserRole } from "../../constants/roles";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(ROLES.STUDENT);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const cred = await signUp(email, password);
      
      // 2. Create Firestore Profile
      await saveUserProfile(cred.user.uid, {
        uid: cred.user.uid,
        email: email,
        role: role,
        name: name,
        createdAt: new Date().toISOString()
      });

      alert("회원가입이 완료되었습니다.");
      
      // Redirect based on role
      const target = ROLE_HOME_URL[role] || "/";
      router.push(target);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError("회원가입 중 오류가 발생했습니다: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px", margin: "0 auto" }}>
      <h2>회원가입</h2>
      {error && <div style={{ color: "red", fontSize: "14px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "10px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input 
                type="radio" 
                name="role" 
                value={ROLES.STUDENT} 
                checked={role === ROLES.STUDENT} 
                onChange={() => setRole(ROLES.STUDENT)}
            />
            학생
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input 
                type="radio" 
                name="role" 
                value={ROLES.TEACHER} 
                checked={role === ROLES.TEACHER} 
                onChange={() => setRole(ROLES.TEACHER)}
            />
            선생님
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input 
                type="radio" 
                name="role" 
                value={ROLES.PARENT} 
                checked={role === ROLES.PARENT} 
                onChange={() => setRole(ROLES.PARENT)}
            />
            학부모
        </label>
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
        placeholder="비밀번호 (6자 이상)" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required
        className="filter-input"
      />

      <input 
        type="password" 
        placeholder="비밀번호 확인" 
        value={passwordConfirm} 
        onChange={e => setPasswordConfirm(e.target.value)} 
        required
        className="filter-input"
      />

      <input 
        type="text" 
        placeholder="이름" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        required
        className="filter-input"
      />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
