"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import StudentEntryForm from "../components/student/StudentEntryForm";
import TeacherLoginCard from "../components/teacher/TeacherLoginCard";
import { CommonIcons } from "../lib/icons";
import { FaUserGraduate, FaChalkboardUser } from "react-icons/fa6";

export default function HomePage() {
  const {
    user,
    userRole,
    loading,
    logout,
  } = useAuth();

  // 기본은 항상 "student" 탭에서 시작 (teacher라도 학생 화면 먼저 보이게)
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  if (loading) {
    return (
      <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-20">
        <p className="text-slate-200 text-lg">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full min-h-[calc(100vh-70px)] items-center justify-center px-4 py-10">
      <section className="landing-glass w-full max-w-[640px] px-6 py-8 md:px-8 md:py-10">
        {/* Segmented login tabs (student / teacher) */}
        <div className="landing-segment w-full">
          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className="landing-tab landing-focus"
            data-active={activeTab === "student"}
            aria-pressed={activeTab === "student"}
          >
            <FaUserGraduate size={20} className="shrink-0" />
            <span className="whitespace-nowrap">학생 로그인</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teacher")}
            className="landing-tab landing-focus"
            data-active={activeTab === "teacher"}
            aria-pressed={activeTab === "teacher"}
          >
            <FaChalkboardUser size={20} className="shrink-0" />
            <span className="whitespace-nowrap">교사 로그인</span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8">
          {activeTab === "student" ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--landing-border)",
                  color: "var(--landing-muted)",
                }}
              >
                <FaUserGraduate size={16} className="shrink-0" />
                <span>학생 입장 안내</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--landing-text)" }}>
                반 코드를 입력하고 시작하세요
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--landing-muted)" }}>
                선생님이 알려주신 <span className="font-semibold" style={{ color: "var(--landing-text)" }}>반 코드</span>와
                <span className="font-semibold" style={{ color: "var(--landing-text)" }}> 번호 · 이름</span>을 입력하면
                오늘의 AI 모의 토론 방으로 입장할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--landing-border)",
                  color: "var(--landing-muted)",
                }}
              >
                <FaChalkboardUser size={16} className="shrink-0" />
                <span>선생님 전용</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--landing-text)" }}>
                구글 계정으로 시작하세요
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--landing-muted)" }}>
                구글 계정으로 로그인하여 수업을 관리하고 학생들의 토론 현황을 확인할 수 있습니다.
              </p>
            </div>
          )}

            {/* Teacher Logged In Notice */}
            {activeTab === "student" && userRole === "teacher" && (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-yellow-200 text-center">
                <CommonIcons.Suggestion size={14} className="inline-block mr-1.5 text-yellow-300" /> 
                선생님 계정으로 로그인 중입니다.
                <button onClick={logout} className="text-pink-300 underline hover:text-pink-200 ml-1.5 font-semibold transition-colors">
                  로그아웃
                </button>
              </div>
            )}

            {/* 폼 영역 - 카드 내부에 정확히 배치 */}
          <div className="flex justify-center">
            <div className="w-full max-w-[560px]">
              {activeTab === "student" ? <StudentEntryForm /> : <TeacherLoginCard />}
            </div>
          </div>
        </div>

        {/* 하단 개인정보 / 안내 문구 */}
        <div className="mt-8 text-center text-[12px] leading-relaxed" style={{ color: "var(--landing-faint)" }}>
          본 서비스는 교육 실험 목적의 시범 운영 중이며,
          <br />
          학생 이름 · 번호 · 반코드 외의 개인정보는 저장하지 않습니다.
          수업 종료 후 모든 학생 데이터는 자동 삭제됩니다.
        </div>
      </section>
    </main>
  );
}
