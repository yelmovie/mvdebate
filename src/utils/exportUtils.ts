import { DebateSessionReport } from "../types/domain";

/**
 * Converts an array of DebateSessionReport objects to a CSV string
 * and triggers a file download.
 */
export function exportToCsv(reports: DebateSessionReport[], filename: string = "debate_export.csv") {
  if (!reports || reports.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  // CSV Header
  const headers = [
    "학생명",
    "토론 주제",
    "입장",
    "작성일시",
    "나의 주장",
    "근거 수",
    "근거 내용 (전체)",
    "자료/예시 수",
    "자료/예시 내용 (전체)"
  ];

  // CSV Rows
  const rows = reports.map((r) => {
    const stanceText = r.stance === "pro" ? "찬성" : "반대";
    const dateText = new Date(r.createdAt).toLocaleString("ko-KR");
    
    // Handle array fields (join with newline or pipe)
    const reasonsText = r.reasons ? r.reasons.join(" | ") : "";
    const evidencesText = r.evidences ? r.evidences.join(" | ") : "";

    // Escape fields for CSV (handle commas, quotes, newlines)
    const escape = (text: string | number | undefined) => {
      const str = String(text || "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escape(r.nickname),
      escape(r.topicTitle),
      escape(stanceText),
      escape(dateText),
      escape(r.claim),
      escape(r.reasonsCount),
      escape(reasonsText),
      escape(r.evidencesCount),
      escape(evidencesText)
    ].join(",");
  });

  // Combine header and rows
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Add BOM for Excel (Korean character support)
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
