"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GuideModal from "../components/common/GuideModal";
import { getTopics } from "../services/configService";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [topicId, setTopicId] = useState<number>(1);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if guide should be hidden
    const hideGuide = localStorage.getItem("hideGuide");
    if (!hideGuide) {
      setShowGuide(true);
    }
    
    // Load saved info
    const savedNickname = localStorage.getItem("studentNickname");
    const savedGrade = localStorage.getItem("studentGrade");
    const savedClass = localStorage.getItem("studentClass");
    if (savedNickname) setNickname(savedNickname);
    if (savedGrade) setGrade(savedGrade);
    if (savedClass) setClassNumber(savedClass);
  }, []);

  const topics = getTopics();
  const easyTopics = topics.filter(t => t.difficulty === 1);
  const hardTopics = topics.filter(t => t.difficulty >= 2);

  const handleStart = () => {
    if (!nickname.trim()) {
      alert("이름 또는 별명을 먼저 입력해 주세요.");
      return;
    }

    // Save info
    localStorage.setItem("studentNickname", nickname.trim());
    localStorage.setItem("studentGrade", grade.trim());
    localStorage.setItem("studentClass", classNumber.trim());

    const queryParams = `nickname=${encodeURIComponent(nickname.trim())}&grade=${encodeURIComponent(grade.trim())}&classNumber=${encodeURIComponent(classNumber.trim())}`;

    // 랜덤 모드인 경우: 토론 페이지에서 기존처럼 랜덤 뽑기
    if (mode === "random") {
      router.push(`/debate?${queryParams}&mode=random`);
      return;
    }

    // 직접 선택 모드인데 선택 안 한 경우
    if (!topicId) {
      alert("토론 주제를 하나 선택해 주세요.");
      return;
    }

    router.push(`/debate?${queryParams}&mode=manual&topicId=${encodeURIComponent(topicId)}`);
  };

  return (
    <main>
      <h1 className="dashboard-title">AI 토론 연습 시작하기</h1>
      
      <div className="step-indicator">
        <div className="step-item active">① 이름</div>
        <span>→</span>
        <div className="step-item">② 주제 선택</div>
        <span>→</span>
        <div className="step-item">③ 입장 정하기</div>
        <span>→</span>
        <div className="step-item">④ AI와 토론</div>
      </div>

      <p className="dashboard-subtitle">
        이름을 입력하고, 토론 주제를 직접 고르거나 랜덤으로 뽑아서 연습할 수 있어요.
      </p>

      <section className="dashboard-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <label style={{ fontSize: 15, fontWeight: 500, display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "120px" }}>
              1. 이름 / 별명
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 김철수"
                className="filter-input"
              />
            </label>
            <label style={{ fontSize: 15, fontWeight: 500, display: "flex", flexDirection: "column", gap: "8px", width: "80px" }}>
              학년
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="3"
                className="filter-input"
                type="number"
              />
            </label>
            <label style={{ fontSize: 15, fontWeight: 500, display: "flex", flexDirection: "column", gap: "8px", width: "80px" }}>
              반
              <input
                value={classNumber}
                onChange={(e) => setClassNumber(e.target.value)}
                placeholder="1"
                className="filter-input"
                type="number"
              />
            </label>
          </div>

          {/* 2. 주제 선택 방식 */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              2. 토론 주제 선택 방법
            </div>
            <div className="topic-mode-row">
              <label className="topic-mode-option">
                <input
                  type="radio"
                  name="topic-mode"
                  value="random"
                  checked={mode === "random"}
                  onChange={() => setMode("random")}
                />
                <span>랜덤으로 뽑기</span>
              </label>

              <label className="topic-mode-option">
                <input
                  type="radio"
                  name="topic-mode"
                  value="manual"
                  checked={mode === "manual"}
                  onChange={() => setMode("manual")}
                />
                <span>목록에서 직접 고르기</span>
              </label>
            </div>

            {mode === "manual" && (
              <select
                className="topic-select"
                value={topicId}
                onChange={(e) => setTopicId(Number(e.target.value))}
              >
                <option value="">-- 토론 주제를 선택해 주세요 --</option>
                <optgroup label="Easy">
                  {easyTopics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hard">
                  {hardTopics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}
          </div>

          {/* 3. 시작 버튼 */}
          <button className="btn-cta" onClick={handleStart}>
            토론 연습 시작하기
          </button>

          <p className="hint-text">
            * 선생님은 상단 메뉴의 <b>‘교사용 대시보드’</b>에서 학생들의 토론
            기록과 평가를 확인할 수 있어요.
          </p>
        </div>
      </section>

      <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </main>
  );
}
