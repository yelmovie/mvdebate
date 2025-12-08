// src/app/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import StudentEntryForm from "../components/student/StudentEntryForm";
import TeacherLoginCard from "../components/teacher/TeacherLoginCard";
import { StudentIcons, TeacherIcons, CommonIcons, iconStyles } from "../lib/icons";

// --- Tab Button Component ---
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-base font-medium
        ${
          active
            ? "bg-white/20 text-white shadow-lg"
            : "text-white/60 hover:text-white hover:bg-white/10"
        }
      `}
    >
      <Icon 
        size={24} 
        color={iconStyles.color.primary}
        className="transition-all duration-200 hover:scale-105"
      />
      {label}
    </button>
  );
}

// --- Main Page ---
export default function Home() {
  const {
    user,
    userRole,
    loading,
    logout,
  } = useAuth();
  const router = useRouter();

  // 기본은 항상 "student" 탭에서 시작 (teacher라도 학생 화면 먼저 보이게)
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050616]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row w-full min-h-screen bg-[#050616] items-center justify-center" style={{ background: 'radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)' }}>

      {/* LEFT PANEL (브랜딩 영역) - 화면 상단 또는 좌측에 표시 */}
      <section className="flex w-full lg:w-1/2 items-center justify-center px-6 py-8 lg:py-12">
        <div className="max-w-lg space-y-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 text-sm font-semibold border border-violet-500/30">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            AI 기반 토론 학습 플랫폼
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              MovieSSam
            </span>
            <br />
            <span className="text-white">Debate Lab</span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed mx-auto">
            선생님은 쉽고 편하게 수업을 준비하고, <br />
            학생은 AI와 함께 즐겁게 토론 실력을 키웁니다.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              실시간 AI 피드백
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              체계적인 토론 구조
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              개인화된 학습 경험
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL (학생 또는 선생님 카드 공통) */}
      <section className="flex flex-col w-full lg:w-1/2 items-center justify-center px-6 py-8 lg:py-12">
        <div className="w-full max-w-md space-y-6">
          {/* 상단 탭 바: 학생 / 선생님 */}
          <div className="w-full">
            <div className="flex bg-black/30 p-2 gap-2 rounded-2xl border border-white/10">
              <TabButton
                active={activeTab === "student"}
                onClick={() => setActiveTab("student")}
                icon={StudentIcons.Entry}
                label="학생"
              />
              <TabButton
                active={activeTab === "teacher"}
                onClick={() => setActiveTab("teacher")}
                icon={TeacherIcons.Teacher}
                label="선생님"
              />
            </div>
          </div>

          {/* 탭에 따라 다른 카드 렌더링 */}
          {activeTab === "student" ? (
            <>
              <StudentEntryForm />

              {/* 선생님 계정으로 로그인한 상태에서 학생 화면 테스트할 때 안내 */}
              {userRole === "teacher" && (
                <div className="mt-5 p-4 rounded-xl bg-slate-800/50 text-sm text-slate-400 text-center">
                  <CommonIcons.Suggestion size={16} className="inline-block mr-1" /> 선생님 계정으로 로그인 중입니다.
                  <br />
                  학생 입장을 테스트하려면{" "}
                  <button
                    onClick={logout}
                    className="text-violet-400 underline hover:text-violet-300"
                  >
                    로그아웃
                  </button>{" "}
                  해주세요.
                </div>
              )}
            </>
          ) : (
            <TeacherLoginCard />
          )}
        </div>
      </section>
    </div>
  );
}
