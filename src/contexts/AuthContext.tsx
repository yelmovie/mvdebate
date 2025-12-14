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
import { auth, db } from "../firebase"; // auth can be undefined if init failed
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
    // Student Session Recovery (sessionStorage)
    const storedStudent = sessionStorage.getItem("ms-student-session");
    if (storedStudent) {
      try {
        const parsed = JSON.parse(storedStudent);
        if (parsed && typeof parsed === 'object') {
           setStudentProfile(parsed);
           // If we have a student session, we should probably be in student mode unless overridden
           // But let's check localStorage role too.
        }
      } catch(e) { 
        console.error("Failed to parse student session", e);
        sessionStorage.removeItem("ms-student-session");
      }
    }

    // Role Recovery (localStorage)
    const storedRole = localStorage.getItem("moviesam_userRole") as UserRole;
    if (storedRole) {
       setUserRoleState(storedRole);
    } else {
       // Automatic Fallback: If student session exists but no role, set to student
       if (storedStudent) {
         setUserRoleState("student");
         localStorage.setItem("moviesam_userRole", "student");
       }
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
    if (!auth) {
      console.error("Firebase Auth not initialized found. Skipping auth listener.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Sync Logic: If authenticated as teacher, ensure role is teacher
        // Exception: If user specifically chose 'student' role in this session (e.g. testing), we might respect it?
        // But for safety, usually auth = teacher.
        const currentRole = localStorage.getItem("moviesam_userRole");
        if (currentRole !== "student") {
             setUserRole("teacher");
        }
        
        try {
          await ensureTeacherProfile(firebaseUser);
        } catch (e) {
          console.warn("Teacher profile sync failed:", e);
        }
      } else {
        setUser(null);
        setTeacherProfile(null);
        // If we were in teacher mode, clearing auth should probably clear teacher role
        // But if we are in student mode, stay in student mode.
        const currentRole = localStorage.getItem("moviesam_userRole");
        if (currentRole === "teacher") {
             setUserRole(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ensureTeacherProfile = async (firebaseUser: User) => {
    const ref = doc(db, "teachers", firebaseUser.uid);
    try {
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
    } catch (e) {
        console.error("ensureTeacherProfile error", e);
        // Fallback for offline or permission issues?
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
      setUserRole("teacher"); // Optimistic set
      
      if (!auth) throw new Error("Firebase Auth not initialized");
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Login failed", error);
      if (error?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`[도메인 미승인 오류]\n\n현재 주소(${domain})가 Firebase 콘솔에 등록되지 않았습니다.\nFirebase Console -> Authentication -> Settings -> Authorized domains에 추가해주세요.`);
      } else if (error?.code === 'auth/popup-closed-by-user') {
        alert("로그인 창이 닫혔습니다.");
      } else {
        alert("로그인에 실패했습니다. 관리자에게 문의하세요.\n" + (error.message || ""));
      }
      setUserRole(null); // Revert on failure
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
    setUserRole("teacher"); // Optimistic set
    
    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      await signInAnonymously(auth);
    } catch (error) {
       console.error(error);
       alert("체험하기 로그인 오류");
       setUserRole(null);
    }
  };

  const loginStudent = (profile: StudentProfile) => {
    // 1. Set Role
    setUserRole("student");
    // 2. Set Profile
    setStudentProfile(profile);
    sessionStorage.setItem("ms-student-session", JSON.stringify(profile));
    
    // 3. Ensure Teacher is Signed Out (Exclusive)
    if (auth && auth.currentUser) {
       signOut(auth).catch(console.error);
       setUser(null);
       setTeacherProfile(null);
    }
  };

  const logout = async () => {
    // 1. Clear Role
    setUserRole(null);
    localStorage.removeItem("moviesam_userRole");

    // 2. Clear Teacher
    if (auth && auth.currentUser) await signOut(auth);
    setUser(null);
    setTeacherProfile(null);

    // 3. Clear Student
    setStudentProfile(null);
    sessionStorage.removeItem("ms-student-session");
    
    // 4. Force reload to clear any in-memory states (optional but safer)
    // window.location.href = "/"; 
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
