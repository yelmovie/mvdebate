"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CommonIcons } from "../../lib/icons";

export default function QrPopup() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* 상단에 표시되는 작은 QR 트리거 */}
      <button 
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow transition hover:opacity-90"
        title="QR 접속"
      >
        <CommonIcons.QrCode size={18} color="#ffffff" />
      </button>

      {/* 팝업 (Portal 사용) */}
      {open && mounted && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setOpen(false)}
          style={{ zIndex: 2000 }}
        >
          <div 
            className="modal-box" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: "400px", 
              textAlign: "center", 
              padding: "30px",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "20px"
            }}
          >
            <h2 className="modal-title" style={{ fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <CommonIcons.Smartphone size={24} color="#C084FC" />
              모바일 접속
            </h2>
            
            <div style={{ 
              padding: "20px", 
              background: "white", 
              borderRadius: "16px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
            }}>
              <img
                src="/images/qr/qr_code.png"
                alt="QR Large"
                width={250}
                height={250}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div>
              <p style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px" }}>
                카메라로 스캔하세요!
              </p>
              <p style={{ color: "var(--ms-text-muted)", fontSize: "14px" }}>
                스마트폰이나 태블릿으로<br/>편리하게 이용할 수 있습니다.
              </p>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
              style={{ width: "100%" }}
            >
              닫기
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
