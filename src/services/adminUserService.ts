import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    orderBy, 
    query 
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/constants";
import { resetPassword } from "./authService";
import type { UserProfile } from "../types/schema";

/**
 * Admin Service: User Management
 */

// 1. Get All Users
export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const q = query(
            collection(db, COLLECTIONS.USERS),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

// 2. Toggle User Active Status
export const toggleUserActive = async (uid: string, isActive: boolean) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        await updateDoc(userRef, {
            isActive: isActive,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        throw error;
    }
};

// 3. Send Password Reset Email (Wrapper)
export const sendPasswordResetToUser = async (email: string) => {
    // Re-use existing authService function which is safe
    await resetPassword(email);
};
