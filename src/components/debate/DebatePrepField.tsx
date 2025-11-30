"use client";

import { useState } from "react";

interface DebatePrepFieldProps {
  label: string;
  placeholder?: string;
  onAdd: (text: string) => void;
}

export function DebatePrepField({ label, placeholder, onAdd }: DebatePrepFieldProps) {
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft(""); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // PC에서는 Enter로 저장, Shift+Enter는 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="prep-field" style={{ marginBottom: 12 }}>
      <div className="structure-block-title">{label}</div>
      <div className="prep-input-row">
        <textarea
          className="prep-textarea filter-input"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ width: "100%", marginTop: 4, resize: "vertical", minHeight: "38px" }}
        />
        <button
          type="button"
          className="prep-add-btn btn btn-primary"
          onClick={handleSave}
          style={{ marginTop: 4, whiteSpace: "nowrap" }}
        >
          추가
        </button>
      </div>
      <p className="prep-helper" style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
        데스크톱: 엔터(Enter)를 누르면 저장돼요. <br className="mobile-only" />
        모바일: ‘추가’ 버튼을 눌러 저장해요.
      </p>
    </div>
  );
}
