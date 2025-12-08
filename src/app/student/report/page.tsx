"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuFileText, LuLoaderCircle } from "react-icons/lu";

interface DebateLog {
  text: string;
  timestamp: Timestamp;
  aiScore?: {
    logic: number;
    clarity: number;
    evidence: number;
    empathy: number;
    engagement: number;
    overall: number;
  };
}

interface ReportData {
  summary: string;
  strengths: string[];
  improvements: string[];
  score_trend_title: string;
  score_trend_summary: string;
}

export default function StudentReportPage() {
  const { studentProfile } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<DebateLog[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentProfile) {
      router.push("/");
      return;
    }

    const fetchLogs = async () => {
      try {
        // Fetch debate logs for this student
        // Note: This assumes debateLogs collection structure
        const logsRef = collection(db, "debateLogs");
        const q = query(
          logsRef,
          where("studentId", "==", `${studentProfile.classCode}-${studentProfile.studentNumber}`),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        
        const fetchedLogs: DebateLog[] = [];
        snapshot.forEach((doc) => {
          fetchedLogs.push({
            text: doc.data().text || "",
            timestamp: doc.data().timestamp,
            aiScore: doc.data().aiScore,
          });
        });

        setLogs(fetchedLogs);
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("로그를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [studentProfile, router]);

  const generateReport = async () => {
    if (logs.length === 0) {
      setError("리포트를 생성할 로그가 없습니다.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error("리포트 생성에 실패했습니다.");
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error("[Report Generation Error]", err);
      setError(err.message || "리포트 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LuFileText size={32} color={iconStyles.color.primary} />
            내 토론 리포트
          </h1>
          <p className="text-slate-300 text-sm">
            나의 토론 활동을 분석한 리포트를 확인하세요. (총 {logs.length}개 발언)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {!report && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8 text-center">
            <button
              onClick={generateReport}
              disabled={generating || logs.length === 0}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {generating ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={20} />
                  리포트 생성 중...
                </>
              ) : (
                "리포트 생성하기"
              )}
            </button>
          </div>
        )}

        {/* Report Content */}
        {report && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-6">
            {/* Summary */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">📊 전체 요약</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 whitespace-pre-line">
                {report.summary}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">✨ 잘한 점</h2>
              <ul className="space-y-2">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-200">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">📈 개선할 점</h2>
              <ul className="space-y-2">
                {report.improvements.map((improvement, index) => (
                  <li key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-200">
                    • {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Score Trend */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">📉 점수 추이</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-2">{report.score_trend_title}</h3>
                <p className="text-slate-200">{report.score_trend_summary}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

