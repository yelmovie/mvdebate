"use client";

import React from "react";
import { useDebateStore } from "../../store/debateStore";

export default function DifficultySelector() {
  const { difficulty, setDifficulty } = useDebateStore();

  const levels = [
    {
      id: "low",
      label: "초급 - 쉬운 토론 😊",
      desc: "가볍게 말하면서 연습해요",
      color: "var(--ms-green)",
      bg: "var(--ms-green-light)",
    },
    {
      id: "mid",
      label: "중급 - 생각 토론 🤔",
      desc: "서로 의견을 주고받아요",
      color: "var(--ms-blue)",
      bg: "var(--ms-blue-light)",
    },
    {
      id: "high",
      label: "고급 - 도전 토론 🔥",
      desc: "깊게 생각하고 말해봐요",
      color: "var(--ms-rose)",
      bg: "var(--ms-rose-light)",
    },
  ] as const;

  return (
    <section className="dashboard-card" style={{ marginTop: 20 }}>
      <h3 className="debate-section-title">
        <span className="dot" />
        <span>4단계. 토론 난이도 선택</span>
      </h3>
      <p style={{ marginBottom: 16, color: "var(--ms-text-muted)" }}>
        나에게 맞는 난이도를 골라보세요.
      </p>

      <div className="difficulty-grid">
        {levels.map((lvl) => {
          const isSelected = difficulty === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              className={`difficulty-btn ${isSelected ? "selected" : ""}`}
              style={{
                border: isSelected ? `2px solid ${lvl.color}` : "1px solid var(--ms-border)",
                // When selected, use the color with slight transparency for background context, but make sure text pops
                background: isSelected ? lvl.bg : "var(--ms-surface)",
                // When selected, make label white for contrast if the bg is dark, OR use the color itself if the bg is light.
                // Assuming dark mode, "lvl.bg" might be dark. Let's force text to be bright on selection.
                color: isSelected ? "#fff" : "var(--ms-text)", 
                transform: isSelected ? "scale(1.02)" : "scale(1)",
                boxShadow: isSelected ? `0 0 12px ${lvl.color}40` : "none"
              } as React.CSSProperties}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span className="difficulty-label" 
                      style={{ 
                        color: isSelected ? "#ffffff" : lvl.color, // Highlight color when NOT selected, White when selected
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        textShadow: isSelected ? `0 0 10px ${lvl.color}` : "none" // Glow effect
                      }}>
                  {lvl.label}
                </span>
                <span className="difficulty-desc" style={{ 
                    color: isSelected ? "#f0f0f0" : "var(--ms-text-muted)",
                    fontSize: "0.9rem"
                }}>
                  {lvl.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
