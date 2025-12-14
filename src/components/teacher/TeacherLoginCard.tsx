"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import TrialBadge from "../common/TrialBadge";
import { FaGoogle, FaChalkboardUser, FaRightFromBracket, FaCircleCheck } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import "./TeacherLoginCard.css";

export default function TeacherLoginCard() {
  const router = useRouter();
  const {
    user,
    loading,
    loginWithGoogle,
    loginAsGuestTeacher,
    isTrialMode,
    logout,
    getTeacherDisplayName,
  } = useAuth();

  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (loading) {
    return (
      <div className="teacher-login-card">
        <p className="text-center text-slate-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header 제거 - 상위 컴포넌트에서 처리 */}
      {!user && (
        <div className="mb-6 text-center">
          <TrialBadge />
        </div>
      )}

      {user ? (
        <div className="space-y-5 flex flex-col items-center">
           <div className="w-full">
             <div className="rounded-2xl p-5 text-center mb-6 landing-glass"
               style={{ borderColor: "rgba(34,197,94,0.28)" }}
             >
               <div className="flex items-center justify-center gap-3 mb-2">
                 <FaCircleCheck size={24} className="text-green-400" />
                 <p className="text-white text-xl font-bold">현재 로그인 상태입니다</p>
               </div>
               <p className="text-sm leading-relaxed" style={{ color: "var(--landing-muted)" }}>
                 대시보드로 이동하여 수업을 관리하세요
               </p>
             </div>
             
             <button
                onClick={() => router.push("/teacher/dashboard")}
                className="landing-primary-btn landing-focus flex items-center justify-center gap-2.5 mb-3"
             >
               <FaChalkboardUser size={18} className="shrink-0" />
               <span>대시보드 입장</span>
             </button>
             <button
                onClick={logout}
                className="landing-focus w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--landing-border)",
                  color: "var(--landing-text)",
                }}
             >
               <FaRightFromBracket size={18} className="shrink-0" />
               로그아웃
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-6 flex flex-col items-center">
           <div className="w-full">
             {/* Agreements */}
             <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl landing-focus"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--landing-border)" }}
                >
                  <input 
                     type="checkbox" 
                     checked={agreePrivacy} 
                     onChange={e => setAgreePrivacy(e.target.checked)}
                     className="w-5 h-5 cursor-pointer" 
                  />
                  <span className="text-sm font-medium flex-1" style={{ color: "var(--landing-text)" }}>개인정보 처리방침 동의</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl landing-focus"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--landing-border)" }}
                >
                  <input 
                     type="checkbox" 
                     checked={agreeTerms} 
                     onChange={e => setAgreeTerms(e.target.checked)}
                     className="w-5 h-5 cursor-pointer" 
                  />
                  <span className="text-sm font-medium flex-1" style={{ color: "var(--landing-text)" }}>이용약관 동의</span>
                </label>
             </div>

             <button
                onClick={() => {
                  if (!agreePrivacy || !agreeTerms) return alert("약관에 동의해주세요.");
                  loginWithGoogle();
                }}
                disabled={!agreePrivacy || !agreeTerms}
                className="landing-primary-btn landing-focus flex items-center justify-center gap-2.5"
             >
               <FaGoogle size={18} className="shrink-0" />
               <span>구글 계정으로 시작하기</span>
             </button>

             {isTrialMode && (
               <>
                 <div className="relative py-4">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                   <div className="relative flex justify-center text-sm uppercase"><span className="bg-slate-950 px-4 text-white/50 font-bold">OR</span></div>
                 </div>
                 <button
                    onClick={() => {
                      if (!agreePrivacy || !agreeTerms) return alert("약관에 동의해주세요.");
                      loginAsGuestTeacher();
                    }}
                    disabled={!agreePrivacy || !agreeTerms}
                    className="landing-focus w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--landing-border)",
                      color: "var(--landing-text)",
                    }}
                 >
                   <HiSparkles size={18} style={{ color: "var(--landing-accent)" }} className="shrink-0" />
                   <span>체험하기 (로그인 없이)</span>
                 </button>
               </>
            )}
           </div>
        </div>
      )}
    </div>
  );
}




