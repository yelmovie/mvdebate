import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs,
    orderBy,
    limit,
    Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/constants";
import type { DebateSession, DebateLog, DebateReport } from "../types/schema";

/**
 * Start a new Debate Session
 */
export const startDebateSession = async (
    studentId: string, 
    studentName: string,
    topicId: number,
    topicTitle: string,
    mode: "random" | "manual" | "custom"
): Promise<string> => {
    try {
        const sessionData: Omit<DebateSession, "id"> = {
            studentId,
            studentName,
            topicId,
            topicTitle,
            mode,
            status: "ongoing",
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), sessionData); 
        // Note: Using COLLECTIONS.ROOMS as generic 'sessions' or create new const
        return docRef.id;
    } catch (error) {
        console.error("Error starting debate session:", error);
        throw error;
    }
};

/**
 * Record a Debate Log (Turn)
 */
export const saveDebateLog = async (log: Omit<DebateLog, "id" | "createdAt">) => {
    try {
        // DebateLogs collection (root level or subcollection?)
        // Requirement implies root or linked by sessionId. 
        // Let's use root 'debateLogs' for easier global querying or specific 'logs' collection
        await addDoc(collection(db, COLLECTIONS.LOGS), { 
            ...log,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving debate log:", error);
        throw error;
    }
};

/**
 * Save Debate Report
 */
export const saveDebateReport = async (report: Omit<DebateReport, "id" | "createdAt">) => {
    try {
        await addDoc(collection(db, COLLECTIONS.REPORTS), {
            ...report,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving debate report:", error);
        throw error;
    }
};
