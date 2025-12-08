"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SuggestionModal from "../common/SuggestionModal";
import QrPopup from "../common/QrPopup";
import BackButton from "../common/BackButton";
import { LogoutButton } from "../common/LogoutButton";
import { useScreenMode } from "../../context/ScreenModeContext";
import ModeSelectionModal from "../common/ModeSelectionModal";
import { useAuth } from "../../contexts/AuthContext";
import { USER_ROLES } from "../../config/authConfig";
import RoleSelectionModal from "../auth/RoleSelectionModal";
import { 
  NavIcons,
  CommonIcons,
  TeacherIcons,
  iconStyles,
} from "../../lib/icons";
import "./AppShell.css";

function UserHeaderProfile() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  if (!user || !profile) {
    return (
       <div style={{ display: "flex", gap: "8px" }}>
         {/* Guest or Not Logged In */}
       </div>
    );
  }

  const roleLabels: Record<string, string> = {
    [USER_ROLES.TEACHER]: "선생님",
    [USER_ROLES.STUDENT]: "학생",
    [USER_ROLES.GUEST]: "게스트",
  };

   const roleIcons: Record<string, React.ReactNode> = {
    [USER_ROLES.TEACHER]: <CommonIcons.School size={14} color={iconStyles.color.primary} />,
    [USER_ROLES.STUDENT]: <CommonIcons.GraduationCap size={14} color={iconStyles.color.primary} />,
    [USER_ROLES.GUEST]: <CommonIcons.User size={14} color={iconStyles.color.neutral} />,
  };

  const roleColors: Record<string, string> = {
    [USER_ROLES.TEACHER]: "var(--ms-primary)",
    [USER_ROLES.STUDENT]: "#10b981", // Emerald
    [USER_ROLES.GUEST]: "var(--ms-text-muted)",
  };

  const userRole = (profile && 'role' in profile) ? profile.role : null;
  const displayName = (profile && 'displayName' in profile) ? profile.displayName : user.email?.split("@")[0] || "User";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--ms-surface)", padding: "4px 12px", borderRadius: "20px", border: "1px solid var(--ms-border-subtle)" }}>
      {/* Role Badge */}
      <span style={{ 
        fontSize: "12px", 
        fontWeight: "bold", 
        color: (userRole && roleColors[userRole]) || "gray",
        background: "var(--ms-bg-subtle)",
        padding: "4px 8px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "4px"
      }}>
        {userRole && roleIcons[userRole]}
        {(userRole && roleLabels[userRole]) || userRole}
      </span>

      {/* Name */}
      <span style={{ fontSize: "14px", fontWeight: "500" }}>
        {displayName}
      </span>

      {/* Actions */}
      <div style={{ width: "1px", height: "12px", background: "var(--ms-border-subtle)" }}></div>
      <button 
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        style={{ color: "var(--ms-text-muted)", background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex", alignItems: "center" }}
        title="로그아웃"
      >
        <CommonIcons.Logout size={16} color={iconStyles.color.neutral} />
      </button>
    </div>
  );
}

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("ms-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

const HeaderIconButton = ({ 
  icon: Icon, 
  title, 
  onClick, 
  bgColor = "bg-slate-500" 
}: { 
  icon: any, 
  title: string, 
  onClick: () => void, 
  bgColor?: string
}) => (
  <button 
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white shadow transition hover:opacity-90 ${bgColor}`}
    title={title}
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);

function TeacherBoardButton() {
  const { profile } = useAuth();
  if (!profile || !('role' in profile) || profile.role !== USER_ROLES.TEACHER) return null;
  
  return (
    <button 
      type="button"
      onClick={() => window.open('/teacher', '_blank')}
      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-sm bg-green-500 hover:bg-green-600"
      title="선생님 대시보드"
    >
      <TeacherIcons.Dashboard size={18} color="#ffffff" />
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");

  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [skippedRoleSelection, setSkippedRoleSelection] = useState(false);
  const { screenMode, setScreenMode } = useScreenMode();
  const { user, profile, logout } = useAuth();

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
      {/* Top Fixed Navigation Bar */}
      <nav className="top-nav-bar">
        <div className="top-nav-left">
          <div className="top-nav-brand">
            <div className="top-nav-title">MovieSSam Debate Lab</div>
            <div className="top-nav-subtitle">학생용 AI 모의 토론 연습</div>
          </div>
        </div>
        
        <div className="top-nav-right">
          <Link href="/" className="top-nav-item">
            <NavIcons.Home size={18} className="transition-all duration-200 hover:scale-105" />
            <span>홈</span>
          </Link>
          <Link href="/debate" className="top-nav-item">
            <NavIcons.StudentDebate size={18} className="transition-all duration-200 hover:scale-105" />
            <span>학생 토론</span>
          </Link>
          <Link href="/student/mypage" className="top-nav-item">
            <NavIcons.MyPage size={18} className="transition-all duration-200 hover:scale-105" />
            <span>마이페이지</span>
          </Link>
          <button 
            className="top-nav-item"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 도움말 모달 또는 페이지 연결
            }}
          >
            <CommonIcons.Help size={18} className="transition-all duration-200 hover:scale-105" />
            <span>도움말</span>
          </button>
        </div>
      </nav>

      <header className="app-header">
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button className="app-logo" onClick={goHome} style={{ flexShrink: 0 }}>
            <img 
              src="/images/logo/profile.png" 
              alt="MovieSam Logo" 
              className="app-logo-img"
              width={40}
              height={40}
              style={{ borderRadius: "10px", objectFit: "cover" }}
            />
            <div className="app-logo-text">
              <div className="app-logo-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                MovieSSam Debate Lab 
                <span style={{ fontSize: "10px", fontWeight: "normal", background: "var(--ms-primary)", padding: "1px 4px", borderRadius: "4px", color: "white" }}>v1.0</span>
              </div>
              <div className="app-logo-sub">학생용 AI 토론 연습실</div>
            </div>
          </button>

          <nav className="app-nav-left" style={{ display: "flex", gap: "8px" }}>
            <button 
              className={"app-nav-tab" + (pathname === "/" ? " app-nav-tab--active" : "")} 
              onClick={goHome}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <NavIcons.Home size={18} color={iconStyles.color.white} />
              홈
            </button>
            <Link
              href="/debate"
              className={
                "app-nav-tab" + (isActive("/debate") ? " app-nav-tab--active" : "")
              }
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <NavIcons.StudentDebate size={18} color={iconStyles.color.white} />
              학생 토론
            </Link>
            <Link
              href="/student/mypage"
              className={
                "app-nav-tab" + (isActive("/student/mypage") ? " app-nav-tab--active" : "")
              }
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <NavIcons.MyPage size={18} color={iconStyles.color.white} />
              마이페이지
            </Link>
          </nav>
        </div>

        <div className="app-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          {/* User Profile */}
          <UserHeaderProfile />
          
          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>

          {/* Icons Row */}
          <div className="flex items-center gap-2">
              <HeaderIconButton 
                icon={CommonIcons.Back} 
                title="뒤로가기" 
                onClick={() => {
                    if (window.history.length > 1) router.back();
                    else router.push("/");
                }}
                bgColor="bg-slate-500 hover:bg-slate-600"
              />

              <HeaderIconButton 
                icon={CommonIcons.Suggestion} 
                title="건의하기" 
                onClick={() => setShowSuggestionModal(true)}
                bgColor="bg-amber-500 hover:bg-amber-600"
              />

              {/* QR Popup (Wrapper style handling is inside component, but we need to ensure alignment) */}
              <QrPopup />

              {/* Teacher Board is a pill button, distinct from icons */}
              <TeacherBoardButton />

              <HeaderIconButton 
                icon={theme === "dark" ? CommonIcons.Moon : CommonIcons.Sun}
                title="다크 모드" 
                onClick={toggleTheme}
                bgColor="bg-indigo-500 hover:bg-indigo-400"
              />

              <HeaderIconButton 
                icon={CommonIcons.Logout} 
                title="로그아웃" 
                onClick={async () => {
                     if(!confirm("로그아웃 하시겠습니까?")) return;
                     await logout();
                     router.push("/");
                }}
                bgColor="bg-pink-500 hover:bg-pink-400"
              />
          </div>
        </div>
      </header>



      <div className="dashboard-container">{children}</div>

      <SuggestionModal 
        open={showSuggestionModal} 
        onClose={() => setShowSuggestionModal(false)} 
      />
      <ModeSelectionModal />
      <RoleSelectionModal 
        open={!!(user && profile && 'role' in profile && profile.role === USER_ROLES.GUEST && 'provider' in user && user.providerData?.[0]?.providerId !== "anonymous" && !showSuggestionModal && !skippedRoleSelection)} 
        onClose={() => setSkippedRoleSelection(true)} 
      />
    </>
  );
}
