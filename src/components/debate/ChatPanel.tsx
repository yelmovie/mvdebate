"use client";

import { useState, useRef, useEffect } from "react";
import { useDebateStore } from "../../store/debateStore";
import { sendTurn } from "../../services/debateService";
import { saveSessionToHistory } from "../../services/historyService";
import type { DebateSessionReport } from "../../types/domain";
import { containsBadWords, checkContentSafety } from "../../utils/filterUtils";
import { getLabelName } from "../../utils/labelClassifier";
import SelfReflectionModal from "./SelfReflectionModal";
import { PERSONAS } from "../../config/personas";
import PersonaWaitingScreen from "./PersonaWaitingScreen";
import { DEBATE_CONFIG, UI_TEXT } from "../../shared/constants";
import StudentSelfEvalPanel from "./StudentSelfEvalPanel";

export default function ChatPanel() {
  const {
    session,
    nickname,
    currentTopic,
    stance,
    turns,
    addTurn,
    setStructureFromLabel,
    isLoading,
    setLoading,
    setError,
    isEnded,
    setEnded,
    claim,
    reasons,
    evidences,
    selectedPersonaId,
    aiStance // Added aiStance
  } = useDebateStore();

  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);

  const [input, setInput] = useState("");
  const [studentTurnCount, setStudentTurnCount] = useState(0);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when turns change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [turns, isLoading]); // Trigger on turns update or loading state change

  // AI 첫 응답 대기 상태 관리
  useEffect(() => {
    if (session && isLoading && turns.length === 0) {
      setShowWaiting(true);
    } else if (turns.length > 0) {
      setShowWaiting(false);
    }
  }, [session, isLoading, turns.length]);

  // 세션이 바뀌면 턴 카운트 초기화
  useEffect(() => {
    if (session) {
      setStudentTurnCount(0);
      setEnded(false);
      setShowReflectionModal(false);
    }
  }, [session?.id]);

  // 토론 종료 시 회고 모달 표시
  useEffect(() => {
    if (isEnded && session) {
      setShowReflectionModal(true);
    }
  }, [isEnded]);

  // Auto-grow textarea functionality
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate new scrollHeight
      textareaRef.current.style.height = "auto";
      
      // On desktop (width > 768px), we might want to keep it fixed or limited
      // But user requested: 
      // - Mobile: auto-growing
      // - Desktop: 2-3 lines default (but can grow? User said "2~3줄 기본 높이", implies fixed or min-height)
      // Actually usually auto-grow is good for both, but maybe limit max height.
      // Let's implement a responsive check or just general auto-grow with max-height.
      
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      } else {
        // Desktop: Fixed height (or just reset to default rows height which is roughly handled by rows=3)
        // User asked "Desktop: 2~3줄 기본 높이", so we effectively disable auto-grow or keep it minimal.
        // If we simply don't set style.height, it respects 'rows={3}' (approx 3 lines).
        textareaRef.current.style.height = "auto"; // fallback to rows
      }
    }
  }, [input]);

  const handleReflectionSave = (reflection: { myClaim: string; aiCounterpoint: string; improvement: string }) => {
    if (!session) return;

    const grade = localStorage.getItem("studentGrade") || undefined;
    const classNumber = localStorage.getItem("studentClass") || undefined;

    const report: DebateSessionReport = {
      id: session.id,
      nickname: nickname || "익명 학생",
      topicTitle: currentTopic?.title || "알 수 없는 주제",
      stance: session.stance,
      createdAt: session.createdAt,
      claim: claim,
      reasonsCount: reasons.length,
      evidencesCount: evidences.length,
      reasons: reasons,
      evidences: evidences,
      turnCount: studentTurnCount,
      grade,
      classNumber,
      reflection
    };
    saveSessionToHistory(report);
    setShowReflectionModal(false);
    alert("토론 결과와 회고가 저장되었습니다! 수고하셨어요. 👏");
  };

  if (!session) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!input.trim()) return;

    if (input.length > DEBATE_CONFIG.MAX_INPUT_CHARS) {
      alert(`최대 ${DEBATE_CONFIG.MAX_INPUT_CHARS}자까지 입력할 수 있어요.`);
      return;
    }

    // Safety Check (Async)
    try {
      const safetyResult = await checkContentSafety(input);
      if (!safetyResult.allowed) {
        alert(safetyResult.feedbackForStudent || "비속어나 부적절한 단어가 포함되어 있습니다.\n바르고 고운 말을 사용해주세요.");
        return;
      }
    } catch (error) {
      console.error("Safety check failed:", error);
      // In case of error, we default to allowing (fail-open) or maybe a simple local check
      // For now, let's just proceed to avoid blocking the user due to server error
    }

    if (isLoading) return;

    if (studentTurnCount + 1 >= DEBATE_CONFIG.MAX_TURNS) {
      setEnded(true);
      return;
    }

    const messageText = input.trim();
    setInput("");
    setStudentTurnCount((prev) => prev + 1);

    try {
      setLoading(true);
      setError(undefined);

      const currentTurnCount = turns.length + 1;
      const turnIndex = currentTurnCount;
      const maxTurns = DEBATE_CONFIG.MAX_TURNS;

      let phase: "normal" | "closing-warning" | "closing-final" = "normal";
      if (turnIndex >= maxTurns - 2 && turnIndex < maxTurns) {
        phase = "closing-warning";
      } else if (turnIndex >= maxTurns) {
        phase = "closing-final";
      }

      const history = turns.slice(-6).map(t => ({
        role: t.sender === "student" ? "user" : "assistant" as "user" | "assistant",
        content: t.text
      }));

      const res = await sendTurn({
        sessionId: session.id,
        text: messageText,
        topicTitle: currentTopic?.title || "",
        stance: session.stance,
        difficulty: session.difficulty,
        turnCount: currentTurnCount,
        turnIndex,
        maxTurns,
        phase,
        history,
        personaId: selectedPersonaId,
        aiStance: aiStance // Pass explicit AI stance
      });

      addTurn(res.turn);
      if (res.aiTurn) {
        addTurn(res.aiTurn);
        setStructureFromLabel(res.aiTurn.label, res.turn.text);
      }

      if (studentTurnCount + 1 >= DEBATE_CONFIG.MAX_TURNS) {
        setEnded(true);
      }
    } catch (e: any) {
      console.error("[ChatPanel] Send error:", e);
      const errorMessage = e?.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      setError(errorMessage);
      setInput(messageText);
      setStudentTurnCount((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndDebate = () => {
    if (turns.length < 2) {
      alert("토론을 더 진행한 후 종료해 주세요.");
      return;
    }
    setEnded(true);
  };

  const handleRestart = () => {
    if (confirm("토론을 처음부터 다시 시작하시겠습니까?\n현재 대화 내용은 사라집니다.")) {
      window.location.reload();
    }
  };

  return (
    <div className="debate-ai-section">
      {showWaiting && currentTopic && stance && selectedPersonaId && (
        <PersonaWaitingScreen
          personaId={selectedPersonaId}
          topic={currentTopic.title}
          stance={stance}
        />
      )}
      
      {/* 1. Header Area */}
      <header className="debate-ai-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 12px 0", flexWrap: "wrap", gap: 8 }}>
          <h2 className="debate-section-title" style={{ margin: 0 }}>
            <span className="dot" />
            <span>5단계. AI와 모의 토론</span>
          </h2>
        </div>

        <div style={{ padding: "12px" }}>
          {/* Persona Header */}
          {selectedPersona && (
            <div className="persona-header" style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--ms-bg-soft)",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "12px",
              border: "2px solid var(--ms-border-subtle)"
            }}>
              <div style={{ position: "relative", width: "60px", height: "60px", flexShrink: 0 }}>
                <img
                  src={selectedPersona.image}
                  alt={selectedPersona.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--ms-primary)" }}>
                  {selectedPersona.name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--ms-text-muted)" }}>
                  {selectedPersona.description}
                </div>
              </div>
            </div>
          )}

          {session && currentTopic && (
            <div className="debate-topic-header" style={{
              background: "var(--ms-bg)",
              padding: "8px 0",
              borderBottom: "1px solid var(--ms-border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              <span className="topic-pill">{currentTopic.title}</span>
              {session.stance && (
                <span className={`badge-stance ${session.stance}`}>
                  {session.stance === "pro" ? "나: 찬성" : "나: 반대"}
                </span>
              )}
              {/* AI Stance Badge */}
              {aiStance && (
                <span className={`badge-stance ${aiStance}`} style={{ opacity: 0.9 }}>
                  AI: {aiStance === "pro" ? "찬성" : "반대"}
                </span>
              )}
              <span style={{ marginLeft: "auto", fontSize: "14px", fontWeight: "bold", color: "var(--ms-primary)" }}>
                {studentTurnCount}/{DEBATE_CONFIG.MAX_TURNS}턴
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Area (Chat + Input) */}
      <div className="debate-ai-main">
        {/* Chat Messages Area */}
        <div className="debate-ai-messages" ref={messagesContainerRef}>
          {turns.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: t.sender === "student" ? "flex-end" : "flex-start",
                marginBottom: "16px"
              }}
            >
              <div className="chat-label" style={{ alignSelf: t.sender === "student" ? "flex-end" : "flex-start", color: "var(--ms-text-muted)", marginBottom: "4px" }}>
                {t.sender === "student" ? "나의 " : "AI의 "} {getLabelName(t.label)}
              </div>
              <div
                className={
                  "chat-bubble " +
                  (t.sender === "student" ? "chat-bubble--student" : "chat-bubble--ai")
                }
              >
                {t.text}
              </div>
            </div>
          ))}
          
          {turns.length === 0 && (
            <p className="hint-text" style={{ textAlign: "center", padding: "2rem" }}>
              먼저 준비한 <strong>주장</strong>이나 <strong>근거</strong> 중 하나를 말해 보세요.
            </p>
          )}
          
          {isLoading && (
            <p className="hint-text" style={{ textAlign: "center" }}>
              AI가 생각 중... 💭
            </p>
          )}

          {/* Student Self Eval (Moved to page.tsx) */}

          {/* 20턴 도달 안내 */}
          {isEnded && studentTurnCount >= DEBATE_CONFIG.MAX_TURNS && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: "var(--ms-card-soft)", borderRadius: 8, textAlign: "center" }}>
              <p className="hint-text" style={{ margin: 0 }}>
                토론이 {DEBATE_CONFIG.MAX_TURNS}턴에 도달하여 종료되었습니다. 평가를 진행해 주세요.
              </p>
            </div>
          )}

          {/* 토론 종료 안내 */}
          {isEnded && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: "var(--ms-card-soft)", borderRadius: 8, textAlign: "center" }}>
              <p className="hint-text" style={{ margin: 0 }}>
                {window.innerWidth <= 768 ? UI_TEXT.END_DEBATE_MOBILE : UI_TEXT.END_DEBATE_DESKTOP}
              </p>
            </div>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Area */}
        {!isEnded && (
          <div className="debate-ai-input-area">
            <div style={{ marginBottom: 8, fontSize: 12, color: "var(--ms-text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>{input.length}/{DEBATE_CONFIG.MAX_INPUT_CHARS}자</span>
            </div>
            
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={UI_TEXT.INPUT_PLACEHOLDER}
                maxLength={DEBATE_CONFIG.MAX_INPUT_CHARS}
                rows={3}
                style={{ 
                  width: "100%", 
                  resize: "none"
                }}
              />

              <div className="input-hint" style={{
                color: "var(--ms-primary)",
                fontSize: "0.85rem",
                fontWeight: "bold",
                textAlign: "center",
                padding: "4px 0",
                marginTop: "12px"
              }}>
                {turns.length === 0
                  ? "💡 이번에는 [주장]을 명확하게 말해보자!"
                  : "💡 이번에는 [근거]나 [예시]를 들어볼까?"}
              </div>

              <div className="debate-ai-input-buttons">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLoading || !input.trim() || studentTurnCount >= DEBATE_CONFIG.MAX_TURNS}
                  style={{ flex: 1, padding: "12px" }}
                >
                  {UI_TEXT.SEND_BUTTON}
                </button>
                <button
                  type="button"
                  onClick={handleEndDebate}
                  className="btn btn-secondary"
                  disabled={isLoading || isEnded}
                  style={{ whiteSpace: "nowrap", padding: "12px 16px" }}
                >
                  {UI_TEXT.END_BUTTON}
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-secondary"
                  disabled={isLoading}
                  style={{ whiteSpace: "nowrap", padding: "12px 16px" }}
                >
                  {UI_TEXT.RESTART_BUTTON}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <SelfReflectionModal
        open={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        onSave={handleReflectionSave}
      />
    </div>
  );
}
