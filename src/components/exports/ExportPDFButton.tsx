"use client";

import React from "react";
import { handleViewPDF } from "./export.helpers";

interface Props {
  targetUrl: string; // e.g., "/teacher/report"
  label?: string;
  className?: string;
}

export default function ExportPDFButton({ 
    targetUrl, 
    label = "리포트 보기 (PDF)",
    className = "btn btn-primary"
}: Props) {
  return (
    <button 
      type="button"
      className={className} 
      onClick={() => handleViewPDF(targetUrl)}
      style={{
        borderRadius: "9999px",
        backgroundColor: "#ec4899", // pink-500
        color: "white",
        padding: "8px 16px",
        fontSize: "0.875rem",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transition: "background 0.2s"
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#db2777"} // pink-600
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ec4899"}
    >
      PDF 리포트 보기
    </button>
  );
}
