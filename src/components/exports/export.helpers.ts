import { exportToCsv } from "../../utils/exportUtils";

export const handleExportCSV = (data: any[], filenamePrefix: string = "export") => {
  if (!data || data.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }
  const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  exportToCsv(data, filename);
};

export const handleViewPDF = (url: string) => {
    window.location.href = url;
};
