"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TeacherBoardModal from "../common/TeacherBoardModal";
import SuggestionModal from "../common/SuggestionModal";
import QrPopup from "../common/QrPopup";
import { useScreenMode } from "../../context/ScreenModeContext";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("ms-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const { screenMode, setScreenMode } = useScreenMode();

  // 초기 테마 로드
  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  // body 클래스 갱신
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.add("moviesam-root");
    body.classList.remove("moviesam-dark", "moviesam-light");
    body.classList.add(theme === "dark" ? "moviesam-dark" : "moviesam-light");
    window.localStorage.setItem("ms-theme", theme);
  }, [theme]);

  const goHome = () => router.push("/");

  const isActive = (path: string) => pathname?.startsWith(path);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <>
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button className="app-logo" onClick={goHome}>
            <img 
              src="/images/logo/profile.png" 
              alt="MovieSam Logo" 
              className="app-logo-img"
              width={40}
              height={40}
              style={{ borderRadius: "10px", objectFit: "cover" }}
            />
            <div className="app-logo-text">
              <div className="app-logo-title">MovieSSam Debate Lab</div>
              <div className="app-logo-sub">학생용 AI 토론 연습실</div>
            </div>
          </button>

          <nav className="app-nav-left" style={{ display: "flex", gap: "8px" }}>
            <button 
              className={"app-nav-tab" + (pathname === "/" ? " app-nav-tab--active" : "")} 
              onClick={goHome}
            >
              <span style={{ marginRight: "6px" }}>🏠</span>
              홈
            </button>
            <Link
              href="/debate"
              className={
                "app-nav-tab" + (isActive("/debate") ? " app-nav-tab--active" : "")
              }
            >
              <span style={{ marginRight: "6px" }}>🗣️</span>
              학생 토론
            </Link>
          </nav>
        </div>

        <div className="app-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <QrPopup />

          <button 
            onClick={() => setShowTeacherModal(true)}
            className="btn-teacher-nav"
            title="교사용 대시보드"
          >
            <span style={{ marginRight: "6px" }}>👨‍🏫</span>
            교사용
          </button>
          <button 
            onClick={() => setShowSuggestionModal(true)}
            className="btn-dev-nav"
            title="개발자에게 제안하기"
          >
            <span style={{ marginRight: "6px" }}>💡</span>
            개발자용
          </button>

          <div style={{ width: "1px", height: "24px", background: "var(--ms-border-subtle)", margin: "0 4px" }}></div>

          {/* 화면 모드 토글 */}
          <div className="screen-mode-toggle" style={{ display: "flex", gap: "2px", background: "var(--ms-card)", padding: "2px", borderRadius: "8px", border: "1px solid var(--ms-border-subtle)" }}>
            <button 
              onClick={() => setScreenMode("phone-portrait")}
              className={`mode-btn ${screenMode === "phone-portrait" ? "active" : ""}`}
              title="폰 모드 (세로)"
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "none",
                background: screenMode === "phone-portrait" ? "var(--ms-primary)" : "transparent",
                color: screenMode === "phone-portrait" ? "white" : "var(--ms-text-muted)",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s"
              }}
            >
              📱
            </button>
            <button 
              onClick={() => setScreenMode("tablet-landscape")}
              className={`mode-btn ${screenMode === "tablet-landscape" ? "active" : ""}`}
              title="태블릿/PC 모드 (가로)"
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "none",
                background: screenMode === "tablet-landscape" ? "var(--ms-primary)" : "transparent",
                color: screenMode === "tablet-landscape" ? "white" : "var(--ms-text-muted)",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s"
              }}
            >
              💻
            </button>
          </div>

          <div style={{ width: "1px", height: "24px", background: "var(--ms-border-subtle)", margin: "0 4px" }}></div>

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? (
              <>
                <span className="theme-icon">☾</span>
              </>
            ) : (
              <>
                <span className="theme-icon">☀</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ✅ 시험 운영 안내 배너 */}
      <div className="beta-banner">
        <span className="beta-dot" />
        <span className="beta-text">
          현재 이 웹앱은 <strong>12월 말까지 시험 운영 중</strong>입니다. 수업 시간
          내에서만 사용해 주세요.
        </span>
      </div>

      <div className="dashboard-container">{children}</div>

      <TeacherBoardModal 
        open={showTeacherModal} 
        onClose={() => setShowTeacherModal(false)} 
      />
      <SuggestionModal 
        open={showSuggestionModal} 
        onClose={() => setShowSuggestionModal(false)} 
      />
    </>
  );
}
