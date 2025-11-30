import React from "react";
import { PERSONAS } from "../../config/personas";
import { useDebateStore } from "../../store/debateStore";
import PersonaCard from "./PersonaCard";

export default function PersonaSelector() {
  const { selectedPersonaId, setPersonaId } = useDebateStore();

  const selectedPersona = PERSONAS.find((p) => p.id === selectedPersonaId);

  return (
    <section className="persona-selector">
      <h3 className="persona-selector__title">3단계. 토론 캐릭터 고르기</h3>
      <p className="persona-selector__subtitle">
        함께 토론할 AI 친구를 선택해 주세요. (10명 중 택1)
      </p>

      {/* 1. 캐릭터 그리드 (10명) */}
      <div className="persona-selector__grid">
        {PERSONAS.map((p) => (
          <PersonaCard
            key={p.id}
            persona={p}
            selected={p.id === selectedPersonaId}
            onSelect={setPersonaId}
          />
        ))}
      </div>

      {/* 2. 선택된 캐릭터 미리보기 (작게) */}
      {selectedPersona && (
        <div className="persona-preview">
          <div className="persona-preview__content">
            <img
              src={selectedPersona.image}
              alt={selectedPersona.name}
              className="persona-preview__img"
            />
            <div className="persona-preview__info">
              <div className="persona-preview__label">선택된 캐릭터</div>
              <div className="persona-preview__name">{selectedPersona.name}</div>
              <div className="persona-preview__desc">
                {selectedPersona.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
