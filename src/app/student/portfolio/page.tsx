"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuBriefcase, LuLoaderCircle, LuTrophy } from "react-icons/lu";

interface PortfolioData {
  overallSummary: string;
  growthTimeline: string[];
  keywordCloud: string[];
  badges: string[];
  level: "초급" | "중급" | "상급" | "마스터";
}

export default function StudentPortfolioPage() {
  const { studentProfile } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentProfile) {
      router.push("/");
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const studentId = `${studentProfile.classCode}-${studentProfile.studentNumber}`;
        const portfolioRef = doc(db, "portfolios", studentId);
        const portfolioSnap = await getDoc(portfolioRef);

        if (portfolioSnap.exists()) {
          setPortfolio(portfolioSnap.data() as PortfolioData);
        }
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("포트폴리오를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [studentProfile, router]);

  const generatePortfolio = async () => {
    setGenerating(true);
    setError("");

    try {
      // Fetch all logs first
      const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");
      const logsRef = collection(db, "debateLogs");
      const studentId = `${studentProfile!.classCode}-${studentProfile!.studentNumber}`;
      const q = query(
        logsRef,
        where("studentId", "==", studentId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      
      const logs = snapshot.docs.map(doc => ({
        text: doc.data().text || "",
        timestamp: doc.data().timestamp,
        aiScore: doc.data().aiScore,
      }));

      if (logs.length === 0) {
        throw new Error("포트폴리오를 생성할 로그가 없습니다.");
      }

      const response = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error("포트폴리오 생성에 실패했습니다.");
      }

      const data = await response.json();
      setPortfolio(data);

      // Save to Firestore
      const { setDoc } = await import("firebase/firestore");
      const portfolioRef = doc(db, "portfolios", studentId);
      await setDoc(portfolioRef, {
        ...data,
        semesterStart: new Date().toISOString(),
        semesterEnd: null,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[Portfolio Generation Error]", err);
      setError(err.message || "포트폴리오 생성 중 오류가 발생했습니다.");
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
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LuBriefcase size={32} color={iconStyles.color.primary} />
            내 성장 포트폴리오
          </h1>
          <p className="text-slate-300 text-sm">
            이번 학기 동안의 토론 성장 기록을 확인하세요.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {!portfolio && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8 text-center">
            <button
              onClick={generatePortfolio}
              disabled={generating}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {generating ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={20} />
                  포트폴리오 생성 중...
                </>
              ) : (
                "포트폴리오 생성하기"
              )}
            </button>
          </div>
        )}

        {/* Portfolio Content */}
        {portfolio && (
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
        )}
      </div>
    </div>
  );
}

