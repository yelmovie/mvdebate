import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/constants";
import type { DebateReport } from "../types/schema";
import { updateStudentScore } from "./studentService";

/**
 * Save a debate report to Firestore and trigger gamification (score update)
 */
export const saveDebateReport = async (report: Omit<DebateReport, "id" | "createdAt">) => {
  try {
    const reportData = {
      ...report,
       createdAt: new Date().toISOString()
    };

    // 1. Save Report
    const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), reportData);
    
    // 2. Calculate Total Score (Sum of score metrics)
    const { scores } = report;
    const totalStars = scores.total || (scores.claim + scores.evidence + scores.focus);

    // 3. Update Student Score & Check Level Up (Now using studentService)
    // Note: Assuming report.studentId matches the format used in studentService (classCode-number)
    const gamificationResult = await updateStudentScore(report.studentId, totalStars);

    return { 
      reportId: docRef.id, 
      ...gamificationResult // level, coupons, totalScore
    };
  } catch (error) {
    console.error("Error saving debate report:", error);
    throw error;
  }
};

/**
 * Get debate reports for a specific student
 */
export const getStudentReports = async (studentId: string, limitCount: number = 20) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.REPORTS),
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DebateReport[];
  } catch (error) {
    console.error("Error fetching student reports:", error);
    throw error;
  }
};
