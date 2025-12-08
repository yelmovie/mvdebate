"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuTrophy, LuAward, LuTrendingUp } from "react-icons/lu";

interface StudentRanking {
  studentId: string;
  name: string;
  classCode: string;
  studentNumber: number;
  averageScore: number;
  totalTurns: number;
  badges: string[];
  growthRate: number;
}

export default function TeacherRankingPage() {
  const { user, teacherProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ code: string; name: string }>>([]);
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
      if (!user || !teacherProfile) return;

      try {
        // Fetch teacher's classes
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

    fetchData();
  }, [user, teacherProfile, selectedClass]);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedClass) return;

      setLoading(true);
      try {
        // Fetch all students in this class
        const studentsRef = collection(db, "students");
        const studentsQuery = query(studentsRef, where("classCode", "==", selectedClass));
        const studentsSnap = await getDocs(studentsQuery);

        // Fetch logs for each student
        const logsRef = collection(db, "debateLogs");
        const studentRankings: StudentRanking[] = [];

        for (const studentDoc of studentsSnap.docs) {
          const studentData = studentDoc.data();
          const studentId = studentDoc.id;

          const logsQuery = query(
            logsRef,
            where("studentId", "==", studentId),
            orderBy("timestamp", "desc")
          );
          const logsSnap = await getDocs(logsQuery);

          const scores: number[] = [];
          logsSnap.forEach((logDoc) => {
            const score = logDoc.data().aiScore?.overall;
            if (score && typeof score === "number") {
              scores.push(score);
            }
          });

          const averageScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

          // Calculate growth rate (compare first half vs second half)
          const midPoint = Math.floor(scores.length / 2);
          const firstHalf = scores.slice(0, midPoint);
          const secondHalf = scores.slice(midPoint);
          
          const firstAvg = firstHalf.length > 0
            ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
            : 0;
          const secondAvg = secondHalf.length > 0
            ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
            : 0;
          
          const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

          // Determine badges
          const badges: string[] = [];
          if (averageScore >= 90) badges.push("마스터 토론가");
          if (averageScore >= 80) badges.push("우수 발언자");
          if (growthRate > 20) badges.push("급성장");
          if (scores.length >= 50) badges.push("열정왕");
          if (averageScore >= 75 && growthRate > 10) badges.push("성장형 인재");

          studentRankings.push({
            studentId: studentId,
            name: studentData.name || "이름 없음",
            classCode: studentData.classCode || selectedClass,
            studentNumber: studentData.studentNumber || 0,
            averageScore: Math.round(averageScore * 10) / 10,
            totalTurns: scores.length,
            badges: badges,
            growthRate: Math.round(growthRate * 10) / 10,
          });
        }

        // Sort by average score (descending)
        studentRankings.sort((a, b) => b.averageScore - a.averageScore);

        setRankings(studentRankings);
      } catch (err: any) {
        console.error("[Firestore Error]", err);
        setError("랭킹을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass) {
      fetchRankings();
    }
  }, [selectedClass]);

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
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <LuTrophy size={32} color={iconStyles.color.primary} />
            반별 랭킹
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

        {/* Rankings */}
        {rankings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
            <p className="text-slate-300 text-lg">랭킹 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((student, index) => (
              <div
                key={student.studentId}
                className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/50" :
                      index === 1 ? "bg-slate-500/20 text-slate-300 border-2 border-slate-500/50" :
                      index === 2 ? "bg-orange-500/20 text-orange-300 border-2 border-orange-500/50" :
                      "bg-slate-700/50 text-slate-400"
                    }`}>
                      {index + 1}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">
                        {student.name} ({student.classCode} {student.studentNumber}번)
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                        <span>평균 점수: <span className="text-purple-300 font-semibold">{student.averageScore}점</span></span>
                        <span>발언 횟수: {student.totalTurns}회</span>
                        {student.growthRate > 0 && (
                          <span className="flex items-center gap-1 text-green-300">
                            <LuTrendingUp size={16} />
                            성장률: +{student.growthRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {student.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-200 text-xs font-medium flex items-center gap-1"
                      >
                        <LuAward size={12} />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

