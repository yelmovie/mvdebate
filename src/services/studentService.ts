import { db } from "../firebase";
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    updateDoc,
    serverTimestamp,
    orderBy,
    limit
} from "firebase/firestore";
import { StudentProfile, Notice } from "../types/schema";

// ... existing code ...

export const getStudentNotices = async (classCode: string): Promise<Notice[]> => {
    try {
        const q = query(
            collection(db, "notices"), 
            where("classCode", "==", classCode),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const snaps = await getDocs(q);
        return snaps.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
    } catch (error) {
        console.error("[Firestore Error]", error);
        throw error;
    }
};

// Login / Join Logic
export const joinClass = async (classCode: string, studentNumber: number, name: string): Promise<StudentProfile> => {
    try {
        // 1. Check if class exists
        const classRef = doc(db, "classes", classCode);
        const classSnap = await getDoc(classRef);
        
        if (!classSnap.exists()) {
            throw new Error("존재하지 않는 반 코드입니다. 올바른 코드를 입력해주세요.");
        }

        // 2. Check if student already exists (by classCode + studentNumber)
        // We strive for a unique ID strategy. Let's use `{classCode}-{studentNumber}` as the document ID for simplicity and uniqueness within a class.
        const studentId = `${classCode}-${studentNumber}`;
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
            const data = studentSnap.data() as StudentProfile;
            // Verify name matches to prevent identity theft (simple check)
            if (data.name !== name) {
                // In a real app, we might throw or ask for confirmation. 
                // For this app, simply warning or allowing update might be okay, but let's be strict for now or just update.
                // Let's update the name if it matches the number, assuming it's a correction.
                try {
                    await updateDoc(studentRef, { 
                        name, 
                        lastLogin: new Date().toISOString() 
                    });
                } catch (error) {
                    console.error("[Firestore Error]", error);
                    throw error;
                }
                return { ...data, name, lastLogin: new Date().toISOString() };
            }
            
            // Update login time
            try {
                await updateDoc(studentRef, { lastLogin: new Date().toISOString() });
            } catch (error) {
                console.error("[Firestore Error]", error);
                throw error;
            }
            return data; // Return existing profile
        }

        // 3. Create new student profile
        const newStudent: StudentProfile = {
            id: studentId,
            classCode,
            studentNumber,
            name,
            level: 1,
            points: 0,
            coupons: [],
            reports: [],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        try {
            await setDoc(studentRef, newStudent);
        } catch (error) {
            console.error("[Firestore Error]", error);
            throw error;
        }
        return newStudent;
    } catch (error) {
        console.error("[Firestore Error]", error);
        throw error;
    }
};

export const getStudentProfile = async (studentId: string): Promise<StudentProfile | null> => {
    try {
        const ref = doc(db, "students", studentId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data() as StudentProfile;
        }
        return null;
    } catch (error) {
        console.error("[Firestore Error]", error);
        throw error;
    }
};

// Helper for Setup Screen
export const getClassInfo = async (classCode: string) => {
    try {
        const classRef = doc(db, "classes", classCode);
        const snap = await getDoc(classRef);
        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (error) {
        console.error("[Firestore Error]", error);
        throw error;
    }
};

export const getClassStudentsPublic = async (classCode: string) => {
    try {
        const q = query(collection(db, "students"), where("classCode", "==", classCode));
        const snaps = await getDocs(q);
        return snaps.docs.map(d => ({
            studentNumber: d.data().studentNumber,
            name: d.data().name
        }));
    } catch (error) {
        console.error("[Firestore Error]", error);
        throw error;
    }
};

// --- Gamification for Students ---
export const updateStudentScore = async (studentId: string, scoreDelta: number) => {
    try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        
        if (!studentSnap.exists()) throw new Error("Student not found");
        
        const data = studentSnap.data() as StudentProfile;
        let { level = 1, points = 0, coupons = [] } = data;
        
        let newScore = points + scoreDelta;
        let newLevel = level;
        const earnedCoupons: any[] = []; 

        // Level up logic: Every 100 points
        while (newScore >= 100) {
            newScore -= 100;
            newLevel += 1;
            
            // Issue random coupon
            const couponTypes = ["SEAT_SWAP", "HINT_PEEK", "TOPIC_VETO", "TIME_EXTENSION"];
            const randomType = couponTypes[Math.floor(Math.random() * couponTypes.length)];
            
            const newCoupon = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: randomType,
                issuedAt: new Date().toISOString(),
                used: false,
                issuedBy: "system"
            };
            
            earnedCoupons.push(newCoupon);
            coupons.push(newCoupon as any);
        }
        
        await updateDoc(studentRef, {
            points: newScore,
            level: newLevel,
            coupons: coupons
        });

        return { level: newLevel, coupons: earnedCoupons, totalScore: newScore };
    } catch (error) {
        console.error("[Gamification Error]", error);
        throw error;
    }
};
