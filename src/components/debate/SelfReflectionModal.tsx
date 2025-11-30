import { useState } from "react";

interface SelfReflectionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { myClaim: string; aiCounterpoint: string; improvement: string }) => void;
}

export default function SelfReflectionModal({ open, onClose, onSave }: SelfReflectionModalProps) {
  const [myClaim, setMyClaim] = useState("");
  const [aiCounterpoint, setAiCounterpoint] = useState("");
  const [improvement, setImprovement] = useState("");

  if (!open) return null;

  const handleSave = () => {
    if (!myClaim.trim() || !aiCounterpoint.trim() || !improvement.trim()) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }
    onSave({ 
      myClaim: myClaim.trim(), 
      aiCounterpoint: aiCounterpoint.trim(), 
      improvement: improvement.trim() 
    });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>📝 스스로 정리하기</h2>
        <p style={{ color: "var(--ms-text-muted)", marginBottom: "20px" }}>
          오늘 토론을 마치며 배운 점을 간단히 기록해 보세요.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <strong style={{ fontSize: "15px" }}>1. 오늘 내가 말한 핵심 주장 (한 줄)</strong>
            <input 
              className="filter-input" 
              value={myClaim} 
              onChange={e => setMyClaim(e.target.value)} 
              placeholder="예: 동물원은 동물 보호를 위해 필요하다."
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <strong style={{ fontSize: "15px" }}>2. AI가 반박한 내용 중 기억나는 것</strong>
            <input 
              className="filter-input" 
              value={aiCounterpoint} 
              onChange={e => setAiCounterpoint(e.target.value)} 
              placeholder="예: 좁은 우리에 갇혀 스트레스를 받는다."
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <strong style={{ fontSize: "15px" }}>3. 다음에 더 잘하고 싶은 점</strong>
            <input 
              className="filter-input" 
              value={improvement} 
              onChange={e => setImprovement(e.target.value)} 
              placeholder="예: 근거를 더 구체적으로 말해야겠다."
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%" }}>
            저장하고 마치기
          </button>
        </div>
      </div>
    </div>
  );
}
