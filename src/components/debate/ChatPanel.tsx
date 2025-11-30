"use client";

import { useState, useRef, useEffect } from "react";
import { useDebateStore } from "../../store/debateStore";
import { sendTurn } from "../../services/debateService";
import { saveSessionToHistory } from "../../services/historyService";
import type { DebateSessionReport } from "../../types/domain";
import { containsBadWords } from "../../utils/filterUtils";
import { getLabelName } from "../../utils/labelClassifier";
import SelfReflectionModal from "./SelfReflectionModal";
import { apiFetch } from "../../services/apiClient";
import { PERSONAS } from "../../config/personas";
import Image from "next/image";
import PersonaWaitingScreen from "./PersonaWaitingScreen";

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
    selectedPersonaId
  } = useDebateStore();

  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);

  const [input, setInput] = useState("");
  // const [isEnded, setIsEnded] = useState(false); // Removed local state
  
  // 20턴 강제 종료를 위한 턴 카운트 (학생 발화 기준)
  const [studentTurnCount, setStudentTurnCount] = useState(0);
  const MAX_TURNS = 20;
  const MAX_INPUT_CHARS = 200;

  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

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
    // 폼 제출 시 페이지 리로드 방지
    if (e) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;

    if (input.length > MAX_INPUT_CHARS) {
      alert(`한 번에 ${MAX_INPUT_CHARS}자까지만 쓸 수 있어요.\n핵심만 간단히 적어보자!`);
      return;
    }

    if (containsBadWords(input)) {
      alert("비속어나 부적절한 단어가 포함되어 있습니다.\n바르고 고운 말을 사용해주세요.");
      return;
    }

    if (isLoading) return; // Assuming 'isSending' in the instruction refers to 'isLoading' from the store
    
    // 20턴 체크: 다음 턴이 20턴이면 여기서 종료
    if (studentTurnCount + 1 >= MAX_TURNS) {
      setEnded(true);
      // 마지막 메시지는 보내지 않고 바로 평가 모달 열기
      // SummaryPanel의 handleEndDebate를 트리거하기 위해 상태만 변경
      return;
    }
    
    const messageText = input.trim();
    setInput(""); // 입력창 먼저 비우기 (UX 개선)
    
    // 학생 턴 수 증가
    setStudentTurnCount((prev) => prev + 1);
    
    try {
      setLoading(true);
      setError(undefined);

      // 현재 턴 수 계산 (학생 + AI 합산)
      // turns.length는 현재까지의 턴 수. 이번에 학생이 보내면 +1.
      const currentTurnCount = turns.length + 1;
      const turnIndex = currentTurnCount; // 이번 AI 응답의 턴 번호
      const maxTurns = MAX_TURNS;
      
      // phase 계산
      let phase: "normal" | "closing-warning" | "closing-final" = "normal";
      if (turnIndex >= maxTurns - 2 && turnIndex < maxTurns) {
        phase = "closing-warning";
      } else if (turnIndex >= maxTurns) {
        phase = "closing-final";
      }

      // Construct history (Sliding Window: Last 6 turns)
      // Upstage API expects "user" or "assistant" roles
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
        personaId: selectedPersonaId
      });

      addTurn(res.turn);
      if (res.aiTurn) {
        addTurn(res.aiTurn);
        setStructureFromLabel(res.aiTurn.label, res.turn.text);
      }
      
      // AI 응답 후에도 20턴 체크 (AI 응답 포함해서 20턴이면 종료)
      if (studentTurnCount + 1 >= MAX_TURNS) {
        setEnded(true);
      }
    } catch (e: any) {
      console.error("[ChatPanel] Send error:", e);
      const errorMessage = e?.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      setError(errorMessage);
      // 오류 발생 시 입력 내용 복원 및 턴 수 복원
      setInput(messageText);
      setStudentTurnCount((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter만 누르면 전송, Shift+Enter는 줄바꿈
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
    <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginTop: 24, padding: "0 12px", position: "relative" }}>
      {showWaiting && currentTopic && stance && selectedPersonaId && (
        <PersonaWaitingScreen
          personaId={selectedPersonaId}
          topic={currentTopic.title}
          stance={stance}
        />
      )}
      <section className="debate-card chat-panel" style={{ width: "100%", maxWidth: "768px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h2 className="debate-section-title" style={{ margin: 0 }}>
            <span className="dot" />
            <span>5단계. AI와 모의 토론</span>
          </h2>
          
        </div>

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
          <div className="debate-topic-header" style={{ marginBottom: 12, position: "sticky", top: 0, zIndex: 10, background: "var(--ms-bg)", padding: "8px 0", borderBottom: "1px solid var(--ms-border-subtle)" }}>
            <span className="topic-pill">{currentTopic.title}</span>
            {session.stance && (
              <span className={`badge-stance ${session.stance}`}>
                {session.stance === "pro" ? "찬성 입장" : "반대 입장"}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: "14px", fontWeight: "bold", color: "var(--ms-primary)" }}>
              {studentTurnCount}/{MAX_TURNS}턴
            </span>
          </div>
        )}

        <div className="chat-messages">
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
        </div>

        {/* 토론 종료 전: 입력창 표시 */}
        {!isEnded && (
          <>
            {/* 힌트 메시지 */}
            <div className="input-hint">
              {turns.length === 0 
                ? "💡 이번에는 [주장]을 명확하게 말해보자!" 
                : "💡 이번에는 [근거]나 [예시]를 들어볼까?"}
            </div>

            {/* 턴 수 및 글자 수 표시 */}
            <div style={{ marginBottom: 8, fontSize: 12, color: "var(--ms-text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>{input.length}/{MAX_INPUT_CHARS}자</span>
            </div>
            <form className="chat-input-bar" onSubmit={handleSend}>
              <textarea
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="AI에게 말하고 싶은 내용을 적어 보세요. (Enter: 전송, Shift+Enter: 줄바꿈)"
                rows={2}
              />
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLoading || !input.trim() || studentTurnCount >= MAX_TURNS}
                  style={{ flex: 1 }}
                >
                  보내기
                </button>
                <button
                  type="button"
                  onClick={handleEndDebate}
                  className="btn btn-secondary"
                  disabled={isLoading || isEnded}
                  style={{ whiteSpace: "nowrap" }}
                >
                  종료
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-secondary"
                  disabled={isLoading}
                  style={{ whiteSpace: "nowrap" }}
                >
                  다시
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* 20턴 도달 시 안내 메시지 */}
        {isEnded && studentTurnCount >= MAX_TURNS && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: "var(--ms-card-soft)", borderRadius: 8, textAlign: "center" }}>
            <p className="hint-text" style={{ margin: 0 }}>
              토론이 {MAX_TURNS}턴에 도달하여 종료되었습니다. 평가를 진행해 주세요.
            </p>
          </div>
        )}

        {/* 토론 종료 후: 안내 메시지 */}
        {isEnded && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: "var(--ms-card-soft)", borderRadius: 8, textAlign: "center" }}>
            <p className="hint-text" style={{ margin: 0 }}>
              토론이 종료되었습니다. 오른쪽 패널에서 평가를 확인하고 PDF로 저장할 수 있습니다.
            </p>
          </div>
        )}
      </section>

      <SelfReflectionModal 
        open={showReflectionModal} 
        onClose={() => setShowReflectionModal(false)} 
        onSave={handleReflectionSave} 
      />
    </div>
  );
}
