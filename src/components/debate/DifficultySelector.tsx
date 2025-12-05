"use client";

import React from "react";
import { useDebateStore } from "../../store/debateStore";

export default function DifficultySelector() {
  const { difficulty, setDifficulty } = useDebateStore();

  const levels = [
    {
      id: "low",
      label: "초급",
      desc: "이기게 해줌 😊",
      color: "var(--ms-green)",
      bg: "var(--ms-green-light)",
    },
    {
      id: "mid",
      label: "중급",
      desc: "비등비등함 🤔",
      color: "var(--ms-blue)",
      bg: "var(--ms-blue-light)",
    },
    {
      id: "high",
      label: "고급",
      desc: "매운맛 🥵",
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {levels.map((lvl) => {
          const isSelected = difficulty === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                borderRadius: "12px",
                border: isSelected 
                    ? `2px solid ${lvl.color}` 
                    : "1px solid var(--ms-border)",
                background: isSelected ? lvl.bg : "var(--ms-surface)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
                boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
              }}
            >
              <span style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  color: isSelected ? lvl.color : "var(--ms-text-primary)",
                  marginBottom: "4px"
              }}>
                {lvl.label}
              </span>
              <span style={{ fontSize: "12px", color: "var(--ms-text-muted)" }}>
                {lvl.desc}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
