"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuMessageSquare, LuArrowRight } from "react-icons/lu";

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

export default function TeacherFeedbacksPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
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

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const q = query(
          collection(db, "feedbacks"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[];
        setFeedbacks(data);
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("피드백을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user && teacherProfile) {
      fetchFeedbacks();
    }
  }, [user, teacherProfile]);

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

  if (authLoading || loading) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LuMessageSquare size={32} color={iconStyles.color.primary} />
            피드백 관리
          </h1>
          <p className="text-slate-300 text-sm">
            학생과 교사로부터 받은 피드백을 확인하세요. (총 {feedbacks.length}개)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Feedbacks List */}
        {feedbacks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
            <p className="text-slate-300 text-lg">아직 제출된 피드백이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => router.push(`/teacher/feedbacks/${feedback.id}`)}
                className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        feedback.role === "teacher"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {feedback.role === "teacher" ? "교사" : "학생"}
                      </span>
                      {feedback.classCode && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                          {feedback.classCode}
                        </span>
                      )}
                      <span className="text-slate-400 text-sm">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    <p className="text-white text-sm line-clamp-2">
                      {feedback.good || feedback.bad || "내용 없음"}
                    </p>
                  </div>
                  <LuArrowRight size={20} className="text-slate-400 flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

