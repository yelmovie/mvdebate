"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuMessageSquare, LuArrowLeft } from "react-icons/lu";

interface Feedback {
  id: string;
  uid: string | null;
  role: "teacher" | "student";
  classCode: string | null;
  good: string;
  bad: string;
  needed: string;
  remove: string;
  nextSemester: "yes" | "no" | "unsure";
  createdAt: Timestamp | null;
}

export default function FeedbackDetailPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const feedbackId = params?.id as string;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth check
  useEffect(() => {
    if (!authLoading) {
      if (!user || !teacherProfile) {
        router.push("/");
      }
    }
  }, [user, teacherProfile, authLoading, router]);

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!feedbackId) return;

      try {
        const docRef = doc(db, "feedbacks", feedbackId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("피드백을 찾을 수 없습니다.");
          return;
        }

        setFeedback({
          id: docSnap.id,
          ...docSnap.data(),
        } as Feedback);
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("피드백을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user && teacherProfile && feedbackId) {
      fetchFeedback();
    }
  }, [user, teacherProfile, feedbackId]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "날짜 없음";
    const date = timestamp.toDate();
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextSemesterText = (value: "yes" | "no" | "unsure") => {
    switch (value) {
      case "yes":
        return "예";
      case "no":
        return "아니오";
      case "unsure":
        return "잘 모르겠음";
      default:
        return value;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen py-12 px-4" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-200">
            {error || "피드백을 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => router.push("/teacher/feedbacks")}
            className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
          >
            전체 목록으로 돌아가기
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
              <LuMessageSquare size={32} color={iconStyles.color.primary} />
              피드백 상세
            </h1>
            <button
              onClick={() => router.push("/teacher/feedbacks")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <LuArrowLeft size={18} />
              전체 목록으로 돌아가기
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${
              feedback.role === "teacher"
                ? "bg-purple-500/20 text-purple-300"
                : "bg-blue-500/20 text-blue-300"
            }`}>
              {feedback.role === "teacher" ? "교사" : "학생"}
            </span>
            {feedback.classCode && (
              <span className="px-3 py-1 rounded-full font-medium bg-slate-700/50 text-slate-300">
                반 코드: {feedback.classCode}
              </span>
            )}
            <span className="text-slate-400">
              제출 시간: {formatDate(feedback.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-6">
          {/* Question 1 */}
          <div>
            <h3 className="text-white font-semibold mb-2">1. 좋았던 점</h3>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 min-h-[80px]">
              {feedback.good || <span className="text-slate-500">내용 없음</span>}
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <h3 className="text-white font-semibold mb-2">2. 아쉬웠던 점</h3>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 min-h-[80px]">
              {feedback.bad || <span className="text-slate-500">내용 없음</span>}
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <h3 className="text-white font-semibold mb-2">3. 추가되었으면 하는 기능</h3>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 min-h-[80px]">
              {feedback.needed || <span className="text-slate-500">내용 없음</span>}
            </div>
          </div>

          {/* Question 4 */}
          <div>
            <h3 className="text-white font-semibold mb-2">4. 제거되었으면 하는 기능</h3>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 min-h-[80px]">
              {feedback.remove || <span className="text-slate-500">내용 없음</span>}
            </div>
          </div>

          {/* Question 5 */}
          <div>
            <h3 className="text-white font-semibold mb-2">5. 다음 학기 사용 의향</h3>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                feedback.nextSemester === "yes"
                  ? "bg-green-500/20 text-green-300"
                  : feedback.nextSemester === "no"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}>
                {getNextSemesterText(feedback.nextSemester)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

