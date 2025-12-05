/**
 * 도메인 타입 정의 (One Source of Truth)
 */

export type UserRole = "student" | "teacher";

export interface User {
  id: string;
  nickname: string;
  grade?: number;
  className?: string;
  role: UserRole;
}

export interface Topic {
  id: string; // Changed from number to string for custom topics
  title: string;
  category: string;
  difficulty: number;
  tags: string[];
}

export type DebateLabel =
  | "claim"
  | "reason"
  | "evidence"
  | "counterargument"
  | "rebuttal"
  | "other";

export interface DebateSession {
  id: string;
  userId: string;
  topicId: string;
  stance: "pro" | "con";
  difficulty: "low" | "mid" | "high";
  createdAt: string;
  finishedAt?: string;
  summary?: string;
  personaId?: string; // Added for Persona feature
  aiStance?: "pro" | "con"; // AI 입장 (학생과 반대)
}

/** 루브릭 점수 한 칸 */
export interface RubricScore {
  rubricId: string;   // 예: "basicDebate"
  itemId: string;     // 예: "structure"
  levelIndex: number; // 0,1,2...
}

export interface DebateTurn {
  id: string;
  sessionId: string;
  sender: "student" | "ai";
  text: string;
  label: DebateLabel;
  timestamp: string;
}

/** 교사용 대시보드에서 사용하는 요약용 레코드 */
export interface DebateSessionReport {
  id: string;
  nickname: string;
  topicTitle: string;
  stance: "pro" | "con";
  createdAt: string;
  claim?: string;
  reasonsCount: number;
  evidencesCount: number;
  reasons?: string[];     // ★ 추가: 실제 근거 문장들
  evidences?: string[];   // ★ 추가: 실제 자료/예시 문장들
  rubricScores?: RubricScore[];
  turnCount?: number;     // ★ 추가: 총 턴 수
  grade?: string;
  classNumber?: string;
  reflection?: {
    myClaim: string;
    aiCounterpoint: string;
    improvement: string;
  };
}

/** 선생님 정보 (서버에서만 전체 정보 보관) */
export interface Teacher {
  id: string;          // 예: "t1"
  displayName: string; // 학생에게 보여줄 이름/별명 ("무비샘", "예리쌤")
  email: string;       // 실제 메일 주소 (학생에게는 절대 안 보임)
}

/** 공개용 선생님 정보 (학생 화면용, 이메일 제외) */
export interface PublicTeacher {
  id: string;
  displayName: string;
}

/** AI 토론 평가 결과 */
export interface AiEvaluation {
  clarity: number;    // 주장 명확성 1~5
  evidence: number;    // 근거 사용 1~5
  relevance: number;   // 주제 충실도 1~5
  comment: string;     // 총평
}

/** 학생 자기 평가 */
export interface StudentSelfEvaluation {
  clarity: number;
  logic: number;
  attitude: number;
}


export interface RubricItem {
  id: string;
  text: string;
  levels: string[];
}

export interface Rubric {
  id: string;
  title: string;
  items: RubricItem[];
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

