"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuFileText, LuArrowLeft } from "react-icons/lu";

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

export default function TeacherReportDetailPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [logs, setLogs] = useState<DebateLog[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string; classCode: string; studentNumber: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user || !teacherProfile) {
        router.push("/");
      }
    }
  }, [user, teacherProfile, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;

      try {
        // Parse studentId (format: classCode-studentNumber)
        const [classCode, studentNumberStr] = studentId.split("-");
        const studentNumber = parseInt(studentNumberStr);

        // Fetch student info
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        
        if (studentSnap.exists()) {
          const data = studentSnap.data();
          setStudentInfo({
            name: data.name || "이름 없음",
            classCode: data.classCode || classCode,
            studentNumber: data.studentNumber || studentNumber,
          });
        } else {
          setStudentInfo({
            name: "학생 정보 없음",
            classCode: classCode,
            studentNumber: studentNumber,
          });
        }

        // Fetch logs
        const logsRef = collection(db, "debateLogs");
        const q = query(
          logsRef,
          where("studentId", "==", studentId),
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

        // Fetch report if exists
        const reportRef = doc(db, "studentReports", studentId);
        const reportSnap = await getDoc(reportRef);
        
        if (reportSnap.exists()) {
          const reportData = reportSnap.data();
          // Check if we need to get latest session report
          const sessions = reportData.sessions || {};
          const latestSessionId = Object.keys(sessions).sort().pop();
          if (latestSessionId) {
            setReport(sessions[latestSessionId]);
          }
        }
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user && teacherProfile && studentId) {
      fetchData();
    }
  }, [user, teacherProfile, studentId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !studentInfo) {
    return (
      <div className="min-h-screen py-12 px-4" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-200">
            {error || "학생 정보를 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => router.push("/teacher/dashboard")}
            className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
          >
            대시보드로 돌아가기
          </button>
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LuFileText size={32} color={iconStyles.color.primary} />
              학생 리포트
            </h1>
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <LuArrowLeft size={18} />
              대시보드로 돌아가기
            </button>
          </div>

          <div className="text-slate-300">
            <p className="text-lg font-semibold">{studentInfo.name} ({studentInfo.classCode} {studentInfo.studentNumber}번)</p>
            <p className="text-sm">총 {logs.length}개 발언 기록</p>
          </div>
        </div>

        {/* Report Content */}
        {report ? (
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
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <p className="text-slate-300">아직 생성된 리포트가 없습니다.</p>
          </div>
        )}

        {/* Logs List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">발언 기록</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 text-sm">
                    {log.timestamp?.toDate?.()?.toLocaleString("ko-KR") || "날짜 없음"}
                  </span>
                  {log.aiScore && (
                    <span className="text-purple-300 font-semibold">
                      점수: {log.aiScore.overall}점
                    </span>
                  )}
                </div>
                <p className="text-slate-200">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

