import React from "react";
import { PERSONAS } from "../../config/personas";

interface PersonaWaitingScreenProps {
  personaId: string;
  topic: string;
  stance: "pro" | "con";
}

export default function PersonaWaitingScreen({ personaId, topic, stance }: PersonaWaitingScreenProps) {
  const persona = PERSONAS.find((p) => p.id === personaId);

  if (!persona) return null;

  return (
    <div className="waiting-overlay">
      <div className="waiting-card">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={persona.image}
            alt={persona.name}
            className="waiting-card__image"
          />
        </div>
        <h2 className="waiting-card__title">
          {persona.name}가 토론 준비 중이에요…
        </h2>
        <p className="waiting-card__text">
          오늘의 토론 주제는 <strong>“{topic}”</strong> 입니다.
          <br />
          너의 입장은 <strong>{stance === "pro" ? "찬성" : "반대"}</strong>
          로 설정되었어요.
        </p>
        <p className="waiting-card__hint">
          잠시 후 {persona.name}가 너의 생각을 파고들 질문과 반박을
          준비해서 나타날 거예요.
        </p>
      </div>
    </div>
  );
}
