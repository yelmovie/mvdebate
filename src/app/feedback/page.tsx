"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuMessageSquare } from "react-icons/lu";

export default function FeedbackPage() {
  const { user, userRole, studentProfile, teacherProfile } = useAuth();
  const router = useRouter();
  
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [needed, setNeeded] = useState("");
  const [remove, setRemove] = useState("");
  const [nextSemester, setNextSemester] = useState<"yes" | "no" | "unsure">("unsure");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Determine role and classCode
  const role = userRole || (studentProfile ? "student" : teacherProfile ? "teacher" : null);
  const classCode = studentProfile?.classCode || null;
  const uid = user?.uid || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!role) {
        throw new Error("로그인이 필요합니다.");
      }

      const feedbackData = {
        uid: uid,
        role: role,
        classCode: classCode,
        good: good.trim(),
        bad: bad.trim(),
        needed: needed.trim(),
        remove: remove.trim(),
        nextSemester: nextSemester,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "feedbacks"), feedbackData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error("[Firestore Error]", err);
      setError(err.message || "피드백 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{
        background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
      }}>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-xl mx-auto text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">소중한 의견 감사합니다!</h2>
          <p className="text-slate-300">피드백이 성공적으로 제출되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
    }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LuMessageSquare size={32} color={iconStyles.color.primary} />
            시범 운영 피드백
          </h1>
          <p className="text-slate-300 text-sm">
            더 나은 수업을 위해 의견을 자유롭게 작성해주세요.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 space-y-6">
          {/* Question 1: 좋았던 점 */}
          <div>
            <label className="block text-white font-medium mb-2">
              1. 이번 수업에서 좋았던 점은 무엇인가요?
            </label>
            <textarea
              value={good}
              onChange={(e) => setGood(e.target.value)}
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="예: AI와 토론하는 것이 재미있었어요"
            />
          </div>

          {/* Question 2: 아쉬웠던 점 */}
          <div>
            <label className="block text-white font-medium mb-2">
              2. 아쉬웠던 점이나 불편했던 점은 무엇인가요?
            </label>
            <textarea
              value={bad}
              onChange={(e) => setBad(e.target.value)}
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="예: 화면이 너무 작아서 불편했어요"
            />
          </div>

          {/* Question 3: 추가되었으면 하는 기능 */}
          <div>
            <label className="block text-white font-medium mb-2">
              3. 추가되었으면 하는 기능이나 개선사항이 있나요?
            </label>
            <textarea
              value={needed}
              onChange={(e) => setNeeded(e.target.value)}
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="예: 더 많은 토론 주제가 있었으면 좋겠어요"
            />
          </div>

          {/* Question 4: 제거되었으면 하는 기능 */}
          <div>
            <label className="block text-white font-medium mb-2">
              4. 제거되었으면 하는 기능이나 불필요한 부분이 있나요?
            </label>
            <textarea
              value={remove}
              onChange={(e) => setRemove(e.target.value)}
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="예: 특별히 없어요"
            />
          </div>

          {/* Question 5: 다음 학기 사용 의향 */}
          <div>
            <label className="block text-white font-medium mb-2">
              5. 다음 학기에 다시 사용하고 싶으신가요?
            </label>
            <div className="flex flex-col gap-3 mt-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="nextSemester"
                  value="yes"
                  checked={nextSemester === "yes"}
                  onChange={() => setNextSemester("yes")}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-white">네, 다시 사용하고 싶어요</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="nextSemester"
                  value="no"
                  checked={nextSemester === "no"}
                  onChange={() => setNextSemester("no")}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-white">아니요, 사용하지 않을 것 같아요</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="nextSemester"
                  value="unsure"
                  checked={nextSemester === "unsure"}
                  onChange={() => setNextSemester("unsure")}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-white">잘 모르겠어요</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "제출 중..." : "피드백 제출하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

