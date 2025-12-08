"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { TeacherIcons, CommonIcons, iconStyles } from "../../lib/icons";
import TrialBadge from "../common/TrialBadge";
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
    <div className="teacher-login-wrapper">
      <div className="teacher-login-card">
        {/* Card Header */}
        <div className="teacher-login-header">
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
            <TrialBadge />
          </div>
          <div className="teacher-login-badge">12월 체험 토론 기간 (24H 접근)</div>
          <h1 className="teacher-login-title">
            <TeacherIcons.Teacher 
              className="inline-block mr-2 align-middle transition-all duration-200 hover:scale-105" 
              size={24} 
              color={iconStyles.color.primary} 
            />
            {user ? "환영합니다" : "선생님 입장"}
          </h1>
          <p className="teacher-login-subtitle">
            {user 
              ? <>반을 개설하고 학생 활동을 관리하세요.</>
              : <>구글 계정으로 로그인하여 토론 수업을 시작하세요.</>
            }
          </p>
        </div>

        {user ? (
          /* Logged In State */
          <div className="teacher-login-content">
            {/* Welcome Message */}
            <div className="teacher-login-welcome">
              <p className="teacher-login-welcome-name">
                <span className="text-violet-400">{getTeacherDisplayName()}</span> 선생님
              </p>
              <p className="teacher-login-welcome-text">대시보드에서 수업을 관리할 수 있습니다.</p>
            </div>

            {/* Dashboard Button */}
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="teacher-login-button teacher-login-button--primary"
            >
              <TeacherIcons.Dashboard size={18} className="inline-block mr-2 align-middle" />
              대시보드 입장하기
            </button>

            {/* Logout Link */}
            <button
              onClick={logout}
              className="teacher-login-logout"
            >
              로그아웃
            </button>
          </div>
        ) : (
          /* Not Logged In State */
          <div className="teacher-login-content">
            {/* Agreement Checkboxes */}
            <div className="teacher-login-agreement">
              <label className="teacher-login-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="teacher-login-checkbox"
                />
                <span className="teacher-login-checkbox-text">
                  개인정보 처리방침에 동의합니다{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="teacher-login-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    (보기)
                  </a>
                </span>
              </label>
              <label className="teacher-login-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="teacher-login-checkbox"
                />
                <span className="teacher-login-checkbox-text">
                  이용약관에 동의합니다{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="teacher-login-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    (보기)
                  </a>
                </span>
              </label>
            </div>

            {/* Google Login Button */}
            <button
              onClick={() => {
                if (!agreePrivacy || !agreeTerms) {
                  alert("개인정보 처리방침과 이용약관에 동의해주세요.");
                  return;
                }
                loginWithGoogle();
              }}
              disabled={!agreePrivacy || !agreeTerms}
              className="teacher-login-button teacher-login-button--primary"
            >
              <CommonIcons.Google size={20} color="#ffffff" />
              구글 계정으로 시작하기
            </button>

            {isTrialMode && (
              <>
                <div className="teacher-login-divider">
                  <div className="teacher-login-divider-line" />
                  <span className="teacher-login-divider-text">OR</span>
                  <div className="teacher-login-divider-line" />
                </div>

                <button
                  onClick={() => {
                    if (!agreePrivacy || !agreeTerms) {
                      alert("개인정보 처리방침과 이용약관에 동의해주세요.");
                      return;
                    }
                    loginAsGuestTeacher();
                  }}
                  disabled={!agreePrivacy || !agreeTerms}
                  className="teacher-login-button teacher-login-button--secondary"
                >
                  🎁 체험하기 (로그인 없이)
                </button>
              </>
            )}
          </div>
        )}

        {/* Privacy Notice - Same as Student */}
        <div className="teacher-login-privacy">
          본 서비스는 2025년 교육 실험 목적의 시범 운영 중이며<br />
          교사 이메일 외의 개인정보는 저장하지 않습니다.<br />
          시범 운영 종료 후 모든 데이터는 자동 삭제됩니다.
        </div>
      </div>
    </div>
  );
}

