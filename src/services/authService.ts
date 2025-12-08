import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  type UserCredential,
  type User
} from "firebase/auth";
import { auth } from "../firebase";

// === Auth Service ===

/**
 * Sign Up with Email and Password
 */
export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

/**
 * Sign In with Email and Password
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Sign Out
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Send Password Reset Email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Sign In Anonymously (Guest Login)
 */
export const loginAnonymously = async (): Promise<UserCredential> => {
  try {
    return await signInAnonymously(auth);
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

/**
 * Observe Client Auth State
 * @param callback function to run on state change
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
