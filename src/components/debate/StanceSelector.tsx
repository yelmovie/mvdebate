"use client";

import { useDebateStore } from "../../store/debateStore";

interface Props {
  topicTitle: string;
}

export default function StanceSelector({ topicTitle }: Props) {
  const { setStance } = useDebateStore();

  return (
    <section className="dashboard-card">
      <h2 className="debate-section-title">
        <span className="dot" />
        <span>2단계. 입장 정하기</span>
        <span className="blink-arrow">⬇</span>
      </h2>
      <div className="debate-topic-header">
        <span className="topic-pill">{topicTitle}</span>
      </div>
      <p style={{ marginBottom: 12 }}>너는 어느 쪽에 더 가깝니?</p>
      <div className="topic-actions">
        <button
          className="btn btn-primary"
          onClick={() => setStance("pro")}
        >
          찬성 입장
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setStance("con")}
        >
          반대 입장
        </button>
      </div>
    </section>
  );
}
