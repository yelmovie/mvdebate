"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuBriefcase, LuArrowLeft, LuTrophy } from "react-icons/lu";

interface PortfolioData {
  overallSummary: string;
  growthTimeline: string[];
  keywordCloud: string[];
  badges: string[];
  level: "초급" | "중급" | "상급" | "마스터";
  semesterStart?: string;
  semesterEnd?: string;
}

export default function TeacherPortfolioDetailPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
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
        // Parse studentId
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

        // Fetch portfolio
        const portfolioRef = doc(db, "portfolios", studentId);
        const portfolioSnap = await getDoc(portfolioRef);
        
        if (portfolioSnap.exists()) {
          setPortfolio(portfolioSnap.data() as PortfolioData);
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

  const levelColors = {
    초급: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    중급: "bg-green-500/20 text-green-300 border-green-500/30",
    상급: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    마스터: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LuBriefcase size={32} color={iconStyles.color.primary} />
              학생 포트폴리오
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
          </div>
        </div>

        {/* Portfolio Content */}
        {portfolio ? (
          <div className="space-y-6">
            {/* Level Badge */}
            <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center ${levelColors[portfolio.level]}`}>
              <LuTrophy size={48} className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">현재 레벨: {portfolio.level}</h2>
            </div>

            {/* Overall Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-3">📊 전체 요약</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200">
                {portfolio.overallSummary}
              </div>
            </div>

            {/* Growth Timeline */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-3">📈 성장 타임라인</h2>
              <div className="space-y-3">
                {portfolio.growthTimeline.map((item, index) => (
                  <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-200">
                    <span className="font-semibold">주차 {index + 1}:</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-3">🏆 획득한 배지</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {portfolio.badges.map((badge, index) => (
                  <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 text-center">
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Cloud */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-3">💬 자주 사용한 키워드</h2>
              <div className="flex flex-wrap gap-2">
                {portfolio.keywordCloud.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-200 text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <p className="text-slate-300">아직 생성된 포트폴리오가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

