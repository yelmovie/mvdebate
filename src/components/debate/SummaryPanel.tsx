"use client";

import { useState, useEffect } from "react";
import { useDebateStore } from "../../store/debateStore";
import { saveDebateReport } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import { PERSONAS } from "../../config/personas";
import SelfEvaluationModal from "./SelfEvaluationModal";
import { apiFetch } from "../../services/apiClient";
import type { AiEvaluation } from "../../types/domain";

export default function SummaryPanel() {
  const { user } = useAuth(); // Get current user for studentId
  const {
    nickname,
    currentTopic,
    stance,
    turns,
    isEnded,
    setEnded,
    evaluation,
    setEvaluation,
    selectedPersonaId
  } = useDebateStore();

  const [evaluating, setEvaluating] = useState(false);
  const [savingPDF, setSavingPDF] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [autoAction, setAutoAction] = useState<"pdf" | "save" | null>(null);

  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);

  useEffect(() => {
    // 세션 바뀌면 상태 초기화
    setShowEvalModal(false);
    setEvaluating(false);
  }, [currentTopic?.id, stance]);

  // ChatPanel에서 20턴 도달 시 자동으로 평가 시작
  useEffect(() => {
    // turns가 변경될 때마다 체크
    // 20턴 도달 시 자동으로 평가 시작 (학생 메시지 20개)
    const studentTurns = turns.filter(t => t.sender === "student").length;
    if (studentTurns >= 20 && !isEnded && !showEvalModal && currentTopic) {
      handleEndDebate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns.length, isEnded, showEvalModal, currentTopic]);

  // Watch for isEnded from store (triggered by ChatPanel)
  useEffect(() => {
    if (isEnded && !evaluation && !evaluating && !showEvalModal) {
      handleEndDebate();
    }
  }, [isEnded, evaluation, evaluating, showEvalModal]);

  if (!currentTopic || !stance) return null;

  // 토론 종료 및 AI 평가 생성
  const handleEndDebate = async () => {
    if (turns.length < 2) {
      alert("토론을 더 진행한 후 종료해 주세요.");
      return;
    }

    if (!currentTopic) {
      alert("토론 주제 정보가 없습니다.");
      return;
    }

    setEnded(true);
    setEvaluating(true);
    setShowEvalModal(true);

    try {
      // 대화 로그를 문자열로 변환
      const logText = turns
        .map((t) => `${t.sender === "student" ? "학생" : "AI"}: ${t.text}`)
        .join("\n");

      // AI 평가 API 호출
      const result = await apiFetch<{ evaluation: AiEvaluation }>("/api/debate/evaluate", {
        method: "POST",
        body: JSON.stringify({ 
          topic: currentTopic.title,
          log: logText 
        })
      });

      if (result.evaluation) {
        setEvaluation(result.evaluation);
        
        // Auto-save the report to server if user is logged in
        if (user && result.evaluation) {
             const reportData = {
                studentId: user.uid,
                sessionId: `${Date.now()}`, // Simple ID generation
                topicTitle: currentTopic.title,
                summary: result.evaluation.comment,
                scores: {
                    criticalThinking: 0, // Not provided by AI yet, default 0
                    logic: 0,
                    expression: result.evaluation.clarity,
                    listening: result.evaluation.relevance,
                    creative: result.evaluation.evidence // Mapping evidence to creative field as proxy
                },
                recommendation: result.evaluation.comment
             };
             // We can trigger save here or user manual save. 
             // Requirement says "Send to Teacher" -> Save to dashboard.
             // So we will trigger this in the modal "Send" button.
        }

      } else {
        throw new Error("평가 결과가 없습니다.");
      }
    } catch (error: any) {
      console.error("[SummaryPanel] Failed to generate evaluation:", error);
      alert("평가 생성 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      setShowEvalModal(false);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="summary-panel">
      {/* 토론 종료 버튼만 표시 (요약은 모달에서만 사용) */}
      <div className="debate-section-title" style={{ marginBottom: 8 }}>
        <span className="dot" />
        <span>6단계. 토론 종료 및 AI 평가</span>
        <span className="blink-arrow">⬇</span>
      </div>
      
      {/* Persona Report Header */}
      {currentTopic && stance && selectedPersona && (
        <div className="debate-report">
          <header className="debate-report__header">
            <div className="debate-report__persona">
              <img
                src={selectedPersona.image}
                alt={selectedPersona.name}
                className="debate-report__persona-img"
              />
              <div>
                <div className="debate-report__persona-name">
                  {selectedPersona.name}
                </div>
                <div className="debate-report__persona-role">
                  {selectedPersona.role}
                </div>
              </div>
            </div>
            <div className="debate-report__meta">
              <div>학생: {nickname || "학생"}</div>
              <div>주제: {currentTopic.title}</div>
              <div>입장: {stance === "pro" ? "찬성" : "반대"}</div>
            </div>
          </header>
        </div>
      )}

      {!isEnded ? (
        <div>
          <p className="hint-text" style={{ fontSize: 12, marginBottom: 8 }}>
            토론이 끝나면 종료 버튼을 눌러 AI 평가를 받고 리포트를 저장하세요.
          </p>
          <button
            className="btn"
            onClick={handleEndDebate}
            disabled={turns.length < 2 || evaluating}
            style={{ 
              width: "100%", 
              backgroundColor: "#ff6b6b", 
              color: "white", 
              fontWeight: "bold",
              border: "none",
              boxShadow: "0 4px 6px rgba(255, 107, 107, 0.3)"
            }}
          >
            🛑 토론 종료 및 AI 평가 받기
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="hint-text" style={{ fontSize: 12, marginBottom: 4 }}>
            {evaluating ? "AI 평가를 생성하는 중입니다…" : "평가가 완료되었습니다."}
          </p>
          {!evaluating && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setAutoAction(null);
                  setShowEvalModal(true);
                }}
                style={{ flex: 1, fontSize: 13 }}
              >
                📄 결과 보고서 보기
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setAutoAction("pdf");
                  setShowEvalModal(true);
                }}
                style={{ flex: 1, fontSize: 13 }}
              >
                📥 PDF 다운로드
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setAutoAction("save");
                  setShowEvalModal(true);
                }}
                style={{ flex: 1, fontSize: 13, background: "#8b5cf6", color: "white", border: "none" }}
              >
                📤 선생님께 제출
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI 평가 모달 */}
      <SelfEvaluationModal
        open={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        studentName={nickname || "학생"}
        topic={currentTopic.title}
        stance={stance}
        evaluation={evaluation || null}
        evaluating={evaluating}
        savingPDF={savingPDF}
        initialAutoAction={autoAction}
        onActionComplete={() => setAutoAction(null)}
      />
    </div>
  );
}
