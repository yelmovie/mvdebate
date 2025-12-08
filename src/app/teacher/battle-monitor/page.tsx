"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuSwords, LuUsers } from "react-icons/lu";

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
  createdAt: Timestamp | null;
}

export default function TeacherBattleMonitorPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ code: string; name: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user || !teacherProfile) {
        router.push("/");
      }
    }
  }, [user, teacherProfile, authLoading, router]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user || !teacherProfile) return;

      try {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const classesRef = collection(db, "classes");
        const classesQuery = query(classesRef, where("teacherId", "==", user.uid));
        const classesSnap = await getDocs(classesQuery);
        
        const fetchedClasses: Array<{ code: string; name: string }> = [];
        classesSnap.forEach((doc) => {
          const data = doc.data();
          fetchedClasses.push({
            code: doc.id,
            name: data.name || doc.id,
          });
        });

        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0 && !selectedClass) {
          setSelectedClass(fetchedClasses[0].code);
        }
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("반 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchClasses();
  }, [user, teacherProfile, selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;

    const battlesRef = collection(db, "battles");
    const q = query(battlesRef, where("classCode", "==", selectedClass));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeBattles: Battle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active" || data.status === "started") {
          activeBattles.push({
            id: doc.id,
            ...data,
          } as Battle);
        }
      });
      setBattles(activeBattles);
    }, (err) => {
      console.error("[Firestore Error]", err);
      setError("배틀 정보를 불러오는 중 오류가 발생했습니다.");
    });

    return () => unsubscribe();
  }, [selectedClass]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "날짜 없음";
    const date = timestamp.toDate();
    return date.toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
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
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <LuSwords size={32} color={iconStyles.color.primary} />
            배틀 실시간 모니터링
          </h1>

          {/* Class Selector */}
          {classes.length > 0 && (
            <div className="flex items-center gap-4">
              <label className="text-slate-300">반 선택:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {classes.map((cls) => (
                  <option key={cls.code} value={cls.code}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Active Battles */}
        {battles.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
            <p className="text-slate-300 text-lg">현재 진행 중인 배틀이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {battles.map((battle) => (
              <div
                key={battle.id}
                className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/60 transition-all"
              >
                {/* Battle Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LuSwords size={20} color={iconStyles.color.primary} />
                    <span className="text-white font-semibold">배틀 #{battle.id.slice(-6)}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    battle.status === "started" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {battle.status === "started" ? "진행 중" : "대기 중"}
                  </span>
                </div>

                {/* Topic */}
                <h3 className="text-lg font-bold text-purple-300 mb-3">{battle.topic}</h3>

                {/* Participants */}
                <div className="flex items-center gap-3 mb-4">
                  <LuUsers size={18} className="text-slate-400" />
                  <div className="text-slate-300 text-sm">
                    {battle.participants.map(p => p.nickname).join(" vs ")}
                  </div>
                </div>

                {/* Round Info */}
                <div className="text-slate-400 text-sm mb-4">
                  라운드 {battle.round} • 시작: {formatDate(battle.createdAt)}
                </div>

                {/* Recent Logs */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="text-xs text-slate-400 mb-2">최근 대화:</div>
                  {battle.logs.slice(-3).map((log, index) => (
                    <div key={index} className="text-xs text-slate-300 mb-1">
                      <span className="font-semibold">{log.nickname}:</span> {log.text.slice(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

