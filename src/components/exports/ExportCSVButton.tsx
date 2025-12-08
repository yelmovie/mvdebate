"use client";

import React from "react";
import { handleExportCSV } from "./export.helpers";

interface Props {
  data: any[];
  filenamePrefix?: string;
  label?: string;
  className?: string; // Allow custom class
}

export default function ExportCSVButton({ 
    data, 
    filenamePrefix = "data", 
    label = "CSV로 내보내기",
    className = "btn btn-secondary"
}: Props) {
  return (
    <button 
      type="button"
      className={className} 
      onClick={() => handleExportCSV(data, filenamePrefix)}
      style={{
        borderRadius: "9999px",
        backgroundColor: "#334155", // slate-700
        color: "#f8fafc", // slate-50
        padding: "8px 16px",
        fontSize: "0.875rem",
        fontWeight: 500,
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#475569"} // slate-600
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#334155"}
    >
      CSV 파일로 저장하기
    </button>
  );
}
