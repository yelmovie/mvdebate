"use client";

interface Props {
  claim?: string;
  reasons: string[];
  evidences: string[];
  expectedCounter?: string;
  rebuttal?: string;
}

export default function StructurePanel({
  claim,
  reasons,
  evidences,
  expectedCounter,
  rebuttal
}: Props) {
  return (
    <section className="debate-card">
      <div className="debate-section-title">
        <span className="dot" />
        <span>4단계. 나의 주장 구조 보기</span>
        <span className="blink-arrow">⬇</span>
      </div>

      <div className="structure-panel">
        <div className="structure-block">
          <div className="structure-block-title">핵심 주장 (Claim)</div>
          <p className="structure-hint">
            내가 말하고 싶은 한 문장을 또렷하게 써 볼까?
          </p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {claim || <span className="hint-text">(아직 정리되지 않음)</span>}
          </p>
        </div>

        <div className="structure-block">
          <div className="structure-block-title">근거 (Reasons)</div>
          {reasons.length > 0 ? (
            <ol className="structure-list">
              {reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ol>
          ) : (
            <p className="structure-hint">
              왜 그렇게 생각하는지 2~3가지 이유를 적어보자.
            </p>
          )}
        </div>

        <div className="structure-block structure-block--evidence">
          <div className="structure-block-title">자료 · 예시 (Evidence)</div>
          {evidences.length > 0 ? (
            <ol className="structure-list">
              {evidences.map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ol>
          ) : (
            <p className="structure-hint">
              뉴스, 통계, 경험, 사례 같은 구체적인 자료를 1개 이상 적어보자.
            </p>
          )}
        </div>

        {expectedCounter && (
          <div className="structure-block structure-block--counter">
            <div className="structure-block-title">예상 반론 (Counterargument)</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>{expectedCounter}</p>
          </div>
        )}

        {rebuttal && (
          <div className="structure-block structure-block--counter">
            <div className="structure-block-title">반론에 대한 답변 (Rebuttal)</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>{rebuttal}</p>
          </div>
        )}
      </div>
    </section>
  );
}
