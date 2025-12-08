import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  collection, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, Coupon, CouponType } from "../types/schema";
import { USER_ROLES } from "../config/authConfig";
import type { User } from "firebase/auth";

// --- Auth & Profile Management ---

/**
 * Ensure User Document Exists on Login
 * - Creates new user with GUEST role if not exists
 * - Updates basic info if exists
 */
export const ensureUserDocument = async (firebaseUser: User): Promise<UserProfile> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    // Update photoURL if changed (e.g. Google profile updated)
    if (firebaseUser.photoURL && data.photoURL !== firebaseUser.photoURL) {
       await updateDoc(userRef, { photoURL: firebaseUser.photoURL, updatedAt: serverTimestamp() });
       data.photoURL = firebaseUser.photoURL;
    }
    return data;
  } else {
    // Create new user with GUEST role by default
    // Create new user with GUEST role by default
    const newUser: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "User",
      photoURL: firebaseUser.photoURL || undefined,
      role: USER_ROLES.GUEST, // Default role
      schoolName: "",
      level: 1,
      totalScore: 0,
      coupons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: firebaseUser.providerData[0]?.providerId || "unknown",
      classCodes: [] // Initialize classCodes empty
    };

    await setDoc(userRef, newUser);
    return newUser;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const saveUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
  }, { merge: true });
};

// --- Teacher & Class Management ---

export const findTeacherByClassCode = async (classCode: string): Promise<UserProfile | null> => {
  const q = query(
    collection(db, "users"),
    where("role", "==", USER_ROLES.TEACHER),
    where("classCode", "==", classCode)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as UserProfile;
  }
  return null;
};

export const checkClassCodeExists = async (classCode: string): Promise<boolean> => {
    const teacher = await findTeacherByClassCode(classCode);
    return !!teacher;
};

export const getStudentsByClassCode = async (classCode: string): Promise<UserProfile[]> => {
  const q = query(
    collection(db, "users"),
    where("role", "==", USER_ROLES.STUDENT),
    where("classCode", "==", classCode)
  );
  
  const querySnapshot = await getDocs(q);
  const students: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    students.push(doc.data() as UserProfile);
  });
  
  return students;
};

// --- Gamification & Coupon System ---

export const updateUserScore = async (uid: string, scoreDelta: number) => {
  const user = await getUserProfile(uid);
  if (!user) throw new Error("User not found");

  let { level = 1, totalScore = 0, coupons = [] } = user;
  
  let newScore = totalScore + scoreDelta;
  let earnedCoupons: Coupon[] = [];
  let newLevel = level;

  // Level up logic: Every 100 points
  while (newScore >= 100) {
    newScore -= 100;
    newLevel += 1; // Level up
    
    // Issue a random coupon reward
    const couponTypes: CouponType[] = ["SEAT_SWAP", "HINT_PEEK", "TOPIC_VETO", "TIME_EXTENSION"];
    const randomType = couponTypes[Math.floor(Math.random() * couponTypes.length)];
    
    const newCoupon: Coupon = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: randomType,
      issuedAt: new Date().toISOString(),
      used: false,
      issuedBy: "system"
    };
    
    earnedCoupons.push(newCoupon);
    coupons.push(newCoupon);
  }

  await saveUserProfile(uid, {
    totalScore: newScore,
    level: newLevel,
    coupons: coupons
  });

  return { level: newLevel, coupons: earnedCoupons, totalScore: newScore };
};

export const issueCoupon = async (uid: string, type: CouponType, issuer: "teacher" | "system" = "teacher") => {
    const user = await getUserProfile(uid);
    if (!user) throw new Error("User not found");

    const newCoupon: Coupon = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        issuedAt: new Date().toISOString(),
        used: false,
        issuedBy: issuer
    };

    const coupons = [...(user.coupons || []), newCoupon];
    await saveUserProfile(uid, { coupons });
    return newCoupon;
};

export const useCoupon = async (uid: string, couponId: string) => {
    const user = await getUserProfile(uid);
    if (!user) throw new Error("User not found");

    const coupons = (user.coupons || []).map(c => {
        if (c.id === couponId && !c.used) {
            return { ...c, used: true, usedAt: new Date().toISOString() };
        }
        return c;
    });

    await saveUserProfile(uid, { coupons });
};

export const getCouponName = (type: CouponType): string => {
    const names: Record<CouponType, string> = {
        "SEAT_SWAP": "자리 바꾸기 쿠폰",
        "HINT_PEEK": "힌트 미리보기 쿠폰 (소형)",
        "TOPIC_VETO": "주제 거부권 (1회)",
        "TIME_EXTENSION": "발언 시간 연장 (1분)",
        "CUSTOM": "커스텀 쿠폰"
    };
    return names[type] || "알 수 없는 쿠폰";
};
