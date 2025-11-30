"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GuideModal({ open, onClose }: Props) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideGuide", "true");
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div 
        className="modal-box" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: "650px", borderRadius: "20px", border: "4px solid #818cf8" }}
      >
        <div className="modal-header" style={{ justifyContent: "center", borderBottom: "none", paddingBottom: 0 }}>
          <h2 className="modal-title" style={{ fontSize: "24px", fontWeight: "bold", color: "#4f46e5" }}>
            👋 환영합니다! Moviessam 토론앱 이용가이드
          </h2>
        </div>

        <div style={{ padding: "20px 30px" }}>
          
          {/* 선생님 가이드 */}
          <div style={{ marginBottom: "24px", backgroundColor: "#e0e7ff", padding: "16px", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#3730a3", marginBottom: "8px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "24px", marginRight: "8px" }}>👨‍🏫</span> 선생님이신가요?
            </h3>
            <p style={{ fontSize: "15px", color: "#4338ca", lineHeight: "1.6" }}>
              먼저 상단 메뉴의 <strong>[선생님 게시판]</strong>에 들어가주세요.<br/>
              관리자 비밀번호를 입력하고 이메일을 등록하면,<br/>
              학생들이 보낸 <strong>토론 결과 보고서</strong>를 메일로 받아보실 수 있습니다!<br/>
              <span style={{ fontSize: "13px", display: "block", marginTop: "4px", color: "#4f46e5" }}>
                * 이메일을 등록하지 않아도 보고서를 확인하거나 다운로드할 수 있습니다.
              </span>
            </p>
          </div>

          {/* 학생 가이드 */}
          <div style={{ backgroundColor: "#fdf2f8", padding: "16px", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#be185d", marginBottom: "12px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "24px", marginRight: "8px" }}>🧑‍🎓</span> 학생은 이렇게 해보세요!
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Step number={1} title="시작하기" desc="이름을 입력하고 토론 주제를 골라요. (난이도 선택 가능)" />
              <Step number={2} title="준비하기" desc="찬성/반대 입장을 정하고, 나의 주장 구조를 짜봐요." />
              <Step number={3} title="토론하기" desc="AI와 실전처럼 대화하며 토론해요." />
              <Step number={4} title="평가하기" desc="스스로 별점을 매기고, AI의 평가도 받아보세요." />
              <Step number={5} title="제출하기" desc="결과 보고서를 선생님께 보내거나 PDF로 저장해요." />
            </div>
          </div>

        </div>

        <div style={{ 
          padding: "16px 30px", 
          borderTop: "1px solid #e5e7eb", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px", color: "#6b7280" }}>
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            오늘 하루 보지 않기
          </label>
          <button 
            className="btn btn-primary" 
            onClick={handleClose}
            style={{ padding: "10px 24px", fontSize: "16px", borderRadius: "30px" }}
          >
            알겠어요! 시작할게요 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, desc }: { number: number, title: string, desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ 
        width: "28px", height: "28px", 
        borderRadius: "50%", backgroundColor: "#db2777", color: "white", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontWeight: "bold", fontSize: "14px", flexShrink: 0
      }}>
        {number}
      </div>
      <div>
        <span style={{ fontWeight: "bold", color: "#9d174d", marginRight: "6px" }}>{title}</span>
        <span style={{ fontSize: "14px", color: "#831843" }}>{desc}</span>
      </div>
    </div>
  );
}
