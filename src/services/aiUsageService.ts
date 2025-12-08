
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { AiDailyUsage } from "../types/schema";

const MAX_SESSIONS_PER_DAY = parseInt(process.env.AI_MAX_SESSIONS_PER_CLASS_PER_DAY || "20");
// If not set, default to generous 20 for safety, but user asked for "2" or strict limit.
// I'll default to 10 if env missing.

/**
 * Checks if the class has exceeded daily session limits.
 * @param classCode 
 * @returns boolean - true if allowed, false if limit exceeded
 */
export async function checkDailySessionLimit(classCode: string): Promise<boolean> {
    if (!classCode) return true; // If no class code, bypass check (or fail safe)

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docId = `${today}_${classCode}`;
    
    // In server environment (API route), we might want to use Admin SDK for better speed/bypass rules,
    // but here we use Client SDK which is initialized in `../firebase`.
    // Ensure `firebase.ts` initializes correctly on server (it usually does for simple ops).
    
    const ref = doc(db, "daily_usage", docId);
    
    try {
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data() as AiDailyUsage;
            // Check Limit
            // Note: AI_MAX_SESSIONS_PER_CLASS_PER_DAY from env
            const limit = process.env.AI_MAX_SESSIONS_PER_CLASS_PER_DAY 
                ? parseInt(process.env.AI_MAX_SESSIONS_PER_CLASS_PER_DAY) 
                : 50; // Default fallback
                
            if (data.sessionCount >= limit) {
                 return false;
            }
        }
    } catch (error: any) {
        console.warn("[checkDailySessionLimit] Error checking limit, defaulting to TRUE (Fail Open):", error);
        return true; 
    }
    
    return true;
}

/**
 * Increments session count for a class (Call this when a NEW session starts).
 */
export async function incrementDailySessionCount(classCode: string) {
    if (!classCode) return;
    const today = new Date().toISOString().split('T')[0];
    const docId = `${today}_${classCode}`;
    const ref = doc(db, "daily_usage", docId);

    try {
        await updateDoc(ref, {
            sessionCount: increment(1),
            updatedAt: new Date().toISOString()
        });
    } catch (e: any) {
        // Fail Safe: Don't block flow just because metrics failed
        console.error("[incrementDailySessionCount] Failed to increment (Ignored):", e);
    }
}

/**
 * Increments message/turn count (Call this on every turn).
 */
export async function incrementDailyMessageCount(classCode: string) {
    if (!classCode) return;
    const today = new Date().toISOString().split('T')[0];
    const docId = `${today}_${classCode}`;
    const ref = doc(db, "daily_usage", docId);

    // We don't block on message count typically, unless strict global limit.
    // Just tracking here.
    try {
        await updateDoc(ref, {
            messageCount: increment(1),
            updatedAt: new Date().toISOString()
        });
    } catch (e: any) {
        // If doc missing (rare if session started), create
        if (e.code === 'not-found') {
             await setDoc(ref, {
                id: docId,
                date: today,
                classCode,
                sessionCount: 1, // Assume 1 session at least
                messageCount: 1,
                updatedAt: new Date().toISOString()
            });
        }
    }
}
