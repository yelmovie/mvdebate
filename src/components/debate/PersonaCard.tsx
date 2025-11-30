import React from "react";
import { Persona } from "../../config/personas";

interface PersonaCardProps {
  persona: Persona;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function PersonaCard({ persona, selected, onSelect }: PersonaCardProps) {
  return (
    <button
      type="button"
      className={`persona-card ${selected ? "persona-card--selected" : ""}`}
      onClick={() => onSelect(persona.id)}
    >
      <div className="persona-card__image-wrapper">
        <img
          src={persona.image}
          alt={persona.name}
          className="persona-card__image"
        />
      </div>
      <div className="persona-card__name">{persona.name}</div>
      <div className="persona-card__role">{persona.role}</div>

      {/* 툴팁 */}
      <div className="persona-card__tooltip">
        <strong>{persona.name}</strong>
        <br />
        {persona.description}
      </div>
    </button>
  );
}
