"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GuideModal from "../../components/common/GuideModal";
import LoginModal from "../../components/common/LoginModal";
import { getTopics } from "../../services/configService";

export default function StudentHomePage() {
  const router = useRouter();
  const [studentNumber, setStudentNumber] = useState("1"); // Default to 1
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [mode, setMode] = useState<"random" | "manual" | "custom">("random"); // Added custom
  const [topicId, setTopicId] = useState<number>(1);
  const [showGuide, setShowGuide] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check if guide should be hidden
    const hideGuide = localStorage.getItem("hideGuide");
    if (!hideGuide) {
      setShowGuide(true);
    }
    
    // Load saved info
    const savedNumber = localStorage.getItem("studentNumber");
    const savedName = localStorage.getItem("studentName");
    const savedGrade = localStorage.getItem("studentGrade");
    const savedClass = localStorage.getItem("studentClass");
    
    if (savedNumber) setStudentNumber(savedNumber);
    if (savedName) setName(savedName);
    
    if (!savedName) {
      // If no name saved, show login modal (optional, maybe distracting if we want them to just type)
      // setShowLoginModal(true); 
    }

    if (savedGrade) setGrade(savedGrade);
    if (savedClass) setClassNumber(savedClass);
  }, []);

  const handleLoginSuccess = (loginName: string) => {
    // legacy login support, maybe parse "1번 학생" -> 1, 학생?
    // For now just set name part if possible
    setName(loginName);
    setShowLoginModal(false);
  };

  const topics = getTopics();
  const easyTopics = topics.filter(t => t.difficulty === 1);
  const hardTopics = topics.filter(t => t.difficulty >= 2);

  const handleStart = () => {
    if (!name.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }

    // Save info
    localStorage.setItem("studentNumber", studentNumber);
    localStorage.setItem("studentName", name.trim());
    localStorage.setItem("studentGrade", grade.trim());
    localStorage.setItem("studentClass", classNumber.trim());

    // Construct nickname for backend compatibility: "1번 홍길동"
    const fullNickname = `${studentNumber}번 ${name.trim()}`;

    const queryParams = `nickname=${encodeURIComponent(fullNickname)}&grade=${encodeURIComponent(grade.trim())}&classNumber=${encodeURIComponent(classNumber.trim())}`;

    // Custom Mode
    if (mode === "custom") {
        router.push(`/debate?${queryParams}&mode=custom`);
        return;
    }

    // Random Mode
    if (mode === "random") {
      router.push(`/debate?${queryParams}&mode=random`);
      return;
    }

    // Manual Mode
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
        <div className="step-item active">① 정보 입력</div>
        <span>→</span>
        <div className="step-item">② 주제 선택</div>
        <span>→</span>
        <div className="step-item">③ 입장 정하기</div>
        <span>→</span>
        <div className="step-item">④ AI와 토론</div>
      </div>

      <p className="dashboard-subtitle">
        번호와 이름을 입력하고, 토론 주제를 정해서 연습을 시작해 보세요.
      </p>

      <section className="dashboard-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 1. 기본 정보 입력 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>1. 학생 정보</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <label style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: "6px", width: "100px" }}>
                    번호
                    <select 
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        className="filter-input"
                        style={{ padding: "8px" }}
                    >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}번</option>
                        ))}
                    </select>
                </label>
                <label style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "120px" }}>
                    이름
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 김철수"
                        className="filter-input"
                    />
                </label>
                <label style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: "6px", width: "60px" }}>
                    학년
                    <input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="3"
                        className="filter-input"
                    />
                </label>
                <label style={{ fontSize: 14, display: "flex", flexDirection: "column", gap: "6px", width: "60px" }}>
                    반
                    <input
                        type="number"
                        value={classNumber}
                        onChange={(e) => setClassNumber(e.target.value)}
                        placeholder="1"
                        className="filter-input"
                    />
                </label>
            </div>
          </div>

          <div style={{ margin: "8px 0", borderTop: "1px dashed #ddd" }}></div>

          {/* 2. 주제 선택 방식 */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              2. 토론 주제 선택 방법
            </div>
            <div className="topic-mode-row" style={{ flexWrap: "wrap", gap: "10px" }}>
              <label className="topic-mode-option">
                <input
                  type="radio"
                  name="topic-mode"
                  value="random"
                  checked={mode === "random"}
                  onChange={() => setMode("random")}
                />
                <span>🎲 랜덤 뽑기</span>
              </label>

              <label className="topic-mode-option">
                <input
                  type="radio"
                  name="topic-mode"
                  value="manual"
                  checked={mode === "manual"}
                  onChange={() => setMode("manual")}
                />
                <span>📋 목록에서 고르기</span>
              </label>

              <label className="topic-mode-option">
                <input
                  type="radio"
                  name="topic-mode"
                  value="custom"
                  checked={mode === "custom"}
                  onChange={() => setMode("custom")}
                />
                <span>✍️ 직접 입력하기</span>
              </label>
            </div>

            {mode === "manual" && (
              <select
                className="topic-select"
                value={topicId}
                onChange={(e) => setTopicId(Number(e.target.value))}
                style={{ marginTop: "12px" }}
              >
                <option value="">-- 토론 주제를 선택해 주세요 --</option>
                <optgroup label="쉬운 주제">
                  {easyTopics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="어려운 주제">
                  {hardTopics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}
            
            {mode === "custom" && (
                <div style={{ marginTop: "12px", fontSize: "14px", color: "var(--ms-text-muted)" }}>
                    * '시작하기'를 누르면 다음 화면에서 주제를 입력할 수 있어요.
                </div>
            )}
          </div>

          {/* 3. 시작 버튼 */}
          <button className="btn-cta" onClick={handleStart} style={{ marginTop: "12px" }}>
            토론 연습 시작하기
          </button>

          <p className="hint-text">
            * 선생님은 상단 메뉴의 <b>‘교사용 대시보드’</b>에서 학생들의 토론
            기록과 평가를 확인할 수 있어요.
          </p>
        </div>
      </section>

      <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
      
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </main>
  );
}
