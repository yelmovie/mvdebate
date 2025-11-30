"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDebateStore } from "../../store/debateStore";
import { getTopics } from "../../services/configService";
import TopicSelector from "../../components/debate/TopicSelector";
import StanceSelector from "../../components/debate/StanceSelector";
import PersonaSelector from "../../components/debate/PersonaSelector";
import PrepWizard from "../../components/debate/PrepWizard";
import ChatPanel from "../../components/debate/ChatPanel";
import StructurePanel from "../../components/debate/StructurePanel";
import SummaryPanel from "../../components/debate/SummaryPanel";
import StudentSelfEvalPanel from "../../components/debate/StudentSelfEvalPanel";
import { createSession } from "../../services/debateService";

function DebateContent() {
  const searchParams = useSearchParams();
  const nicknameParam = searchParams?.get("nickname") || "학생";
  const modeParam = searchParams?.get("mode");
  const topicIdParam = searchParams?.get("topicId");

  const {
    currentUserId,
    setUser,
    currentTopic,
    setTopic,
    stance,
    session,
    startSession,
    isLoading,
    claim,
    reasons,
    evidences,
    expectedCounter,
    rebuttal,
    selectedPersonaId,
  } = useDebateStore();


  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      const id = `user-${Date.now()}`;
      setUser(id, nicknameParam);
    }
  }, [currentUserId, nicknameParam, setUser]);

  const topics = getTopics();

  // URL 파라미터에 따른 주제 자동 선택
  // URL 파라미터에 따른 주제 자동 선택
  // URL 파라미터에 따른 주제 자동 선택
  const initializedRef = useState(false); // 초기화 여부 추적

  useEffect(() => {
    // 이미 주제가 설정되어 있으면 패스 (랜덤 모드일 때만)
    if (modeParam === "random" && currentTopic) return;

    // 수동 모드일 때 이미 올바른 주제면 패스
    if (modeParam === "manual" && currentTopic?.id.toString() === topicIdParam)
      return;

    if (modeParam === "random") {
      if (!currentTopic) {
        const randomIndex = Math.floor(Math.random() * topics.length);
        setTopic(topics[randomIndex]);
      }
    } else if (modeParam === "manual" && topicIdParam) {
      if (!currentTopic || currentTopic.id.toString() !== topicIdParam) {
        const found = topics.find((t) => t.id.toString() === topicIdParam);
        if (found) {
          setTopic(found);
        }
      }
    }
  }, [modeParam, topicIdParam, currentTopic, setTopic]); // topics 제거

  const handleCreateSession = async () => {
    if (!currentUserId || !currentTopic || !stance || !selectedPersonaId) {
      alert("토론 상대를 선택해 주세요!");
      return;
    }
    try {
      const s = await createSession({
        userId: currentUserId,
        topicId: currentTopic.id,
        stance,
        difficulty: "easy",
        personaId: selectedPersonaId,
      });
      startSession(s);
    } catch (e) {
      console.error(e);
    }
  };

  const stanceLabel =
    stance === "pro"
      ? "찬성 입장"
      : stance === "con"
      ? "반대 입장"
      : "입장 미선택";

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
                📌 1단계. 토론 주제 고르기
              </span>
              <span className="debate-banner-title">{currentTopic.title}</span>
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
            아직 토론 주제를 선택하지 않았어요. 👉{" "}
            <b>왼쪽 패널에서 '랜덤 토론 주제 뽑기' 버튼을 눌러 주세요.</b>
          </div>
        )}
      </section>

      {!currentTopic && <TopicSelector topics={topics} />}

      {currentTopic && !stance && (
        <StanceSelector topicTitle={currentTopic.title} />
      )}

      {currentTopic && stance && !session && (
        <div className="dashboard-card" style={{ marginTop: 24 }}>
          <PersonaSelector />
          
          <div style={{ margin: "32px 0", borderTop: "2px dashed var(--ms-border-subtle)" }} />



          <p style={{ marginBottom: "16px" }}>이제 토론 준비를 시작해 볼까요?</p>
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
          {/* 채팅창을 가운데로 분리 */}
          <ChatPanel />

          {/* 학생 자기 평가 (5단계의 일부로 포함하거나 별도 섹션으로 배치) */}
          <StudentSelfEvalPanel />

          {/* 토론 결과 보고서 토글 버튼 */}
          <div style={{ 
            width: "100%", 
            display: "flex", 
            justifyContent: "center", 
            marginTop: 24, 
            padding: "0 12px" 
          }}>
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
                gap: 8
              }}
            >
              <span>{showSummaryPanel ? "📊 토론 결과 보고서 숨기기" : "📊 토론 결과 보고서 보기 (아래)"}</span>
              <span style={{ fontSize: 18 }}>{showSummaryPanel ? "▲" : "▼"}</span>
            </button>
          </div>

          {/* 토론 결과 보고서 섹션 (조건부 렌더링) */}
          {showSummaryPanel && (
            <div
              className="summary-panel"
              style={{ marginTop: 24, maxWidth: "768px", margin: "24px auto", width: "100%" }}
            >
              <SummaryPanel />
            </div>
          )}
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
