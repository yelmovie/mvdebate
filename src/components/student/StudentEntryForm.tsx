"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "../../contexts/StudentContext";
import { joinClass, getClassInfo, getClassStudentsPublic } from "../../services/studentService";
import { FaHashtag, FaUser, FaIdCard, FaCircleCheck, FaRocket } from "react-icons/fa6";

export default function StudentEntryForm() {
  const router = useRouter();
  const { loginStudent } = useStudent();
  
  const [classCode, setClassCode] = useState("");
  const [number, setNumber] = useState("1");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Class Info State
  const [maxNumber, setMaxNumber] = useState(30);
  const [roster, setRoster] = useState<Record<number, string>>({});
  const [isValidClass, setIsValidClass] = useState(false);

  // Check Class Code & Fetch Roster
  useEffect(() => {
    const checkClass = async () => {
        if (classCode.length === 5) {
            try {
                // 1. Get Class Info
                const info: any = await getClassInfo(classCode);
                if (info) {
                    setIsValidClass(true);
                    setMaxNumber(info.classSize || 30);
                    
                    // 2. Get Roster
                    const students = await getClassStudentsPublic(classCode);
                    const nameMap: Record<number, string> = {};
                    students.forEach((s: any) => {
                        nameMap[s.studentNumber] = s.name;
                    });
                    setRoster(nameMap);

                    // Auto-fill for current number if exists
                    const currentNum = parseInt(number);
                    if (nameMap[currentNum]) {
                        setName(nameMap[currentNum]);
                    }
                } else {
                    setIsValidClass(false);
                    setRoster({});
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            setIsValidClass(false);
        }
    };
    
    // Debounce slightly or just run
    const timer = setTimeout(checkClass, 500);
    return () => clearTimeout(timer);
  }, [classCode]);

  // Handle Number Change -> Auto Fill Name
  const handleNumberChange = (newNum: string) => {
      setNumber(newNum);
      const n = parseInt(newNum);
      if (roster[n]) {
          setName(roster[n]);
      } else {
          setName(""); // Clear if no pre-filled name
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const code = classCode.toUpperCase().trim();
        const num = parseInt(number);
        const studentName = name.trim();

        if (!code) throw new Error("반 코드를 입력해주세요.");
        if (isNaN(num) || num < 1 || num > 30) throw new Error("번호는 1~30 사이여야 합니다.");
        if (num > maxNumber) throw new Error(`이 반은 ${maxNumber}번까지만 입장 가능합니다.`);
        if (!studentName) throw new Error("이름을 입력해주세요.");
        if (!agreePrivacy) throw new Error("개인정보 처리방침에 동의해주세요.");
        if (!agreeTerms) throw new Error("이용약관에 동의해주세요.");

        const profile = await joinClass(code, num, studentName);
        
        // Update Context (Session)
        loginStudent(profile);
        
        // Redirect to Student Main
        router.push("/debate"); 
        
    } catch (err: any) {
        console.error(err);
        setError(err.message || "입장 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 헤더 제거 - 상위 컴포넌트에서 처리 */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Code */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold flex items-center gap-2.5" style={{ color: "var(--landing-text)" }}>
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--landing-border)" }}>
              <FaHashtag size={14} className="text-purple-200" />
            </div>
            <span>반 코드</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <FaIdCard
                size={18}
                className="opacity-80"
                style={{ color: isValidClass ? "rgba(34,197,94,0.95)" : "rgba(226,232,240,0.6)" }}
              />
            </div>
            <input
              type="text"
              placeholder="예: A1234"
              value={classCode}
              onChange={e => setClassCode(e.target.value.toUpperCase())}
              className="landing-control landing-focus pl-11 text-base"
              maxLength={5}
            />
            {isValidClass && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold flex items-center gap-2">
                <FaCircleCheck size={18} className="text-green-400" />
                <span>{maxNumber}명</span>
              </span>
            )}
          </div>
        </div>

        {/* Number & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold flex items-center gap-2.5" style={{ color: "var(--landing-text)" }}>
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--landing-border)" }}>
                <span className="font-bold text-xs" style={{ color: "var(--landing-muted)" }}>#</span>
              </div>
              <span>번호</span>
            </label>
            <div className="relative">
              <select
                value={number}
                onChange={e => handleNumberChange(e.target.value)}
                className="landing-control landing-focus text-base"
              >
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n} className="bg-slate-900">{n}번</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
             <label className="text-sm font-semibold flex items-center gap-2.5" style={{ color: "var(--landing-text)" }}>
               <div className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--landing-border)" }}>
                 <FaUser size={14} className="text-violet-200" />
               </div>
               <span>이름</span>
             </label>
             <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                 <FaUser size={18} style={{ color: "rgba(226,232,240,0.6)" }} />
               </div>
               <input
                 type="text"
                 placeholder="본명 입력"
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="landing-control landing-focus pl-11 text-base"
               />
             </div>
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-3 pt-2">
           <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl landing-focus"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--landing-border)" }}
           >
             <input 
                type="checkbox" 
                checked={agreePrivacy} 
                onChange={e => setAgreePrivacy(e.target.checked)}
                className="w-5 h-5 cursor-pointer" 
             />
             <span className="text-sm font-medium flex-1" style={{ color: "var(--landing-text)" }}>개인정보 처리방침 동의</span>
           </label>
           <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl landing-focus"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--landing-border)" }}
           >
             <input 
                type="checkbox" 
                checked={agreeTerms} 
                onChange={e => setAgreeTerms(e.target.checked)}
                className="w-5 h-5 cursor-pointer" 
             />
             <span className="text-sm font-medium flex-1" style={{ color: "var(--landing-text)" }}>이용약관 동의</span>
           </label>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-center py-3 rounded-xl border landing-glass"
            style={{ borderColor: "rgba(248,113,113,0.35)", color: "rgba(254,202,202,0.95)" }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="landing-primary-btn landing-focus flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <span className="flex items-center gap-2.5">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              <span>입장 중...</span>
            </span>
          ) : (
            <>
              <FaRocket size={18} className="shrink-0" />
              <span>토론 입장하기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
