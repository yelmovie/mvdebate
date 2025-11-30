"use client";

import { useDebateStore } from "../../store/debateStore";
import { useState } from "react";

export default function PrepWizard() {
  const {
    claim,
    reasons,
    evidences,
    expectedCounter,
    rebuttal,
    setStructureFromLabel
  } = useDebateStore();
  const [localClaim, setLocalClaim] = useState(claim || "");
  const [localReason, setLocalReason] = useState("");
  const [localEvidence, setLocalEvidence] = useState("");
  const [localCounter, setLocalCounter] = useState(expectedCounter || "");
  const [localRebuttal, setLocalRebuttal] = useState(rebuttal || "");

  const addReason = () => {
    if (!localReason.trim()) return;
    setStructureFromLabel("reason", localReason.trim());
    setLocalReason("");
  };

  const addEvidence = () => {
    if (!localEvidence.trim()) return;
    setStructureFromLabel("evidence", localEvidence.trim());
    setLocalEvidence("");
  };

  const saveClaim = () => {
    if (!localClaim.trim()) return;
    setStructureFromLabel("claim", localClaim.trim());
  };

  const saveCounter = () => {
    if (!localCounter.trim()) return;
    setStructureFromLabel("counterargument", localCounter.trim());
  };

  const saveRebuttal = () => {
    if (!localRebuttal.trim()) return;
    setStructureFromLabel("rebuttal", localRebuttal.trim());
  };

  return (
    <section className="debate-card" style={{ marginBottom: 12 }}>
      <h2 className="debate-section-title">
        <span className="dot" />
        <span>3단계. 토론 준비 마법사</span>
        <span className="blink-arrow">➡</span>
      </h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          <div className="structure-block-title">주장(Claim)</div>
          <input
            className="filter-input"
            value={localClaim}
            onChange={(e) => setLocalClaim(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveClaim()}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="내가 하고 싶은 말을 한 문장으로 적어보기"
          />
          <div style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
            💡 내용을 입력하고 엔터(Enter)를 치면 저장됩니다.
          </div>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="structure-block-title">근거(Reason)</div>
        {reasons.length > 0 && (
          <ol className="structure-list" style={{ marginTop: 4 }}>
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        )}
        <input
          className="filter-input"
          value={localReason}
          onChange={(e) => setLocalReason(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addReason()}
          style={{ width: "100%", marginTop: 4 }}
          placeholder="왜 그렇게 생각하는지 이유를 적어보기"
        />
        <div style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
          💡 내용을 입력하고 엔터(Enter)를 치면 추가됩니다.
        </div>
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
        <input
          className="filter-input"
          value={localEvidence}
          onChange={(e) => setLocalEvidence(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEvidence()}
          style={{ width: "100%", marginTop: 4 }}
          placeholder="경험, 예시, 기사 등 구체적인 자료 적기"
        />
        <div style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
          💡 내용을 입력하고 엔터(Enter)를 치면 추가됩니다.
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          <div className="structure-block-title">예상 반론(Counterargument)</div>
          <input
            className="filter-input"
            value={localCounter}
            onChange={(e) => setLocalCounter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCounter()}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="반대편에서 뭐라고 말할지 미리 생각해보기"
          />
          <div style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
            💡 내용을 입력하고 엔터(Enter)를 치면 저장됩니다.
          </div>
        </label>
      </div>

      <div>
        <label>
          <div className="structure-block-title">반론에 대한 답변(Rebuttal)</div>
          <input
            className="filter-input"
            value={localRebuttal}
            onChange={(e) => setLocalRebuttal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveRebuttal()}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="반론에 어떻게 다시 말할지 적어보기"
          />
          <div style={{ fontSize: 12, color: "var(--ms-text-muted)", marginTop: 4 }}>
            💡 내용을 입력하고 엔터(Enter)를 치면 저장됩니다.
          </div>
        </label>
      </div>
    </section>
  );
}
