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
import Navbar from "./Navbar";
import ActionButtons from "./ActionButtons";
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

export default function AppShell() {
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
      {/* Single Navbar - Clean Design */}
      <Navbar />

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
