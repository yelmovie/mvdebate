"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuSwords, LuLoaderCircle, LuUsers } from "react-icons/lu";

interface Battle {
  id: string;
  classCode: string;
  participants: Array<{ studentId: string; nickname: string }>;
  topic: string;
  round: number;
  logs: Array<{
    studentId: string;
    nickname: string;
    text: string;
    timestamp: any;
    round: number;
  }>;
  status: string;
}

export default function StudentBattlePage() {
  const { studentProfile } = useAuth();
  const router = useRouter();
  const [inQueue, setInQueue] = useState(false);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!studentProfile) {
      router.push("/");
      return;
    }

    // Check if student is already in a battle
    const checkBattle = async () => {
      try {
        const battlesRef = collection(db, "battles");
        const studentId = `${studentProfile.classCode}-${studentProfile.studentNumber}`;
        
        // Listen for active battles
        const unsubscribe = onSnapshot(battlesRef, (snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            const participants = data.participants || [];
            const isParticipant = participants.some((p: any) => p.studentId === studentId);
            
            if (isParticipant && data.status === "active" || data.status === "started") {
              setBattle({ id: doc.id, ...data } as Battle);
              setInQueue(false);
            }
          });
        });

        return () => unsubscribe();
      } catch (err: any) {
        console.error("[Firestore Error]", err);
      }
    };

    checkBattle();
  }, [studentProfile, router]);

  const joinQueue = async () => {
    if (!studentProfile) return;

    setLoading(true);
    setError("");

    try {
      const studentId = `${studentProfile.classCode}-${studentProfile.studentNumber}`;
      const queueRef = doc(collection(db, "battleQueue"), `${studentId}-${Date.now()}`);
      
      await setDoc(queueRef, {
        studentId: studentId,
        nickname: studentProfile.name,
        classCode: studentProfile.classCode,
        readyAt: serverTimestamp(),
      });

      setInQueue(true);

      // Try to match immediately
      const matchResponse = await fetch("/api/battle/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: studentProfile.classCode }),
      });

      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        if (matchData.matched) {
          setBattle(matchData);
          setInQueue(false);
          
          // Start battle
          await fetch("/api/battle/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ battleId: matchData.battleId }),
          });
        }
      }
    } catch (err: any) {
      console.error("[Battle Queue Error]", err);
      setError(err.message || "배틀 큐에 참가하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submitTurn = async () => {
    if (!battle || !inputText.trim()) return;

    setLoading(true);
    setError("");

    try {
      const studentId = `${studentProfile!.classCode}-${studentProfile!.studentNumber}`;
      
      const response = await fetch("/api/battle/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId: battle.id,
          studentId: studentId,
          text: inputText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("턴 제출에 실패했습니다.");
      }

      setInputText("");
      
      // Refresh battle data
      const battleRef = doc(db, "battles", battle.id);
      const battleSnap = await getDoc(battleRef);
      if (battleSnap.exists()) {
        setBattle({ id: battleSnap.id, ...battleSnap.data() } as Battle);
      }
    } catch (err: any) {
      console.error("[Battle Round Error]", err);
      setError(err.message || "턴 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: "radial-gradient(circle at top, #252952 0, #050616 55%, #02030B 100%)"
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LuSwords size={32} color={iconStyles.color.primary} />
            토론 배틀
          </h1>
          <p className="text-slate-300 text-sm">
            같은 반 친구와 실시간 토론 배틀을 시작하세요!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Queue Status */}
        {inQueue && !battle && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8 text-center">
            <LuLoaderCircle className="animate-spin mx-auto mb-4" size={48} color={iconStyles.color.primary} />
            <p className="text-white text-lg">상대방을 기다리는 중...</p>
            <p className="text-slate-300 text-sm mt-2">곧 매칭될 거예요!</p>
          </div>
        )}

        {/* Battle Content */}
        {battle ? (
          <div className="space-y-6">
            {/* Battle Info */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">토론 주제</h2>
              <p className="text-2xl font-semibold text-purple-300 mb-4">{battle.topic}</p>
              <div className="flex items-center gap-4 text-slate-300">
                <LuUsers size={20} />
                <span>참가자: {battle.participants.map(p => p.nickname).join(" vs ")}</span>
                <span className="ml-auto">라운드 {battle.round}</span>
              </div>
            </div>

            {/* Battle Logs */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">대화 기록</h2>
              <div className="space-y-3">
                {battle.logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      log.studentId === `${studentProfile.classCode}-${studentProfile.studentNumber}`
                        ? "bg-purple-500/20 border border-purple-500/30"
                        : "bg-slate-800/50 border border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{log.nickname}</div>
                    <div className="text-slate-200">{log.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="당신의 의견을 입력하세요..."
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
              />
              <button
                onClick={submitTurn}
                disabled={loading || !inputText.trim()}
                className="w-full py-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "제출 중..." : "발언하기"}
              </button>
            </div>
          </div>
        ) : !inQueue ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <button
              onClick={joinQueue}
              disabled={loading}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <LuLoaderCircle className="animate-spin" size={20} />
                  참가 중...
                </>
              ) : (
                <>
                  <LuSwords size={20} />
                  배틀 참가하기
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

