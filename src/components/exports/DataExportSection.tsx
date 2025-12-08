"use client";

import React from "react";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import ExportCSVButton from "./ExportCSVButton";
import ExportPDFButton from "./ExportPDFButton";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionHistory } from "@/services/historyService";

interface Props {
  role?: "teacher" | "student";
  title?: string;
  description?: string;
  data?: any[];
}

export default function DataExportSection({ 
    role = "teacher",
    title = "데이터 내보내기", 
    description = "데이터를 파일로 저장하거나 리포트를 확인할 수 있습니다.",
    data
}: Props) {
    
  // Use data prop if provided, otherwise fallback or empty
  const exportData = data || []; 

  return (
    <section style={{
        marginTop: "32px",
        borderRadius: "16px",
        backgroundColor: "rgba(15, 23, 42, 0.6)", // slate-900/60
        padding: "20px 24px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        color: "white"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "white" }}>{title}</h2>
        <p style={{ marginTop: "4px", fontSize: "0.875rem", color: "#cbd5e1" }}>{description}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <ExportCSVButton 
                data={exportData} 
                filenamePrefix="debate_export" 
            />
            <ExportPDFButton 
                targetUrl="/teacher/report" 
            />
      </div>
    </section>
  );
}
