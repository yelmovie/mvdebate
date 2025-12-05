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
import DifficultySelector from "../../components/debate/DifficultySelector";
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
    difficulty, // Added difficulty
  } = useDebateStore();


  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      const id = `user-${Date.now()}`;
      setUser(id, nicknameParam);
    }
  }, [currentUserId, nicknameParam, setUser]);

  const topics = getTopics();

  // 탭 상태: "list" | "random" | "custom"
  const [activeTab, setActiveTab] = useState<"list" | "random" | "custom">("list");
  
  // 직접 입력 주제 상태
  const [customTopicInput, setCustomTopicInput] = useState("");

  const initializedRef = useState(false); // 초기화 여부 추적

  useEffect(() => {
    // 이미 주제가 설정되어 있으면 패스 (랜덤 모드일 때만)
    if (modeParam === "random" && currentTopic) {
        setActiveTab("random");
        return;
    }

    // 수동 모드일 때 이미 올바른 주제면 패스
    if (modeParam === "manual" && currentTopic?.id.toString() === topicIdParam) {
        setActiveTab("list");
        return;
    }

    if (modeParam === "random") {
      setActiveTab("random");
      if (!currentTopic) {
        const randomIndex = Math.floor(Math.random() * topics.length);
        setTopic(topics[randomIndex]);
      }
    } else if (modeParam === "manual" && topicIdParam) {
      setActiveTab("list");
      if (!currentTopic || currentTopic.id.toString() !== topicIdParam) {
        const found = topics.find((t) => t.id.toString() === topicIdParam);
        if (found) {
          setTopic(found);
        }
      }
    }
  }, [modeParam, topicIdParam, currentTopic, setTopic, topics]);

  // "주제 바꾸기" 등 초기화 핸들러
  const handleResetDebate = () => {
    if (confirm("지금 토론을 끝내고 새로운 주제를 선택할까요?\n지금까지의 대화 내용과 평가 기록은 삭제됩니다.")) {
        // Zustand store reset
        useDebateStore.getState().reset(); 
        
        // 추가적으로 URL 파라미터 클린업이나 탭 초기화 등
        setActiveTab("list");
        setCustomTopicInput("");
    }
  };

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
        difficulty: difficulty || "low", // Use selected difficulty or default to low
        personaId: selectedPersonaId,
      });
      startSession(s);
    } catch (e) {
      console.error(e);
      alert("세션 생성 중 오류가 발생했습니다.");
    }
  };

  const handleCustomTopicSubmit = () => {
    if (!customTopicInput.trim()) {
        alert("토론 주제를 입력해 주세요.");
        return;
    }
    // 임의의 Custom Topic 객체 생성
    const newTopic = {
        id: `custom-${Date.now()}`,
        title: customTopicInput.trim(),
        category: "custom", 
        difficulty: 1, 
        tags: ["custom"]
    };
    setTopic(newTopic);
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
                📌 선택된 토론 주제
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
                    transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <span>🔄</span> 
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

      {!currentTopic && (
        <div className="topic-selection-container" style={{ marginTop: 20 }}>
            <div className="tab-header" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button 
                    className={`btn ${activeTab === "list" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setActiveTab("list")}
                >
                    📋 추천 주제
                </button>
                <button 
                    className={`btn ${activeTab === "random" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => {
                        setActiveTab("random");
                        const randomIndex = Math.floor(Math.random() * topics.length);
                        setTopic(topics[randomIndex]);
                    }}
                >
                    🎲 랜덤 뽑기
                </button>
                <button 
                    className={`btn ${activeTab === "custom" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setActiveTab("custom")}
                >
                    ✍️ 직접 입력
                </button>
            </div>

            {activeTab === "list" && <TopicSelector topics={topics} />}
            
            {activeTab === "custom" && (
                <div className="custom-topic-input" style={{ 
                    padding: "24px", 
                    background: "var(--ms-surface)", 
                    borderRadius: "12px",
                    border: "1px solid var(--ms-border-subtle)"
                }}>
                    <h3>직접 토론 주제를 입력해 볼까요?</h3>
                    <p style={{ color: "var(--ms-text-muted)", marginBottom: "12px" }}>
                        예: "급식 시간에 스마트폰을 사용해도 될까?", "숙제 없는 날을 만들어야 할까?"
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
                            marginBottom: "16px"
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
          
          {/* 채팅창 패널 - handleResetDebate 전달 필요하면 prop으로 전달하거나 ChatPanel 내부에서 store.reset 사용 */}
          <ChatPanel />

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

          {showSummaryPanel && (
            <div
              className="summary-panel"
              style={{ marginTop: 24, maxWidth: "768px", margin: "24px auto", width: "100%" }}
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
