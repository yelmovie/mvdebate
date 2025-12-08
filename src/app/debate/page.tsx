"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopicSelector from "../../components/debate/TopicSelector";
import StanceSelector from "../../components/debate/StanceSelector";
import PersonaSelector from "../../components/debate/PersonaSelector";
import PrepWizard from "../../components/debate/PrepWizard";
import ChatPanel from "../../components/debate/ChatPanel";
import StructurePanel from "../../components/debate/StructurePanel";
import SummaryPanel from "../../components/debate/SummaryPanel";
import StudentSelfEvalPanel from "../../components/debate/StudentSelfEvalPanel";
import DifficultySelector from "../../components/debate/DifficultySelector";
import { useDebateSession } from "../../hooks/useDebateSession";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentNotices, getClassInfo } from "@/services/studentService";
import { Notice, ClassInfo, StudentProfile } from "@/types/schema";
import { CommonIcons, NavIcons, StudentIcons, iconStyles } from "@/lib/icons";
import { LuRefreshCw, LuPin, LuLock, LuHouse } from "react-icons/lu";

function DebateContent() {
  const { studentProfile, profile } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);

  // Require Student Session (not Firebase Auth)
  if (!studentProfile) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "24px",
        }}
      >
        <LuLock size={64} color={iconStyles.color.primary} />
        <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
          입장이 필요해요
        </h2>
        <p style={{ color: "var(--ms-text-muted)", fontSize: "1.1rem" }}>
          학생 토론에 참여하려면 반 코드로 입장해주세요.
          <br />
          메인 화면으로 돌아가서 입장해주세요.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/")}
          style={{
            padding: "12px 40px",
            fontSize: "1.1rem",
            borderRadius: "30px",
          }}
        >
          <NavIcons.Home size={20} className="inline-block mr-1" /> 입장하러 가기
        </button>
      </div>
    );
  }

  // Fetch notices and class info for students
  useEffect(() => {
    if (studentProfile) {
      const code = studentProfile.classCode;

      // 에러 처리 프로토콜 준수: try-catch 및 표준 로깅 형식
      getStudentNotices(code)
        .then(setNotices)
        .catch((error) => {
          console.error("[Firestore Error]", error);
          // 사용자에게는 간단한 메시지만 표시
          console.warn("공지사항을 불러오지 못했습니다.");
        });

      getClassInfo(code)
        .then((info) => {
          if (info) setClassInfo(info as ClassInfo);
        })
        .catch((error) => {
          console.error("[Firestore Error]", error);
          console.warn("반 정보를 불러오지 못했습니다.");
        });
    }
  }, [studentProfile]);

  const {
    store,
    currentTopic,
    stance,
    session,
    isLoading,
    selectedPersonaId,
    activeTab,
    setActiveTab,
    customTopicInput,
    setCustomTopicInput,
    showSummaryPanel,
    setShowSummaryPanel,
    topics,
    handleResetDebate,
    handleCreateSession,
    handleCustomTopicSubmit,
    stanceLabel,
  } = useDebateSession();

  const {
    claim,
    reasons,
    evidences,
    expectedCounter,
    rebuttal,
    setTopic, // Destructure setTopic from store
  } = store;

  return (
    <main>
      <h1 className="dashboard-title">AI랑 연습하는 토론 교실</h1>
      <p className="dashboard-subtitle">
        채팅으로 주장 · 근거 · 자료 · 반론을 정리하면서 토론 구조를 연습합니다.
      </p>

      {/* 현재 토론 주제 + 입장 배너 */}
      <section className="debate-banner">
        {currentTopic ? (
          <>
            <div className="debate-banner-topic">
              <span className="debate-banner-label">
                <LuPin size={16} className="inline-block mr-1" /> 선택된 토론 주제
              </span>
              <span className="debate-banner-title">{currentTopic.title}</span>
              {/* 주제 바꾸기 버튼 (Topic Selection 단계에서도 보임) */}
              <button
                onClick={handleResetDebate}
                style={{
                  marginLeft: "auto",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "var(--ms-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <LuRefreshCw size={18} className="inline-block" />
                <span>주제 바꾸기</span>
              </button>
            </div>

            <div className="debate-banner-stances">
              <div className="debate-banner-stance">
                <span className="debate-banner-label">학생 입장</span>
                <span
                  className={
                    "debate-banner-stance-pill " +
                    (stance === "pro"
                      ? "debate-banner-stance-pill--pro"
                      : stance === "con"
                      ? "debate-banner-stance-pill--con"
                      : "debate-banner-stance-pill--none")
                  }
                >
                  {stanceLabel}
                </span>
              </div>
              {stance && (
                <div className="debate-banner-stance">
                  <span className="debate-banner-label">AI 입장</span>
                  <span
                    className={
                      "debate-banner-stance-pill " +
                      (stance === "pro"
                        ? "debate-banner-stance-pill--con"
                        : "debate-banner-stance-pill--pro")
                    }
                  >
                    {stance === "pro" ? "반대 입장" : "찬성 입장"}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="debate-banner-empty">
            아직 토론 주제를 선택하지 않았어요. 아래에서 주제를 골라주세요.
          </div>
        )}
      </section>

      {!currentTopic && notices.length > 0 && (
        <section
          className="notice-board-section"
          style={{ marginTop: 20, marginBottom: 20 }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "#fbbf24", // Amber color for visibility
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📢 선생님 말씀 (공지사항)
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    padding: "12px",
                    background: "rgba(15, 23, 42, 0.6)",
                    borderRadius: "8px",
                    borderLeft: "4px solid #fbbf24",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "#f1f5f9" }}>
                      {notice.title}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#cbd5e1",
                      whiteSpace: "pre-line",
                      lineHeight: "1.5",
                    }}
                  >
                    {notice.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!currentTopic && (
        <div className="topic-selection-container" style={{ marginTop: 20 }}>
          {/* Common Topic Section */}
          {classInfo?.commonTopic && (
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)",
                  border: "2px solid #3b82f6",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <span
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  🏫 선생님이 정해주신 오늘의 주제
                </span>

                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "#ffffff",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  {classInfo.commonTopic.title}
                </h2>

                <button
                  className="btn btn-primary"
                  style={{
                    fontSize: "1.1rem",
                    padding: "12px 32px",
                    background: "#2563eb",
                    border: "none",
                    boxShadow: "0 0 15px rgba(37, 99, 235, 0.5)",
                  }}
                  onClick={() => {
                    setTopic({
                      id: "common-" + Date.now(),
                      title: classInfo.commonTopic!.title,
                      category: "학교/교육", // Default or generic
                      difficulty: 2, // 중간 난이도 (1: 쉬움, 2: 중간, 3: 어려움)
                      tags: ["common", "teacher-selected"],
                    });
                  }}
                >
                  이 주제로 토론하기 👉
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "24px 0",
                  color: "#94a3b8",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--ms-border-subtle)",
                  }}
                ></div>
                <span style={{ fontSize: "0.9rem" }}>
                  또는 다른 주제 고르기
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--ms-border-subtle)",
                  }}
                ></div>
              </div>
            </div>
          )}

          <div
            className="tab-header"
            style={{ display: "flex", gap: "10px", marginBottom: "16px" }}
          >
            <button
              className={`btn ${
                activeTab === "list" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveTab("list")}
            >
              📋 추천 주제
            </button>
            <button
              className={`btn ${
                activeTab === "random" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => {
                setActiveTab("random");
                const randomIndex = Math.floor(Math.random() * topics.length);
                setTopic(topics[randomIndex]);
              }}
            >
              🎲 랜덤 뽑기
            </button>
            <button
              className={`btn ${
                activeTab === "custom" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveTab("custom")}
            >
              ✍️ 직접 입력
            </button>
          </div>

          {activeTab === "list" && <TopicSelector topics={topics} />}

          {activeTab === "custom" && (
            <div
              className="custom-topic-input"
              style={{
                padding: "24px",
                background: "var(--ms-surface)",
                borderRadius: "12px",
                border: "1px solid var(--ms-border-subtle)",
              }}
            >
              <h3>직접 토론 주제를 입력해 볼까요?</h3>
              <p
                style={{ color: "var(--ms-text-muted)", marginBottom: "12px" }}
              >
                예: "급식 시간에 스마트폰을 사용해도 될까?", "숙제 없는 날을
                만들어야 할까?"
              </p>
              <textarea
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="토론하고 싶은 주제를 자유롭게 적어주세요."
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--ms-border)",
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleCustomTopicSubmit}
                disabled={!customTopicInput.trim()}
                style={{ width: "100%" }}
              >
                이 주제로 토론하기
              </button>
            </div>
          )}
        </div>
      )}

      {currentTopic && !stance && (
        <StanceSelector topicTitle={currentTopic.title} />
      )}

      {currentTopic && stance && !session && (
        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <PersonaSelector />
          <DifficultySelector />
          <div
            style={{
              margin: "32px 0",
              borderTop: "2px dashed var(--ms-border-subtle)",
            }}
          />
          <p style={{ marginBottom: "16px" }}>
            이제 토론 준비를 시작해 볼까요?
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCreateSession}
            disabled={isLoading || !selectedPersonaId}
            style={{ width: "100%", marginTop: "12px", padding: "16px" }}
          >
            세션 만들기
          </button>
        </div>
      )}

      {session && (
        <>
          <div className="debate-layout">
            <div>
              <PrepWizard />
            </div>
            <div>
              <StructurePanel
                claim={claim}
                reasons={reasons}
                evidences={evidences}
                expectedCounter={expectedCounter}
                rebuttal={rebuttal}
              />
            </div>
          </div>

          {/* 채팅창 패널 - handleResetDebate 전달 필요하면 prop으로 전달하거나 ChatPanel 내부에서 store.reset 사용 */}
          <ChatPanel />

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: 24,
              padding: "0 12px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => setShowSummaryPanel(!showSummaryPanel)}
              style={{
                maxWidth: "768px",
                width: "100%",
                padding: "12px 20px",
                fontSize: 15,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>
                {showSummaryPanel
                  ? "📊 토론 결과 보고서 숨기기"
                  : "📊 토론 결과 보고서 보기 (아래)"}
              </span>
              <span style={{ fontSize: 18 }}>
                {showSummaryPanel ? "▲" : "▼"}
              </span>
            </button>
          </div>

          {showSummaryPanel && (
            <div
              className="summary-panel"
              style={{
                marginTop: 24,
                maxWidth: "768px",
                margin: "24px auto",
                width: "100%",
              }}
            >
              <SummaryPanel />
            </div>
          )}

          <StudentSelfEvalPanel />
        </>
      )}
    </main>
  );
}

export default function DebatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebateContent />
    </Suspense>
  );
}
