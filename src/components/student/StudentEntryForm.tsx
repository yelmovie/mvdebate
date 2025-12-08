"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "../../contexts/StudentContext";
import { joinClass, getClassInfo, getClassStudentsPublic } from "../../services/studentService";
import { StudentIcons, iconStyles } from "../../lib/icons";
import "./StudentEntryForm.css";

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
    <div className="student-entry-wrapper">
      <div className="student-entry-card">
        {/* Card Header */}
        <div className="student-entry-header">
          <h1 className="student-entry-title">
            <StudentIcons.Entry 
              className="inline-block mr-2 align-middle transition-all duration-200 hover:scale-105" 
              size={24} 
              color={iconStyles.color.primary} 
            />
            학생 입장
          </h1>
          <p className="student-entry-subtitle">
            반 코드를 입력하고 우리 반 토론 방으로 입장해 보세요.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="student-entry-form">
          {/* Class Code Input */}
          <div className="student-entry-form-group">
            <label className="student-entry-form-label">
              <span>반 코드</span>
              {isValidClass && (
                <span className="student-entry-form-valid">✅ 확인됨 ({maxNumber}명)</span>
              )}
            </label>
            <input 
              type="text" 
              placeholder="예: A1234"
              value={classCode}
              onChange={e => setClassCode(e.target.value.toUpperCase())}
              className={`student-entry-form-input ${isValidClass ? 'student-entry-form-input--valid' : ''}`}
              maxLength={5}
            />
          </div>

          {/* Number & Name Row */}
          <div className="student-entry-form-row">
            <div className="student-entry-form-group student-entry-form-group--number">
              <label className="student-entry-form-label">번호</label>
              <div className="student-entry-form-select-wrapper">
                <select 
                  value={number}
                  onChange={e => handleNumberChange(e.target.value)}
                  className="student-entry-form-select"
                >
                  {Array.from({ length: maxNumber }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}번</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="student-entry-form-group student-entry-form-group--name">
              <label className="student-entry-form-label">이름</label>
              <input 
                type="text" 
                placeholder="이름 입력"
                value={name}
                onChange={e => setName(e.target.value)}
                className="student-entry-form-input"
              />
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className="student-entry-form-agreement">
            <label className="student-entry-form-checkbox-label">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="student-entry-form-checkbox"
              />
              <span className="student-entry-form-checkbox-text">
                개인정보 처리방침에 동의합니다{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-entry-form-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  (보기)
                </a>
              </span>
            </label>
            <label className="student-entry-form-checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="student-entry-form-checkbox"
              />
              <span className="student-entry-form-checkbox-text">
                이용약관에 동의합니다{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-entry-form-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  (보기)
                </a>
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="student-entry-form-error">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="student-entry-form-submit"
            disabled={loading || !agreePrivacy || !agreeTerms}
          >
            {loading ? (
              "입장 확인 중..."
            ) : (
              <>
                <StudentIcons.StartDebate size={18} className="inline-block mr-1" />
                우리 반 입장하기
              </>
            )}
          </button>
        </form>

        {/* Privacy Notice */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "rgba(4, 6, 18, 0.4)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "12px",
          color: "rgba(203, 213, 225, 0.8)",
          lineHeight: "1.6",
          textAlign: "center"
        }}>
          본 서비스는 2025년 교육 실험 목적의 시범 운영 중이며<br />
          학생 이름·번호·반코드 외의 개인정보는 저장하지 않습니다.<br />
          시범 운영 종료 후 모든 학생 데이터는 자동 삭제됩니다.
        </div>
      </div>
    </div>
  );
}
