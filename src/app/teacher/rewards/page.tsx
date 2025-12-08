"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
// ... imports
import { getTeacherClasses, getClassStudents, issueCoupons, addCustomCoupon, deleteCustomCoupon } from "@/services/teacherService";
import { ClassInfo, StudentProfile, CouponType, CustomCouponDef } from "@/types/schema";

const DEFAULT_COUPONS: { type: string; label: string; icon: string }[] = [
    { type: "SEAT_SWAP", label: "자리 바꾸기 1회권", icon: "🪑" },
    { type: "HINT_PEEK", label: "힌트 미리보기", icon: "💡" },
    { type: "TOPIC_VETO", label: "주제 거부권", icon: "🙅‍♂️" },
    { type: "TIME_EXTENSION", label: "발언 시간 연장", icon: "⏳" },
];

export default function TeacherRewardsPage() {
  const { user, teacherProfile } = useAuth();
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  
  // Action State
  const [selectedCouponType, setSelectedCouponType] = useState<string>("SEAT_SWAP");
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom Coupon State
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCouponLabel, setNewCouponLabel] = useState("");
  const [newCouponIcon, setNewCouponIcon] = useState("🎫"); // Default icon

  // Combined Coupon List
  const [availableCoupons, setAvailableCoupons] = useState(DEFAULT_COUPONS);

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  // Merge Custom Coupons when teacherProfile loads or changes
  useEffect(() => {
      const custom = teacherProfile?.customCoupons || [];
      const formattedCustom = custom.map(c => ({
          type: c.id, // Use ID as type key
          label: c.label,
          icon: c.icon,
          isCustom: true,
          original: c
      }));
      setAvailableCoupons([...DEFAULT_COUPONS, ...formattedCustom]);
  }, [teacherProfile]);

  useEffect(() => {
    if (currentClass) {
      loadStudents(currentClass.code);
    }
  }, [currentClass]);

  const loadClasses = async () => {
    if (!user) return;
    try {
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls);
      if (cls.length > 0) {
        setCurrentClass(cls[0]);
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
      list.sort((a, b) => a.studentNumber - b.studentNumber);
      setStudents(list);
      setSelectedStudentIds(new Set());
    } catch (error) {
      console.error("Failed to load students", error);
    }
  };

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === students.length) {
        setSelectedStudentIds(new Set());
    } else {
        setSelectedStudentIds(new Set(students.map(s => s.id)));
    }
  };

  const handleIssueCoupon = async () => {
    if (selectedStudentIds.size === 0) {
        alert("학생을 선택해주세요.");
        return;
    }
    
    const selectedCoupon = availableCoupons.find(c => c.type === selectedCouponType);
    if (!selectedCoupon) return;

    if (!confirm(`${selectedStudentIds.size}명의 학생에게 [${selectedCoupon.label}] 쿠폰을 지급하시겠습니까?`)) return;

    setIsProcessing(true);
    try {
        // If custom, pass label/icon snapshot
        const extras = (selectedCoupon as any).isCustom ? {
            customLabel: selectedCoupon.label,
            customIcon: selectedCoupon.icon
        } : undefined;

        // For custom types, the 'type' is the ID, which is fine to store, 
        // but we also store snapshots for display resilience.
        // For default types, we just store the type string.
        
        await issueCoupons(Array.from(selectedStudentIds), selectedCouponType, extras);
        
        alert("쿠폰 지급이 완료되었습니다! 🎉");
        setSelectedStudentIds(new Set());
    } catch (error) {
        console.error("Failed to issue coupons", error);
        alert("지급 중 오류가 발생했습니다.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleAddCustomCoupon = async () => {
      if (!newCouponLabel.trim()) {
          alert("쿠폰 이름을 입력해주세요.");
          return;
      }
      if (!user) return;

      try {
          await addCustomCoupon(user.uid, {
              label: newCouponLabel,
              icon: newCouponIcon
          });
          // Note: Real-time update might happen via AuthContext if it listens to doc changes, 
          // or we rely on page reload. Actually AuthContext usually updates on reload.
          // We might need to manually update local state or force reload profile.
          // For now, let's just refresh the page or manually update the local list temporarily.
          // Actually, let's just alert and reload because AuthContext might not catch it instantly.
          alert("새 쿠폰이 추가되었습니다. (화면이 새로고침 됩니다)");
          window.location.reload(); 
      } catch (error) {
          console.error("Add coupon failed", error);
          alert("쿠폰 추가에 실패했습니다.");
      }
  };

  const handleDeleteCustom = async (c: any) => {
      if (!user) return;
      if (!confirm(`'${c.label}' 쿠폰을 삭제하시겠습니까?`)) return;
      try {
          await deleteCustomCoupon(user.uid, c.original);
          alert("삭제되었습니다. (화면이 새로고침 됩니다)");
          window.location.reload();
      } catch (error) {
          console.error("Delete failed", error);
      }
  };

  if (loading) {
    return (
        <DashboardLayout role="teacher" userName={teacherProfile?.name || "선생님"}>
           <div style={{ padding: 40, textAlign: "center" }}>로딩중...</div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" userName={teacherProfile?.name || "선생님"}>
      
      {/* 1. Class Selection */}
      <DashboardCard title="보상/쿠폰 관리 🎁">
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
           {classes.length === 0 ? (
              <p style={{ color: "var(--ms-text-muted)" }}>개설된 반이 없습니다. [학생 명단 관리]에서 반을 먼저 만들어주세요.</p>
           ) : (
             <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 600 }}>반 선택:</span>
                    <select 
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--ms-border)" }}
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
             </>
           )}
        </div>

        {/* 2. Coupon Type Selection */}
        {currentClass && (
            <div style={{ background: "var(--ms-surface)", padding: "20px", borderRadius: "12px", border: "1px solid var(--ms-border-subtle)", marginBottom: "30px" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--ms-text)" }}>🎫 지급할 쿠폰 선택</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                    {availableCoupons.map(c => (
                        <div 
                            key={c.type}
                            onClick={() => setSelectedCouponType(c.type)}
                            style={{ 
                                cursor: "pointer",
                                padding: "16px", 
                                borderRadius: "8px", 
                                border: selectedCouponType === c.type ? "2px solid var(--ms-primary)" : "1px solid var(--ms-border)",
                                background: selectedCouponType === c.type ? "rgba(139, 92, 246, 0.05)" : "var(--ms-bg)",
                                textAlign: "center",
                                transition: "all 0.2s ease",
                                position: "relative"
                            }}
                        >
                            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{c.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem", wordBreak: "keep-all" }}>{c.label}</div>
                            {(c as any).isCustom && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCustom(c);
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        border: "none",
                                        background: "none",
                                        color: "var(--ms-text-muted)",
                                        cursor: "pointer",
                                        fontSize: "0.8rem"
                                    }}
                                    title="삭제"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Custom Coupon Button */}
                    <div 
                        onClick={() => setIsAddingCoupon(true)}
                        style={{ 
                            cursor: "pointer",
                            padding: "16px", 
                            borderRadius: "8px", 
                            border: "1px dashed var(--ms-primary)",
                            background: "rgba(139, 92, 246, 0.02)",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                            minHeight: "120px"
                        }}
                    >
                        <div style={{ fontSize: "1.5rem", color: "var(--ms-primary)" }}>+</div>
                        <div style={{ fontSize: "0.9rem", color: "var(--ms-primary)", fontWeight: 600 }}>직접 추가</div>
                    </div>
                </div>

                {/* Inline Add Form */}
                {isAddingCoupon && (
                    <div style={{ marginTop: "20px", padding: "16px", background: "var(--ms-bg-subtle)", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                         <div style={{ fontWeight: "bold" }}>새 쿠폰 만들기:</div>
                         <input 
                            type="text" 
                            placeholder="쿠폰 이름 (예: 숙제 면제권)" 
                            value={newCouponLabel}
                            onChange={(e) => setNewCouponLabel(e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--ms-border)", flex: 1 }}
                         />
                         <input 
                            type="text" 
                            placeholder="아이콘 (이모지)" 
                            value={newCouponIcon}
                            onChange={(e) => setNewCouponIcon(e.target.value)}
                            style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--ms-border)", width: "100px", textAlign: "center" }}
                         />
                         <div style={{ display: "flex", gap: "8px" }}>
                             <button className="btn btn-primary" onClick={handleAddCustomCoupon} style={{ padding: "8px 16px" }}>추가</button>
                             <button className="btn btn-secondary" onClick={() => setIsAddingCoupon(false)} style={{ padding: "8px 16px" }}>취소</button>
                         </div>
                    </div>
                )}
            </div>
        )}

        {/* 3. Student Selection Grid */}
        {currentClass && (
            // ... (keep existing code)
            <div>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "var(--ms-text)" }}>
                        👥 학생 선택 ({selectedStudentIds.size}명 선택됨)
                    </h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className="btn btn-secondary" onClick={toggleAll} style={{ fontSize: "0.85rem", padding: "8px 12px" }}>
                            {selectedStudentIds.size === students.length ? "전체 해제" : "전체 선택"}
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleIssueCoupon}
                            disabled={selectedStudentIds.size === 0 || isProcessing}
                            style={{ fontSize: "0.9rem", padding: "8px 20px" }}
                        >
                            {isProcessing ? "지급 중..." : "선택한 학생에게 지급하기"}
                        </button>
                    </div>
                 </div>

                 <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
                    gap: "12px" 
                 }}>
                    {students.map(student => {
                        const isSelected = selectedStudentIds.has(student.id);
                        return (
                            <div 
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                style={{ 
                                    cursor: "pointer",
                                    border: isSelected ? "2px solid var(--ms-primary)" : "1px solid var(--ms-border)", 
                                    borderRadius: "8px", 
                                    padding: "16px",
                                    background: isSelected ? "rgba(139, 92, 246, 0.05)" : "var(--ms-bg)",
                                    textAlign: "center",
                                    position: "relative"
                                }}
                            >
                                <div style={{ fontSize: "0.9rem", color: "var(--ms-text-muted)", marginBottom: "4px" }}>
                                    {student.studentNumber}번
                                </div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                                    {student.name}
                                </div>
                                {isSelected && (
                                    <div style={{ position: "absolute", top: "8px", right: "8px", color: "var(--ms-primary)" }}>
                                        <i className="fa-solid fa-check-circle"></i>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {students.length === 0 && (
                        <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "var(--ms-text-muted)", background: "var(--ms-bg)", borderRadius: "8px" }}>
                            등록된 학생이 없습니다.
                        </div>
                    )}
                 </div>
            </div>
        )}

      </DashboardCard>
    </DashboardLayout>
  );
}
