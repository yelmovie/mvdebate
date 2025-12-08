// src/types/classroom.ts
// 교실 중심 데이터 구조 정의 (반 단위 설계)

// ============================================
// 1. Teacher (교사)
// ============================================
// Firestore Path: teachers/{teacherId}
export interface Teacher {
  teacherId: string; // Firebase Auth UID
  name: string;
  email: string;
  schoolName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 2. Class (반)
// ============================================
// Firestore Path: classes/{classId}
export interface Class {
  classId: string; // 고유 ID (예: "A1234" 또는 UUID)
  teacherId: string; // 어느 교사의 반인지
  className: string; // 반 이름 (예: "5-1", "5-2")
  schoolYear: number; // 학년도 (예: 2024)
  schoolName?: string;
  grade?: number; // 학년
  classNumber?: number; // 반 번호
  maxStudents?: number; // 최대 인원 (기본 30)
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 3. Student (학생)
// ============================================
// Firestore Path: students/{studentId}
export interface Student {
  studentId: string; // Format: "{classId}-{studentNumber}" (예: "A1234-15")
  classId: string; // 어느 반 소속인지
  studentNumber: number; // 번호 (1-30)
  name: string;
  
  // 게이미피케이션
  level: number;
  totalScore: number;
  badges: string[]; // 뱃지 ID 리스트
  
  // 쿠폰은 별도 컬렉션으로 관리 (students/{studentId}/coupons)
  
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 4. DebateSession (토론 회차)
// ============================================
// Firestore Path: sessions/{sessionId}
export interface DebateSession {
  sessionId: string;
  classId: string; // 어느 반의 토론인지
  topicTitle: string; // 토론 주제
  topicDescription?: string; // 주제 배경 정보/한 줄 요약
  difficulty: 1 | 2 | 3; // 난이도
  date: string; // 날짜 (YYYY-MM-DD)
  sessionNumber: number; // 오늘 몇 번째 토론인지 (1, 2, 3...)
  isActive: boolean; // 현재 진행 중인지
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 5. Announcement (공지사항)
// ============================================
// Firestore Path: announcements/{announcementId}
export interface Announcement {
  announcementId: string;
  classId: string; // 어느 반의 공지인지
  title: string;
  body: string; // 내용
  isPinned: boolean; // 상단 고정 여부
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
}

// ============================================
// 6. Coupon (쿠폰)
// ============================================
// Firestore Path: coupons/{couponId}
export interface Coupon {
  couponId: string;
  classId: string; // 어느 반의 쿠폰인지
  studentId: string | null; // 개인 쿠폰이면 studentId, 공용이면 null
  type: CouponType;
  label: string; // 표시 이름 (예: "발언 패스권", "추가 발언권", "과제 면제")
  icon?: string; // 아이콘 (이모지 또는 아이콘 이름)
  status: "unused" | "used"; // 사용 전 / 사용됨
  issuedAt: string; // 발급 시각
  usedAt?: string; // 사용 시각
  issuedBy: "teacher" | "system"; // 누가 발급했는지
}

export type CouponType = 
  | "SPEAK_PASS" // 발언 패스권
  | "EXTRA_SPEAK" // 추가 발언권
  | "HOMEWORK_EXEMPT" // 과제 면제
  | "HINT_PEEK" // 힌트 보기
  | "TOPIC_VETO" // 주제 거부권
  | "TIME_EXTENSION" // 시간 연장
  | "CUSTOM"; // 커스텀 쿠폰

// ============================================
// 7. StudentReport (학생 리포트)
// ============================================
// Firestore Path: reports/{reportId}
export interface StudentReport {
  reportId: string;
  classId: string;
  studentId: string;
  sessionId: string; // 어느 토론 회차의 리포트인지
  
  // 발언 통계
  totalSpeeches: number; // 총 발언 횟수
  proSpeeches: number; // 찬성 발언 횟수
  conSpeeches: number; // 반대 발언 횟수
  proConRatio: number; // 찬성/반대 비율 (0.0 ~ 1.0)
  
  // AI 요약
  aiSummary: string; // AI가 생성한 요약
  strengths: string[]; // 잘한 점 리스트
  improvements: string[]; // 개선할 점 리스트
  
  // 교사 피드백
  teacherFeedback?: string; // 교사가 남긴 한 줄 피드백
  teacherMemo?: string; // 교사 메모 (상세)
  
  // 사용한 쿠폰 기록
  usedCoupons: string[]; // 사용한 couponId 리스트
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 8. LiveStatus (실시간 토론 현황)
// ============================================
// Firestore Path: liveStatus/{classId}_{sessionId}
// 또는: liveStatus/{liveStatusId} (classId와 sessionId를 필드로)
export interface LiveStatus {
  liveStatusId: string; // Format: "{classId}_{sessionId}"
  classId: string;
  sessionId: string;
  
  // 현재 상태
  currentParticipants: number; // 현재 토론 방에 들어와 있는 학생 수
  lastSpeechAt?: string; // 마지막 발언 시각
  lastSpeechBy?: string; // 마지막 발언한 studentId
  
  // 찬성/반대 비율
  proCount: number; // 찬성 인원 수
  conCount: number; // 반대 인원 수
  
  // 방 상태
  isRoomOpen: boolean; // 토론 방 열림/닫힘
  
  updatedAt: string;
}

// ============================================
// 9. DebateLog (발언 로그 - 상세)
// ============================================
// Firestore Path: debateLogs/{logId}
// 학생이 실제로 한 발언들을 기록
export interface DebateLog {
  logId: string;
  classId: string;
  studentId: string;
  sessionId: string;
  
  speechNumber: number; // 이 학생의 몇 번째 발언인지
  content: string; // 발언 내용
  stance: "pro" | "con"; // 찬성/반대
  label?: "claim" | "reason" | "evidence" | "counterargument" | "rebuttal" | "other";
  
  timestamp: string;
}

// ============================================
// 10. Helper Types (조회용)
// ============================================

// 교사 대시보드용 반 요약
export interface ClassSummary {
  classId: string;
  className: string;
  currentSession: DebateSession | null; // 오늘 토론 회차
  totalStudents: number; // 전체 인원
  presentStudents: number; // 참석 인원 수
  totalSpeeches: number; // 발언 총 횟수
  averageSpeeches: number; // 평균 발언 수
  usedCouponsCount: number; // 사용된 쿠폰 수
  lastUpdated: string;
}

// 학생 리스트 테이블용
export interface StudentTableRow {
  studentId: string;
  studentNumber: number;
  name: string;
  todaySpeeches: number; // 오늘 발언 횟수
  proConRatio: number; // 찬성/반대 비율
  hasUsedCoupon: boolean; // 쿠폰 사용 여부
  reportId?: string; // 리포트 ID (있으면)
  status: "low" | "normal" | "high"; // 발언 적음/정상/과다
}

// 학생 화면용 공지 요약
export interface AnnouncementSummary {
  announcementId: string;
  title: string;
  body: string;
  createdAt: string;
  isPinned: boolean;
}

// 학생 화면용 리포트 요약
export interface ReportSummary {
  reportId: string;
  sessionId: string;
  topicTitle: string;
  totalSpeeches: number;
  proConRatio: number;
  teacherFeedback?: string;
  createdAt: string;
}

