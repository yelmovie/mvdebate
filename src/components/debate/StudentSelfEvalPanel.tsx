"use client";

import { useState } from "react";

export default function StudentSelfEvalPanel() {
  const [scores, setScores] = useState({
    clarity: 0,
    logic: 0,
    attitude: 0
  });

  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 24, padding: "0 12px" }}>
      <section className="debate-card" style={{ width: "100%", maxWidth: "768px" }}>
        <div className="debate-section-title">
          <span className="dot" />
          <span>학생 자기 평가</span>
        </div>
        
        <p className="hint-text" style={{ marginBottom: 16 }}>
          토론을 하면서 스스로 얼마나 잘했는지 별점을 매겨보세요. (나만 볼 수 있어요!)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 1. 주장 명확성 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>내 주장을 명확하게 말했나요?</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleScoreChange("clarity", star)}
                  style={{
                    fontSize: 24,
                    color: star <= scores.clarity ? "#fbbf24" : "#e5e7eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* 2. 근거 적절성 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>근거를 잘 들어 설명했나요?</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleScoreChange("logic", star)}
                  style={{
                    fontSize: 24,
                    color: star <= scores.logic ? "#fbbf24" : "#e5e7eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* 3. 태도 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>상대방을 존중하며 말했나요?</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleScoreChange("attitude", star)}
                  style={{
                    fontSize: 24,
                    color: star <= scores.attitude ? "#fbbf24" : "#e5e7eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
