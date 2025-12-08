/**
 * MovieSSam Icon System - One Source of Truth
 * 
 * 아이콘 라이브러리 규칙:
 * - 기본: Lucide Icons (react-icons/lu)
 * - 학생 친화 기능: Phosphor Icons (react-icons/pi)
 * - 교사/대시보드/관리: FontAwesome (react-icons/fa6)
 * - 브랜드/인증: Simple Icons (react-icons/si)
 * 
 * 색상: #C084FC (Primary), #F9A8D4 (Accent), #ffffff, #f3e8ff
 * 크기: 22-28px (모바일 20px)
 */

import React from "react";

// Lucide Icons (기본)
import {
  LuMessagesSquare,
  LuUserCog,
  LuSettings,
  LuLayoutDashboard,
  LuUsers,
  LuMegaphone,
  LuGift,
  LuDownload,
  LuCalendarCheck2,
  LuDoorOpen,
  LuUserRound,
  LuRocket,
  LuMessageSquare,
  LuLogOut,
  LuSun,
  LuMoon,
  LuChevronLeft,
  LuLightbulb,
  LuGraduationCap,
  LuSchool,
  LuUser,
  LuMessageCircle,
  LuQrCode,
  LuLock,
  LuPin,
  LuRefreshCw,
  LuCircleHelp,
  LuSmartphone,
  LuHouse,
} from "react-icons/lu";

// Phosphor Icons (학생 친화)
import {
  PiIdentificationBadge,
  PiTarget,
  PiStudent,
} from "react-icons/pi";

// FontAwesome (교사/관리)
import {
  FaChalkboard,
} from "react-icons/fa6";

// Simple Icons (브랜드/인증)
import {
  SiGoogle,
} from "react-icons/si";

// FontAwesome Google (fa6에서 Google 아이콘은 없으므로 fa에서 가져옴)
import {
  FaGoogle,
} from "react-icons/fa";

// ============================================
// 아이콘 컴포넌트 타입
// ============================================
export interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
}

// ============================================
// 학생용 화면 아이콘
// ============================================
export const StudentIcons = {
  Entry: LuDoorOpen,
  UserInput: LuUserRound,
  ClassCode: PiIdentificationBadge,
  StartDebate: LuRocket,
  Difficulty: PiTarget,
  AIChat: LuMessageSquare,
  Student: PiStudent,
};

// ============================================
// 교사용 화면 아이콘
// ============================================
export const TeacherIcons = {
  Dashboard: LuLayoutDashboard,
  StudentList: LuUsers,
  Activity: LuUsers, // PiActivity가 없으므로 LuUsers로 대체
  Notice: LuMegaphone,
  Gift: LuGift,
  Download: LuDownload,
  Schedule: LuCalendarCheck2,
  Teacher: FaChalkboard,
};

// ============================================
// 네비게이션 아이콘
// ============================================
export const NavIcons = {
  Home: LuHouse, // LuHome 대신 LuHouse 사용
  StudentDebate: LuMessagesSquare,
  MyPage: LuUserCog,
  Settings: LuSettings,
};

// ============================================
// 공통 아이콘
// ============================================
export const CommonIcons = {
  Logout: LuLogOut,
  Sun: LuSun,
  Moon: LuMoon,
  Back: LuChevronLeft,
  Suggestion: LuLightbulb,
  User: LuUser,
  MessageCircle: LuMessageCircle,
  GraduationCap: LuGraduationCap,
  School: LuSchool,
  Google: FaGoogle,
  QrCode: LuQrCode,
  Lock: LuLock,
  Pin: LuPin,
  Refresh: LuRefreshCw,
  Help: LuCircleHelp,
  Smartphone: LuSmartphone,
};

// ============================================
// 아이콘 스타일 유틸리티
// ============================================
export const iconStyles = {
  // 기본 크기
  size: {
    default: 24,
    mobile: 20,
    small: 18,
    large: 28,
  },
  // 색상
  color: {
    primary: "#C084FC",
    accent: "#F9A8D4",
    white: "#ffffff",
    lightGray: "#f3e8ff",
    neutral: "#E5E7EB",
  },
  // 클래스 이름
  className: {
    default: "text-purple-300 transition-all duration-200 hover:text-purple-400 hover:scale-105",
    white: "text-white transition-all duration-200 hover:text-purple-400 hover:scale-105",
    lightGray: "text-slate-300 transition-all duration-200 hover:text-purple-400 hover:scale-105",
  },
};
