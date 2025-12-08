// One Source of Truth for Data Model

// One Source of Truth for Data Model

export type UserRole = "teacher" | "student" | "admin" | "parent" | "guest";

// --- Teacher (Firebase Auth User) ---
// Note: This interface is effectively the base for the 'users' collection document
export interface CustomCouponDef {
    id: string; 
    label: string; 
    icon: string;
}

export interface TeacherProfile {
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  classCodes?: string[]; // List of class codes owned by this teacher (Optional for non-teachers)
  customCoupons?: CustomCouponDef[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends TeacherProfile {
    isActive?: boolean;
    grade?: number;
    classNumber?: number;
    classCode?: string; // Student's joined class or Teacher's primary class context
    studentNumber?: number; 
    
    // Gamification / Student fields
    level?: number;
    totalScore?: number;
    coupons?: Coupon[];
    provider?: string;
    
    // Legacy support or alternative naming
    displayName?: string; 
    schoolName?: string;
}

// --- Student (No Auth, Session-based) ---
// Firestore Path: students/{studentId}
export interface StudentProfile {
  id: string; // Format: "CLASSCODE-NUMBER" (e.g., "A1234-15")
  classCode: string;
  studentNumber: number; // 1-30
  name: string;
  
  level: number;
  points: number;
  coupons: Coupon[];
  
  reports: SimpleReport[]; // Summary of reports
  
  lastLogin: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  type: CouponType | string; // Allow custom types
  label?: string; // For custom coupons
  icon?: string; // For custom coupons
  issuedAt: string;
  used: boolean;
  issuedBy: "teacher" | "system";
  usedAt?: string;
}

export type CouponType = 
  | "SEAT_SWAP" 
  | "HINT_PEEK" 
  | "TOPIC_VETO" 
  | "TIME_EXTENSION"
  | "CUSTOM";

export interface SimpleReport {
  reportId: string;
  summary: string;
  createdAt: string;
}

// --- Class (Group) ---
// path: classes/{classCode}
export interface ClassInfo {
  code: string; // The 4-char code
  teacherUid: string;
  schoolName?: string;
  grade?: number;
  classNumber?: number;
  studentCount: number;
  classSize?: number; // Configured class size (e.g. 25)
  commonTopic?: {
    title: string;
    description?: string;
    updatedAt: string;
  };
  createdAt: string;
}

// --- Debate Data ---

export interface DebateSession {
  id: string;
  studentId: string;
  studentName: string;
  topicId: number;
  topicTitle: string;
  mode: "random" | "manual" | "custom";
  status: "ongoing" | "completed" | "abandoned";
  createdAt: string;
}

export interface DebateLog {
  id?: string;
  classCode: string;
  studentId: string; // Reference to StudentProfile.id
  topicTitle: string;
  
  // Scoring
  scoreClaim: number;
  scoreEvidence: number;
  scoreFocus: number;
  totalScore: number;
  
  transcriptSummary?: string;
  reportId?: string; // If report generated
  
  createdAt: string;
}

export interface DebateReport {
    id: string;
    studentId: string;
    classCode: string;
    teacherId: string; 
    title: string; 
    content: string; 
    topic: string;
    summary: string;
    scores: {
        claim: number;
        evidence: number;
        focus: number;
        total: number;
    };
    feedback: string;
    status: "new" | "needs_review" | "done"; 
    fileUrl?: string; 
    createdAt: string;
}

export interface Notice {
    id: string;
    teacherId: string;
    classCode: string | null; 
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
    viewCount?: number; 
}

export interface Schedule {
    id: string;
    teacherId: string;
    classCode: string | null;
    title: string;
    dateTime: string; // timestamp as string
    description?: string;
    createdAt: string;
}

// --- Dashboard & Cost Optimization ---

export interface DashboardSummary {
  id: string; // Typically "classCode"
  teacherId: string;
  classCode: string;
  
  todayCompletedDebates: number;
  weekCompletedDebates: number;
  todayParticipants: number;
  totalStudents: number;
  
  lastUpdatedAt: string;
}

export interface AiDailyUsage {
  id: string; // Format: "YYYY-MM-DD_classCode"
  date: string;
  classCode: string;
  sessionCount: number; // How many sessions started today
  messageCount: number; // Total messages/turns
  updatedAt: string;
}
