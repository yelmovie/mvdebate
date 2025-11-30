"use client";

import { useEffect, useState } from "react";
import { useScreenMode } from "../../context/ScreenModeContext";

export default function ModeSelectionModal() {
  const { screenMode, setScreenMode } = useScreenMode();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedMode = localStorage.getItem("mvdebate_screen_mode");
    if (!savedMode) {
      // If no choice saved, show modal
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (mode: "phone-portrait" | "tablet-landscape") => {
    setScreenMode(mode);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: "400px", textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>화면 모드를 선택해주세요</h2>
        <p style={{ marginBottom: "24px", color: "var(--ms-text-muted)" }}>
          사용하시는 기기에 맞는 화면을 골라주세요.<br/>
          (나중에 상단 버튼으로 언제든 바꿀 수 있어요!)
        </p>

        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <button
            className="btn btn-primary"
            onClick={() => handleSelect("phone-portrait")}
            style={{ padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <span style={{ fontSize: "24px" }}>📱</span>
            <div>
              <div style={{ fontWeight: "bold" }}>폰 모드 (세로)</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>스마트폰에 최적화된 화면</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleSelect("tablet-landscape")}
            style={{ padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <span style={{ fontSize: "24px" }}>💻</span>
            <div>
              <div style={{ fontWeight: "bold" }}>태블릿/PC 모드 (가로)</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>큰 화면에 최적화된 화면</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
