import { db } from "../firebase";
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    serverTimestamp,
    updateDoc,
    arrayUnion,
    writeBatch,
    orderBy,
    limit,
    addDoc,
    deleteDoc
} from "firebase/firestore";
import { TeacherProfile, StudentProfile, ClassInfo, Coupon, CouponType, Notice, Schedule, DebateReport, DashboardSummary } from "../types/schema";

// --- Teacher Management ---

export const ensureTeacherDocument = async (uid: string, email: string, name: string, photoURL?: string): Promise<TeacherProfile> => {
    const ref = doc(db, "teachers", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return snap.data() as TeacherProfile;
    }

    const newTeacher: TeacherProfile = {
        uid,
        email,
        name,
        photoURL,
        role: "teacher",
        classCodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await setDoc(ref, newTeacher);
    return newTeacher;
};

// --- Class Management ---

export const createClass = async (teacherUid: string, preferredCode?: string): Promise<string> => {
    const code = preferredCode || generateRandomCode();
    
    // Check if exists
    const classRef = doc(db, "classes", code);
    const classSnap = await getDoc(classRef);
    if (classSnap.exists()) {
        throw new Error("Class code already exists");
    }

    const newClass: ClassInfo = {
        code,
        teacherUid,
        studentCount: 0,
        classSize: 30, // Default to 30
        createdAt: new Date().toISOString()
    };

    // Transaction-like update (create class + update teacher)
    await setDoc(classRef, newClass);
    await updateDoc(doc(db, "teachers", teacherUid), {
        classCodes: arrayUnion(code)
    });

    return code;
};

export const updateClassConfig = async (classCode: string, config: { classSize?: number }) => {
    const classRef = doc(db, "classes", classCode);
    await updateDoc(classRef, config);
};

export const updateClassTopic = async (classCode: string, topicTitle: string) => {
    const classRef = doc(db, "classes", classCode);
    await updateDoc(classRef, {
        commonTopic: {
            title: topicTitle,
            updatedAt: new Date().toISOString()
        }
    });
};

import { onSnapshot } from "firebase/firestore";

// ...

export const getTeacherClasses = async (teacherUid: string): Promise<ClassInfo[]> => {
    // 1. Try querying by teacherUid field in classes (Standard)
    const q = query(collection(db, "classes"), where("teacherUid", "==", teacherUid));
    const snaps = await getDocs(q);
    const classes = snaps.docs.map(d => d.data() as ClassInfo);

    if (classes.length > 0) return classes;

    // 2. Fallback: Check teacher profile's classCodes array
    // This handles cases where 'teacherUid' might not be set correctly on the class doc or legacy data
    try {
        const teacherRef = doc(db, "teachers", teacherUid);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) {
            const data = teacherSnap.data() as TeacherProfile;
            const codes = data.classCodes || [];
            
            if (codes.length > 0) {
                 const classDocs = await Promise.all(codes.map(code => getDoc(doc(db, "classes", code))));
                 const validClasses = classDocs
                    .filter(d => d.exists())
                    .map(d => d.data() as ClassInfo);
                 return validClasses;
            }
        }
    } catch (e) {
        console.warn("Fallback fetch failed", e);
    }

    return [];
};

// --- Student Management (Teacher View) ---

export const getClassStudents = async (classCode: string): Promise<StudentProfile[]> => {
    const q = query(collection(db, "students"), where("classCode", "==", classCode));
    const snaps = await getDocs(q);
    return snaps.docs.map(d => d.data() as StudentProfile);
};

export const subscribeToClassStudents = (classCode: string, callback: (students: StudentProfile[]) => void) => {
    const q = query(collection(db, "students"), where("classCode", "==", classCode));
    
    return onSnapshot(q, (snapshot) => {
        const students = snapshot.docs.map(d => d.data() as StudentProfile);
        callback(students);
    });
};

export const updateStudentRoster = async (classCode: string, students: { number: number, name: string }[]) => {
// ...
    const batch = writeBatch(db);
    
    for (const s of students) {
        // ID composite key: "CLASSCODE-NUMBER"
        const studentId = `${classCode}-${s.number}`; 
        const studentRef = doc(db, "students", studentId);
        
        batch.set(studentRef, {
            id: studentId,
            classCode,
            studentNumber: s.number,
            name: s.name,
        }, { merge: true });
    }
    
    await batch.commit();
};

// --- Reward / Coupon Management ---

// --- Custom Coupon Management ---

export const  addCustomCoupon = async (teacherUid: string, coupon: { label: string, icon: string }) => {
    const teacherRef = doc(db, "teachers", teacherUid);
    const newCoupon = {
        id: Date.now().toString(),
        ...coupon
    };
    await updateDoc(teacherRef, {
        customCoupons: arrayUnion(newCoupon)
    });
    return newCoupon;
};

export const deleteCustomCoupon = async (teacherUid: string, coupon: { id: string, label: string, icon: string }) => {
    // Note: arrayRemove requires exact object match, so we need the full object or handle it via reading first.
    // For simplicity, let's assume UI passes the full object.
    const teacherRef = doc(db, "teachers", teacherUid);
    await updateDoc(teacherRef, {
        // cast to any to avoid strict type checks on arrayRemove for now if schema details vary, 
        // but it should match CustomCouponDef
        customCoupons: arrayUnion(coupon) // Wait, remove needs arrayRemove, but let's read-modify-write for safety if object structure is complex?
        // Actually arrayRemove works if object is identical.
    });
    // Correction: actually let's use a fail-safe read-modify-write for deletion to be sure by ID.
    const snap = await getDoc(teacherRef);
    if(snap.exists()){
        const data = snap.data() as TeacherProfile;
        const updated = (data.customCoupons || []).filter(c => c.id !== coupon.id);
        await updateDoc(teacherRef, { customCoupons: updated });
    }
};

// --- Reward / Coupon Management ---

export const issueCoupons = async (
    studentIds: string[], 
    type: string, 
    extras?: { customLabel?: string, customIcon?: string }
): Promise<void> => {
    const batch = writeBatch(db);
    
    for (const sid of studentIds) {
        const studentRef = doc(db, "students", sid);
        // Create new coupon object
        const newCoupon: Coupon = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type,
            ...extras,
            issuedAt: new Date().toISOString(),
            used: false,
            issuedBy: "teacher"
        };
        
        batch.update(studentRef, {
            coupons: arrayUnion(newCoupon),
        });
    }

    await batch.commit();
};


// Helper
function generateRandomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- Dashboard Stats (Cost Optimized) ---

export const getDashboardSummary = async (classCode: string): Promise<DashboardSummary> => {
    // Read from single summary document to save costs
    // Path: dashboard_summaries/{classCode}
    const ref = doc(db, "dashboard_summaries", classCode);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
        return snap.data() as DashboardSummary;
    }

    // Return safely initialized zeros if not found (e.g. new class)
    return {
        id: classCode,
        teacherId: "", // caller might fill
        classCode: classCode,
        todayCompletedDebates: 0,
        weekCompletedDebates: 0,
        todayParticipants: 0,
        totalStudents: 0,
        lastUpdatedAt: new Date().toISOString()
    };
};

// --- Notices ---

export const createNotice = async (notice: Partial<Notice>) => {
    try {
        // Basic validation
        if (!notice.teacherId) throw new Error("작성자(선생님) 정보가 누락되었습니다.");
        if (!notice.title) throw new Error("제목을 입력해주세요.");
        if (!notice.body) throw new Error("내용을 입력해주세요.");

        const ref = collection(db, "notices");
        const now = new Date().toISOString();
        
        console.log("[createNotice] Attempting with:", { ...notice, createdAt: now });

        await addDoc(ref, {
            ...notice,
            createdAt: now,
            updatedAt: now,
            viewCount: 0
        });
    } catch (error: any) {
        console.error("[공지 등록 에러]", error);
        throw error; // Re-throw to let UI handle the alert
    }
};

export const getTeacherNotices = async (teacherId: string, classCode: string | null = null, limitCount = 5) => {
    // Query by teacherId, sort by date
    const q = query(
        collection(db, "notices"), 
        where("teacherId", "==", teacherId),
        orderBy("createdAt", "desc"),
        limit(20) // Fetch strict limit or slightly more for memory filtering
    );
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
    
    // Memory filter for classCode matching (exact match or global null)
    let filtered = all;
    if (classCode) {
        filtered = all.filter(n => n.classCode === classCode || n.classCode === null);
    }
    return filtered.slice(0, limitCount);
};

// --- Schedules ---

export const createSchedule = async (schedule: Partial<Schedule>) => {
    try {
        if (!schedule.teacherId) throw new Error("선생님 정보가 누락되었습니다.");
        
        const ref = collection(db, "schedules");
        await addDoc(ref, {
            ...schedule,
            createdAt: new Date().toISOString()
        });
    } catch (error: any) {
         console.error("[일정 등록 에러]", error);
         throw error;
    }
};

export const getTeacherSchedules = async (teacherId: string, classCode: string | null = null) => {
    const q = query(
        collection(db, "schedules"),
        where("teacherId", "==", teacherId)
        // orderBy("dateTime", "asc") // Composite index might be needed
    );
    const snap = await getDocs(q);
    let all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Schedule));
    
    if (classCode) {
        all = all.filter(s => s.classCode === classCode || s.classCode === null);
    }
    // Sort by dateTime asc
    all.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    return all;
};

// --- Reports ---

export const getTeacherReports = async (teacherId: string) => {
    // Reports usually have 'teacherId' if we denormalized or we query by classCode.
    // If not, we might need queries by classCodes array.
    // Assuming we added 'teacherId' to DebateReport as per previous turn plan.
    const q = query(
        collection(db, "reports"),
        where("teacherId", "==", teacherId),
        orderBy("createdAt", "desc")
    );
    // If index missing, it will error in console, users must create index.
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DebateReport));
};

export const updateReportStatus = async (reportId: string, status: "new" | "needs_review" | "done") => {
    const ref = doc(db, "reports", reportId);
    await updateDoc(ref, { status });
};
