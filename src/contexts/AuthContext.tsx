"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  signOut 
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TeacherProfile, StudentProfile, UserProfile } from "../types/schema";
import { isTrialActive } from "../config/trialConfig";

export type UserRole = "student" | "teacher" | null;

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Teacher Auth
  user: User | null;
  teacherProfile: TeacherProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuestTeacher: () => Promise<void>;
  
  // Student Session
  studentProfile: StudentProfile | null;
  loginStudent: (profile: StudentProfile) => void;

  // Common
  logout: () => Promise<void>;
  isTrialMode: boolean;
  getTeacherDisplayName: () => string;
  
  profile: TeacherProfile | StudentProfile | UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
  user: null,
  teacherProfile: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAsGuestTeacher: async () => {},
  studentProfile: null,
  loginStudent: () => {},
  logout: async () => {},
  isTrialMode: false,
  getTeacherDisplayName: () => "",
  profile: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [user, setUser] = useState<User | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived profile
  const profile = userRole === 'student' ? studentProfile : teacherProfile;

  // ... (rest of implementation)
  
  const isTrialMode = isTrialActive();

  // 1. Initialize Role & Student Session from Storage
  useEffect(() => {
    // Role
    const storedRole = localStorage.getItem("moviesam_userRole") as UserRole;
    if (storedRole) setUserRoleState(storedRole);

    // Student Session
    const storedStudent = sessionStorage.getItem("ms-student-session");
    if (storedStudent) {
      try {
        setStudentProfile(JSON.parse(storedStudent));
      } catch(e) { console.error(e); }
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem("moviesam_userRole", role);
    } else {
      localStorage.removeItem("moviesam_userRole");
    }
  };

  // 2. Monitor Firebase Auth (Teacher)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // If logged in as teacher, enforce role = teacher
        // (unless this is a fresh load and we might want to respect some explicit override, 
        // but generally auth presence means teacher mode)
        // User Ref 2-2: "If teacher auth success -> userRole = teacher"
        setUserRole("teacher");
        
        try {
          await ensureTeacherProfile(firebaseUser);
        } catch (e) {
          console.warn("Teacher profile sync failed:", e);
        }
      } else {
        setUser(null);
        setTeacherProfile(null);
        // Do NOT auto-set role to null here, because user might be in Student Mode
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ensureTeacherProfile = async (firebaseUser: User) => {
    const ref = doc(db, "teachers", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setTeacherProfile(snap.data() as TeacherProfile);
    } else {
      const isAnonymous = firebaseUser.isAnonymous;
      const newTeacher: TeacherProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || (isAnonymous ? "guest-teacher@trial.mode" : ""),
        name: firebaseUser.displayName || (isAnonymous ? "체험용 선생님" : "선생님"),
        photoURL: firebaseUser.photoURL || undefined,
        role: "teacher", 
        classCodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(ref, newTeacher);
      setTeacherProfile(newTeacher);
    }
  };

  const getTeacherDisplayName = () => {
    if (!user) return "";
    if (teacherProfile?.name && teacherProfile.name !== "선생님" && teacherProfile.name !== "체험용 선생님") return teacherProfile.name;
    if (user.displayName) return user.displayName;
    if (user.isAnonymous) return "체험용 선생님";
    return "선생님";
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Clear Student Session before Teacher Login to be safe
      setStudentProfile(null);
      sessionStorage.removeItem("ms-student-session");
      
      await signInWithPopup(auth, provider);
      // userRole will be set to 'teacher' in onAuthStateChanged
    } catch (error) {
      console.error("Login failed", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const loginAsGuestTeacher = async () => {
    if (!isTrialMode) {
      alert("체험 기간이 종료되었습니다.");
      return;
    }
    // Clear Student
    setStudentProfile(null);
    sessionStorage.removeItem("ms-student-session");
    
    try {
      await signInAnonymously(auth);
    } catch (error) {
       console.error(error);
       alert("체험하기 로그인 오류");
    }
  };

  const loginStudent = (profile: StudentProfile) => {
    // 1. Set Role
    setUserRole("student");
    // 2. Set Profile
    setStudentProfile(profile);
    sessionStorage.setItem("ms-student-session", JSON.stringify(profile));
    
    // 3. Ensure Teacher is Signed Out (Exclusive)
    if (auth.currentUser) {
       signOut(auth).catch(console.error);
       setUser(null);
       setTeacherProfile(null);
    }
  };

  const logout = async () => {
    // Clear Role
    setUserRole(null);
    
    // Clear Teacher
    if (auth.currentUser) await signOut(auth);
    setUser(null);
    setTeacherProfile(null);

    // Clear Student
    setStudentProfile(null);
    sessionStorage.removeItem("ms-student-session");
  };

  return (
    <AuthContext.Provider value={{ 
      userRole,
      setUserRole,
      user, 
      teacherProfile, 
      loading, 
      loginWithGoogle, 
      loginAsGuestTeacher, 
      logout,
      isTrialMode,
      getTeacherDisplayName,
      studentProfile,
      loginStudent,
      profile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
