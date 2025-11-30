"use client";

import { useDebateStore } from "../../store/debateStore";
import { DebatePrepField } from "./DebatePrepField";

export default function PrepWizard() {
  const {
    reasons,
    evidences,
    setStructureFromLabel
  } = useDebateStore();

  const addReason = (text: string) => {
    setStructureFromLabel("reason", text);
  };

  const addEvidence = (text: string) => {
    setStructureFromLabel("evidence", text);
  };

  const saveClaim = (text: string) => {
    setStructureFromLabel("claim", text);
  };

  const saveCounter = (text: string) => {
    setStructureFromLabel("counterargument", text);
  };

  const saveRebuttal = (text: string) => {
    setStructureFromLabel("rebuttal", text);
  };

  return (
    <section className="debate-card" style={{ marginBottom: 12 }}>
      <h2 className="debate-section-title">
        <span className="dot" />
        <span>3단계. 토론 준비 마법사</span>
        <span className="blink-arrow">➡</span>
      </h2>

      <DebatePrepField
        label="주장(Claim)"
        placeholder="내가 하고 싶은 말을 한 문장으로 적어보기"
        onAdd={saveClaim}
      />

      <div style={{ marginBottom: 12 }}>
        <div className="structure-block-title">근거(Reason)</div>
        {reasons.length > 0 && (
          <ol className="structure-list" style={{ marginTop: 4 }}>
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        )}
        <DebatePrepField
          label=""
          placeholder="왜 그렇게 생각하는지 이유를 적어보기"
          onAdd={addReason}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="structure-block-title">자료/예시(Evidence)</div>
        {evidences.length > 0 && (
          <ol className="structure-list" style={{ marginTop: 4 }}>
            {evidences.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ol>
        )}
        <DebatePrepField
          label=""
          placeholder="경험, 예시, 기사 등 구체적인 자료 적기"
          onAdd={addEvidence}
        />
      </div>

      <DebatePrepField
        label="예상 반론(Counterargument)"
        placeholder="반대편에서 뭐라고 말할지 미리 생각해보기"
        onAdd={saveCounter}
      />

      <DebatePrepField
        label="반론에 대한 답변(Rebuttal)"
        placeholder="반론에 어떻게 다시 말할지 적어보기"
        onAdd={saveRebuttal}
      />
    </section>
  );
}
