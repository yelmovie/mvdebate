"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
    getTeacherClasses, 
    createClass, 
    getClassStudents, 
    updateStudentRoster, 
    updateClassConfig 
} from "@/services/teacherService";
import { ClassInfo, StudentProfile } from "@/types/schema";
import BackButton from "@/components/common/BackButton";

export default function TeacherManagePage() {
  const { user, teacherProfile } = useAuth();
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Class Configuration State
  const [localClassSize, setLocalClassSize] = useState<number>(30); // Local state for selector

  // Roster Editing State
  const [rosterNames, setRosterNames] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Bulk Import State
  const [pasteInput, setPasteInput] = useState("");

  // 1. Fetch Classes on Load
  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  // 2. Fetch Students when Class Changes
  useEffect(() => {
    if (currentClass) {
      loadStudents(currentClass.code);
      setLocalClassSize(currentClass.classSize || 30);
    }
  }, [currentClass]);

  const loadClasses = async () => {
    if (!user) return;
    try {
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls);
      if (cls.length > 0 && !currentClass) {
        setCurrentClass(cls[0]); // Default to first class if not selected
      } else if (currentClass) {
        // Refresh current class info (e.g. after update)
        const updated = cls.find(c => c.code === currentClass.code);
        if (updated) setCurrentClass(updated);
      }
    } catch (error) {
      console.error("Failed to load classes", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (code: string) => {
    try {
      const list = await getClassStudents(code);
      setStudents(list);
      
      // Initialize edit state
      const initialNames: Record<number, string> = {};
      list.forEach(s => {
        initialNames[s.studentNumber] = s.name;
      });
      setRosterNames(initialNames);
    } catch (error) {
      console.error("Failed to load students", error);
    }
  };

  const handleCreateClass = async () => {
    if (!user) return;
    try {
      const newCode = await createClass(user.uid);
      alert(`새로운 반이 생성되었습니다: ${newCode}`);
      loadClasses();
    } catch (error) {
      console.error("Create class failed", error);
      alert("반 생성에 실패했습니다.");
    }
  };

  // --- Class Size Logic ---
  const handleClassSizeChange = async (newSize: number) => {
    if (!currentClass) return;
    setLocalClassSize(newSize);
    
    // Auto-save styling preference
    try {
        await updateClassConfig(currentClass.code, { classSize: newSize });
        setCurrentClass(prev => prev ? { ...prev, classSize: newSize } : null);
    } catch (error) {
        console.error("Failed to update class size", error);
    }
  };

  // --- Bulk Import Logic ---
  const handlePasteApply = () => {
    if (!pasteInput.trim()) return;

    const lines = pasteInput.split("\n");
    const newNames = { ...rosterNames };
    let updateCount = 0;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Try Tab Split first
        let parts = trimmed.split("\t");
        if (parts.length < 2) {
            // Fallback to Space Split (first token is number)
            const spaceParts = trimmed.split(/\s+/);
            if (spaceParts.length >= 2) {
                const potentialNum = spaceParts[0];
                const potentialName = spaceParts.slice(1).join(" ");
                parts = [potentialNum, potentialName];
            }
        }

        if (parts.length >= 2) {
            const numStr = parts[0].replace(/[^0-9]/g, ""); // Remove non-digits (e.g. "1번")
            const name = parts[1].trim();
            const num = parseInt(numStr, 10);

            if (!isNaN(num) && num >= 1 && num <= 30 && name) {
                // Ignore if number > current class size? 
                // User said: "28~30 data ignore but show toast"
                if (num <= localClassSize) {
                    newNames[num] = name;
                    updateCount++;
                }
            }
        }
    });

    if (updateCount > 0) {
        setRosterNames(newNames);
        setPasteInput("");
        setIsEditing(true); // Switch to edit mode to review
        alert(`${updateCount}명의 학생 이름이 입력되었습니다. (저장 버튼을 눌러 확정해주세요)`);
    } else {
        alert("유효한 데이터가 없습니다. '번호 이름' 형식인지 확인해주세요.");
    }
  };

  const handleSaveRoster = async () => {
    if (!currentClass) return;
    setIsSaving(true);
    
    try {
      // Prepare change list
      const updates = [];
      const MAX_STUDENTS = 30; // Always support up to 30 internally
      
      for (let i = 1; i <= MAX_STUDENTS; i++) {
        const name = rosterNames[i]?.trim();
        if (name) {
          updates.push({ number: i, name });
        }
      }

      await updateStudentRoster(currentClass.code, updates);
      await loadStudents(currentClass.code); // Reload to confirm
      setIsEditing(false);
      alert("학생 명단이 저장되었습니다.");
    } catch (error) {
      console.error("Save roster failed", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameChange = (num: number, value: string) => {
    setRosterNames(prev => ({
      ...prev,
      [num]: value
    }));
  };

  // Name Logic using Helper
  const { getTeacherDisplayName, user: authUser } = useAuth();
  const displayName = getTeacherDisplayName();
  const isDemo = authUser?.isAnonymous;

  if (loading) {
    return (
        <DashboardLayout role="teacher" userName={displayName}>
           <div style={{ padding: 40, textAlign: "center" }}>로딩중...</div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" userName={displayName} layoutMode="custom">
      <div className="manage-container">
        
        {/* Back Button */}
        <BackButton fallbackPath="/teacher/dashboard" />

        {/* Header Message */}
        <div className="page-header">
            <h1 className="page-title">
                {new Date().getMonth() + 1}월 {new Date().getDate()}일, <span className={isDemo ? "demo-text" : ""}>{displayName}</span> {isDemo ? "계정입니다." : "선생님 환영합니다! 👋"}
            </h1>
            {isDemo && <p className="demo-sub">체험용 계정은 데이터가 임시로만 저장됩니다.</p>}
        </div>

        {/* Content Grid */}
        <div className="manage-grid">
            
            {/* 1. Class Selector & Config (Left or Top) */}
            <div className="class-panel">
                <DashboardCard title="우리 반 관리 🏫">
                    <div className="class-control-layout">
                        {classes.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                                <p style={{ marginBottom: 16, color: "var(--ms-text-muted)" }}>아직 개설된 반이 없습니다.</p>
                                <button className="btn btn-primary" onClick={handleCreateClass}>
                                    + 새 반 만들기
                                </button>
                            </div>
                        ) : (
                        <div className="class-controls">
                            <div className="control-group">
                                <label>현재 선택된 반</label>
                                <select 
                                    className="ms-select"
                                    value={currentClass?.code || ""}
                                    onChange={(e) => {
                                        const found = classes.find(c => c.code === e.target.value);
                                        if (found) setCurrentClass(found);
                                    }}
                                >
                                    {classes.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.studentCount}명)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="control-group">
                                <label>반 인원 설정</label>
                                <select 
                                    className="ms-select"
                                    value={localClassSize}
                                    onChange={(e) => handleClassSizeChange(Number(e.target.value))}
                                >
                                    {[10, 15, 20, 25, 30].map(size => (
                                        <option key={size} value={size}>{size}명</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="class-code-display">
                                <span className="label">반 코드</span>
                                <span className="code">{currentClass?.code}</span>
                            </div>
                        </div>
                        )}
                    </div>
                </DashboardCard>
            </div>

            {/* 2. Roster Management (Right or Bottom, full width) */}
            {currentClass && (
            <div className="roster-panel">
                <DashboardCard 
                    title={`학생 명단 (1번 ~ ${localClassSize}번)`}
                    actionButton={
                        isEditing ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button 
                                    className="btn btn-secondary small-btn" 
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    취소
                                </button>
                                <button 
                                    className="btn btn-primary small-btn" 
                                    onClick={handleSaveRoster}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "저장 중..." : "저장 완료"}
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="btn btn-secondary small-btn" 
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ 명단 수정하기
                            </button>
                        )
                    }
                >
                    {/* Bulk Import Section (Only in Edit Mode) */}
                    {isEditing && (
                        <div className="bulk-import-box">
                            <h4 className="bulk-title">📋 학생 명단 일괄 등록</h4>
                            <p className="bulk-desc">
                                엑셀에서 <strong>[번호, 이름]</strong> 열을 복사하여 붙여넣으세요.
                            </p>
                            <div className="bulk-input-area">
                                <textarea 
                                    value={pasteInput}
                                    onChange={(e) => setPasteInput(e.target.value)}
                                    placeholder={"예시)\n1  김도훈\n2  이서연..."}
                                    className="bulk-textarea"
                                />
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={handlePasteApply}
                                    style={{ height: "auto" }}
                                >
                                    적용
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Student Grid */}
                    <div className="student-grid">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
                            const student = students.find(s => s.studentNumber === num);
                            // Use rosterNames if editing (or if loading initially set), else student data
                            // Actually rosterNames is initialized from student data, so it is the source of truth for display
                            const nameValue = rosterNames[num] || "";
                            const isActive = num <= localClassSize;
                            
                            // Hide inactive rows in view mode
                            if (!isActive && !isEditing) return null;

                            return (
                                <div key={num} className={`student-card ${isActive ? 'active' : 'inactive'}`} style={{ opacity: isActive ? 1 : 0.5 }}>
                                    <span className="student-num">
                                        {num}번
                                    </span>
                                    
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={nameValue} 
                                            onChange={(e) => handleNameChange(num, e.target.value)}
                                            placeholder={isActive ? "이름" : ""}
                                            disabled={!isActive}
                                            className="student-input"
                                        />
                                    ) : (
                                        <div className="student-name-container">
                                            <span className={`student-name ${!nameValue ? 'empty' : ''}`} title={nameValue}>
                                                {nameValue || "-"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DashboardCard>
            </div>
            )}
        </div>

      </div>

      <style jsx>{`
        .manage-container {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        
        .page-header {
            margin-bottom: 24px;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .demo-text {
            color: var(--ms-text-muted);
        }

        .demo-sub {
            font-size: 0.9rem;
            color: var(--ms-rose);
            margin-top: 4px;
        }

        /* Grid Layout */
        .manage-grid {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .class-controls {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .control-group label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--ms-text-muted);
        }

        .ms-select {
            padding: 10px;
            border-radius: 8px;
            border: 1px solid var(--ms-border);
            font-size: 1rem;
            background: var(--ms-surface);
            color: var(--ms-text);
        }

        .class-code-display {
            background: var(--ms-bg-subtle);
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }
        .class-code-display .label {
            display: block;
            font-size: 0.8rem;
            color: var(--ms-text-muted);
            margin-bottom: 4px;
        }
        .class-code-display .code {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--ms-primary);
            letter-spacing: 1px;
        }

        .student-grid {
            display: grid;
            /* Adaptive columns: min 140px ensures name has space */
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); 
            gap: 12px;
        }

        .student-card {
            background: var(--ms-surface);
            border: 1px solid var(--ms-border-subtle);
            border-radius: 12px;
            padding: 12px 16px; /* slightly more h-padding */
            display: flex;
            flex-direction: column; /* Stack vertically for better space usage */
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
            min-height: 70px; /* consistent height */
        }

        .student-card.inactive {
            background: var(--ms-bg-subtle);
            border-style: dashed;
        }

        .student-num {
            font-size: 0.75rem;
            color: var(--ms-text-muted);
            font-weight: 500;
        }
        
        .student-name-container {
            width: 100%;
            text-align: center;
            /* Ensure container doesn't overflow */
            overflow: hidden;
        }

        .student-name {
            font-size: 1rem;
            font-weight: 600;
            color: var(--ms-text);
            display: block;
            /* Text truncation logic */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 100%;
        }

        .student-name.empty {
            color: var(--ms-border);
            font-weight: 400;
            font-size: 0.9rem;
        }

        .student-input {
            width: 100%;
            padding: 6px;
            border: 1px solid var(--ms-border);
            border-radius: 6px;
            font-size: 0.95rem;
            text-align: center;
        }

        .bulk-import-box {
            background: var(--ms-bg-subtle);
            border: 1px dashed var(--ms-primary);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
        }
        .bulk-title {
            font-size: 0.95rem;
            color: var(--ms-primary);
            margin-bottom: 4px;
        }
        .bulk-desc {
            font-size: 0.85rem;
            color: var(--ms-text-muted);
            margin-bottom: 12px;
        }
        .bulk-input-area {
            display: flex;
            gap: 10px;
        }
        .bulk-textarea {
            flex: 1;
            height: 60px;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid var(--ms-border);
            font-size: 0.9rem;
        }

        .small-btn {
            font-size: 0.85rem;
            padding: 6px 12px;
        }

        /* Desktop Layout */
        @media (min-width: 768px) {
            .manage-grid {
                display: grid;
                grid-template-columns: 300px 1fr; 
                align-items: start;
            }

            .student-grid {
                /* Even more columns on big screen */
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); 
            }
        }
      `}</style>
    </DashboardLayout>
  );
}
