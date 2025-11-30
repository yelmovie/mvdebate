"use client";

import { useState, useRef, useEffect } from "react";
import type { AiEvaluation } from "../../types/domain";

interface Props {
  open: boolean;
  onClose: () => void;
  studentName: string;
  topic: string;
  stance: "pro" | "con";
  evaluation: AiEvaluation | null;
  evaluating: boolean;
  savingPDF: boolean;
  initialAutoAction?: "pdf" | "email" | null;
  onActionComplete?: () => void;
}

export default function SelfEvaluationModal({
  open,
  onClose,
  studentName,
  topic,
  stance,
  evaluation,
  evaluating,
  savingPDF: externalSavingPDF, // Prop name changed slightly to avoid conflict, though we'll manage local state mostly
  initialAutoAction,
  onActionComplete
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-trigger action when modal opens
  useEffect(() => {
    if (open && initialAutoAction && evaluation && !isSaving) {
      if (initialAutoAction === "pdf") {
        // Small delay to ensure rendering
        setTimeout(() => handleSavePDF(), 500);
      } else if (initialAutoAction === "email") {
        setTimeout(() => handleSendEmail(), 500);
      }
      
      if (onActionComplete) {
        onActionComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAutoAction, evaluation]);

  if (!open) return null;

  const handleSavePDF = async () => {
    if (!contentRef.current || !evaluation) return;

    try {
      setIsSaving(true);
      
      // Dynamic import
      const html2canvas = (await import("html2canvas")).default;
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF;

      if (!jsPDF) throw new Error("jsPDF library could not be loaded");

      // 1. Clone the element
      const element = contentRef.current;
      const clone = element.cloneNode(true) as HTMLElement;

      // 2. Style the clone to ensure it captures correctly
      // Reset styles that might interfere with capture
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = "210mm"; // A4 width
      clone.style.height = "auto";
      clone.style.zIndex = "-1";
      clone.style.backgroundColor = "#ffffff";
      
      // Append to body to ensure it renders
      document.body.appendChild(clone);

      // 3. Capture using html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight
      });

      // 4. Clean up clone
      document.body.removeChild(clone);

      // 5. Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `토론평가_${studentName}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      
      // alert("PDF 파일이 저장되었습니다!"); // Optional success message
    } catch (error: any) {
      console.error("[AiEvaluationModal] Save PDF error:", error);
      alert(`PDF 저장 중 오류가 발생했습니다: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = () => {
    const teacherEmail = localStorage.getItem("teacherEmail");
    const teacherName = localStorage.getItem("teacherName");
    
    if (!teacherEmail) {
      alert("등록된 선생님 이메일이 없습니다.\n상단 메뉴의 '👨‍🏫 선생님 게시판'에서 이메일을 먼저 등록해주세요.");
      return;
    }

    if (!evaluation) return;

    // 이메일 본문 생성
    const subject = `[AI 토론 평가] ${studentName} - ${topic}`;
    const body = `
안녕하세요, ${teacherName || "선생님"}!
${studentName} 학생의 AI 모의 토론 결과입니다.

[토론 정보]
- 주제: ${topic}
- 입장: ${stance === "pro" ? "찬성" : "반대"}
- 날짜: ${new Date().toLocaleDateString()}

[AI 평가 결과]
1. 주장 명확성: ${evaluation.clarity}/5
2. 근거 사용: ${evaluation.evidence}/5
3. 주제 충실도: ${evaluation.relevance}/5

[총평]
${evaluation.comment}

감사합니다.
MovieSSam Debate Lab 드림
    `.trim();

    // mailto 링크 생성 (URL 인코딩 필요)
    const mailtoLink = `mailto:${teacherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 이메일 클라이언트 열기
    window.location.href = mailtoLink;
    
    alert("이메일 클라이언트가 열립니다. '보내기' 버튼을 눌러주세요!");
  };

  const renderStars = (score: number) => {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: 20,
              color: star <= score ? "#fbbf24" : "#e5e7eb", // Yellow for active, Gray for inactive
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">7단계. 토론 결과 보고서</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

          {/* Capture Area */}
        <div ref={contentRef} style={{ padding: "24px", backgroundColor: "#ffffff", color: "#111827" }}>
          <div style={{ marginBottom: 20, borderBottom: "2px solid #e5e7eb", paddingBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#111827" }}>
              [{topic}] 토론 평가표
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14 }}>
              <p><strong>학생:</strong> {studentName}</p>
              <p><strong>입장:</strong> {stance === "pro" ? "찬성" : "반대"}</p>
              <p><strong>날짜:</strong> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {evaluating ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p className="hint-text">AI가 평가를 생성하는 중입니다...</p>
            </div>
          ) : evaluation ? (
            <>
              {/* 평가 기준 안내 */}
              <div style={{ marginBottom: 20, padding: "16px", backgroundColor: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
                <p style={{ fontSize: 13, color: "#0369a1", marginBottom: 8, fontWeight: 700 }}>
                  📋 평가 기준
                </p>
                <ul style={{ fontSize: 12, color: "#334155", margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                  <li><strong>주장 명확성:</strong> 자신의 입장을 분명하게 말했는가?</li>
                  <li><strong>근거 사용:</strong> 주장에 맞는 구체적인 이유/예시를 제시했는가?</li>
                  <li><strong>주제 충실도:</strong> 주제에서 벗어나지 않고 말했는가?</li>
                </ul>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>1. 주장 명확성</span>
                    {renderStars(evaluation.clarity)}
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563" }}>
                    {evaluation.clarity === 5 && "✓ 매우 명확하게 입장을 표현함"}
                    {evaluation.clarity === 4 && "✓ 명확하게 입장을 표현함"}
                    {evaluation.clarity === 3 && "○ 입장이 어느 정도 명확함"}
                    {evaluation.clarity <= 2 && "△ 입장이 다소 모호하거나 불명확함"}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>2. 근거 사용</span>
                    {renderStars(evaluation.evidence)}
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563" }}>
                    {evaluation.evidence === 5 && "✓ 매우 구체적이고 설득력 있는 근거 제시"}
                    {evaluation.evidence === 4 && "✓ 구체적인 근거를 제시함"}
                    {evaluation.evidence === 3 && "○ 적절한 근거를 제시함"}
                    {evaluation.evidence <= 2 && "△ 근거가 부족하거나 추상적임"}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>3. 주제 충실도</span>
                    {renderStars(evaluation.relevance)}
                  </div>
                  <div style={{ fontSize: 13, color: "#4b5563" }}>
                    {evaluation.relevance === 5 && "✓ 주제에 완벽하게 집중함"}
                    {evaluation.relevance === 4 && "✓ 주제에 충실함"}
                    {evaluation.relevance === 3 && "○ 대체로 주제에 맞춤"}
                    {evaluation.relevance <= 2 && "△ 주제에서 벗어난 발언이 있음"}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 16, marginBottom: 8, color: "#111827", fontWeight: 700 }}>
                    총평:
                  </p>
                  <div
                    style={{
                      padding: "16px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      backgroundColor: "#f3f4f6",
                      borderRadius: 8,
                      color: "#1f2937",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    {evaluation.comment}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p className="hint-text">평가 결과를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, borderTop: "1px solid var(--ms-border)", paddingTop: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            닫기
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSendEmail}
            disabled={isSaving || !evaluation}
          >
            📧 선생님께 보내기
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSavePDF}
            disabled={isSaving || !evaluation}
          >
            {isSaving ? "PDF 저장 중…" : "📥 PDF 다운로드"}
          </button>
        </div>
      </div>
    </div>
  );
}

