import React from "react";
import { PERSONAS } from "../../config/personas";

interface PersonaUsage {
  personaId: string;
  count: number;
}

interface StanceStats {
  pro: number;
  con: number;
}

interface AvgScores {
  clarity: number;
  evidence: number;
  relevance: number;
}

interface TeacherAnalyticsProps {
  personaUsage: PersonaUsage[];
  stanceStats: StanceStats;
  avgScores: AvgScores;
}

function getPersonaName(id: string) {
  const p = PERSONAS.find((x) => x.id === id);
  return p ? p.name : id;
}

export default function TeacherAnalytics({ personaUsage, stanceStats, avgScores }: TeacherAnalyticsProps) {
  const maxCount = Math.max(...personaUsage.map((p) => p.count), 1);

  return (
    <section className="teacher-analytics">
      <h2 className="teacher-analytics__title">토론 분석 대시보드</h2>

      {/* 1) 페르소나 사용 빈도 */}
      <div className="analytics-card">
        <h3>페르소나 선택 빈도</h3>
        <div className="bar-chart" style={{ marginTop: 12 }}>
          {personaUsage.map((p) => (
            <div key={p.personaId} className="bar-chart__row">
              <span className="bar-chart__label">
                {getPersonaName(p.personaId)}
              </span>
              <div className="bar-chart__bar-wrapper">
                <div
                  className="bar-chart__bar"
                  style={{
                    width: `${(p.count / maxCount) * 100}%`,
                  }}
                />
              </div>
              <span className="bar-chart__value">{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2) 찬성/반대 비율 */}
      <div className="analytics-card">
        <h3>입장 비율(찬성 / 반대)</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--ms-text-muted)", marginBottom: 8 }}>
          찬성: {stanceStats.pro}명, 반대: {stanceStats.con}명
        </p>
        <div className="stance-bar">
          <div
            className="stance-bar__pro"
            style={{
              width: `${(stanceStats.pro /
                (stanceStats.pro + stanceStats.con || 1)) * 100}%`,
            }}
          >
            찬성 {Math.round((stanceStats.pro / (stanceStats.pro + stanceStats.con || 1)) * 100)}%
          </div>
          <div
            className="stance-bar__con"
            style={{
              width: `${(stanceStats.con /
                (stanceStats.pro + stanceStats.con || 1)) * 100}%`,
            }}
          >
            반대 {Math.round((stanceStats.con / (stanceStats.pro + stanceStats.con || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* 3) 평균 점수 */}
      <div className="analytics-card">
        <h3>평균 평가 점수</h3>
        <ul className="avg-score-list">
          <li>주장 명확성: {avgScores.clarity.toFixed(1)}/5</li>
          <li>근거 사용: {avgScores.evidence.toFixed(1)}/5</li>
          <li>주제 충실도: {avgScores.relevance.toFixed(1)}/5</li>
        </ul>
      </div>
    </section>
  );
}
