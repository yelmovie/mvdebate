import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy,
    limit 
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/constants";
import { getUserProfile } from "./userService";
import type { DebateLog, DebateReport, UserProfile } from "../types/schema";

/**
 * Service for Teacher Dashboard Analytics and Data Fetching
 */

/**
 * Get all students for a specific teacher (assuming class linking)
 * For MVP/Test, we might fetch all students or filter by Grade/Class if stored in UserProfile
 */
export const getMyStudents = async (grade?: number, classNumber?: number) => {
    try {
        let q = query(collection(db, COLLECTIONS.USERS), where("role", "==", "student"));
        
        if (grade) {
            q = query(q, where("grade", "==", grade));
        }
        if (classNumber) {
            q = query(q, where("classNumber", "==", classNumber));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

/**
 * Get Recent Debate Activity for a Student
 */
export const getStudentDebateHistory = async (studentId: string) => {
    try {
        // Query reports to get simplified history of completed debates
        const q = query(
            collection(db, COLLECTIONS.REPORTS), 
            where("studentId", "==", studentId),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DebateReport));
    } catch (error) {
        console.error("Error fetching student history:", error);
        throw error;
    }
};

/**
 * Advanced Query: Get Students with > N sessions in current month
 */
export const getActiveStudentsStats = async (minSessions: number = 3) => {
    // Note: Firestore aggregation is limited. 
    // We typically fetch recent reports and aggregate in client or use 'count' feature.
    // For this example, we'll fetch recent reports from this month.
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    try {
        const q = query(
            collection(db, COLLECTIONS.REPORTS),
            where("createdAt", ">=", firstDay)
        );
        
        const snapshot = await getDocs(q);
        const reports = snapshot.docs.map(d => d.data() as DebateReport);
        
        // Aggregate
        const studentCounts: Record<string, number> = {};
        reports.forEach(r => {
            studentCounts[r.studentId] = (studentCounts[r.studentId] || 0) + 1;
        });

        const activeStudentIds = Object.keys(studentCounts).filter(uid => studentCounts[uid] >= minSessions);
        
        // Fetch profiles for these ids (In real world, batch fetch or huge 'in' query)
        // For simple demo, we map async (careful with limits)
        if (activeStudentIds.length === 0) return [];
        
        // If list is small (e.g. < 30), we can use 'in' query
        const studentsQuery = query(
            collection(db, COLLECTIONS.USERS),
            where("uid", "in", activeStudentIds.slice(0, 10)) // Limit for safety
        );
        
        const studentDocs = await getDocs(studentsQuery);
        return studentDocs.docs.map(d => ({
            ...d.data() as UserProfile,
            sessionCount: studentCounts[d.data().uid]
        }));

    } catch (error) {
        console.error("Error getting active students:", error);
        return [];
    }
};
