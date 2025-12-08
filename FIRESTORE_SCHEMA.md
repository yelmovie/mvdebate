# Firestore 데이터베이스 스키마 (Upstage 버전)

## 📌 확장된 컬렉션 구조

기존 컬렉션은 절대 변경하지 않고, 아래 컬렉션만 **추가**합니다.

---

## 1. debateLogs (학생 발언 로그)

**경로**: `debateLogs/{sessionId}/{logId}`

```typescript
{
  studentId: string;              // "classCode-studentNumber"
  text: string;                    // 발언 내용
  timestamp: Timestamp;            // 발언 시간
  aiScore: {                       // Upstage AI 평가 점수
    logic: number;                 // 0-100
    clarity: number;                // 0-100
    evidence: number;              // 0-100
    empathy: number;               // 0-100
    engagement: number;            // 0-100
    overall: number;               // 0-100 (평균)
  }
}
```

---

## 2. studentReports (학생 리포트)

**경로**: `studentReports/{studentId}/{sessionId}`

```typescript
{
  summary: string;                 // 전체 요약 (5문장)
  strengths: string[];             // 강점 3개
  improvements: string[];          // 개선점 3개
  score_trend_title: string;       // 점수 추이 제목
  score_trend_summary: string;      // 점수 추이 설명
  scoreHistory: number[];          // 점수 이력
  createdAt: Timestamp;
}
```

---

## 3. portfolios (학생 포트폴리오)

**경로**: `portfolios/{studentId}`

```typescript
{
  semesterStart: string;           // ISO date string
  semesterEnd: string | null;       // ISO date string
  overallSummary: string;          // 전체 요약
  growthTimeline: string[];        // 성장 타임라인 (3개)
  keywordCloud: string[];          // 키워드 5개
  badges: string[];                // 배지 목록
  level: "초급" | "중급" | "상급" | "마스터";
  updatedAt: Timestamp;
}
```

---

## 4. battleQueue (배틀 대기 큐)

**경로**: `battleQueue/{queueId}`

```typescript
{
  studentId: string;               // "classCode-studentNumber"
  nickname: string;                // 학생 이름
  classCode: string;               // 반 코드
  readyAt: Timestamp;              // 대기 시작 시간
}
```

---

## 5. battles (토론 배틀)

**경로**: `battles/{battleId}`

```typescript
{
  classCode: string;               // 반 코드
  participants: Array<{            // 참가자 2명
    studentId: string;
    nickname: string;
  }>;
  topic: string;                   // Upstage가 생성한 토론 주제
  round: number;                    // 현재 라운드
  logs: Array<{                    // 대화 기록
    studentId: string;
    nickname: string;
    text: string;
    timestamp: Timestamp;
    round: number;
  }>;
  winner: string | null;           // 승자 studentId
  status: "active" | "started" | "finished";
  createdAt: Timestamp;
  startedAt?: string;              // ISO date string
  finishedAt?: string;             // ISO date string
}
```

---

## 6. feedbacks (피드백 - 기존)

**경로**: `feedbacks/{feedbackId}`

```typescript
{
  uid: string | null;              // user.uid (교사만)
  role: "teacher" | "student";
  classCode: string | null;
  good: string;
  bad: string;
  needed: string;
  remove: string;
  nextSemester: "yes" | "no" | "unsure";
  createdAt: Timestamp;
}
```

---

## 📝 인덱스 필요 필드

Firestore Console에서 다음 인덱스를 생성하세요:

1. `debateLogs` 컬렉션:
   - `studentId` (Ascending) + `timestamp` (Descending)

2. `battleQueue` 컬렉션:
   - `classCode` (Ascending) + `readyAt` (Ascending)

3. `battles` 컬렉션:
   - `classCode` (Ascending) + `status` (Ascending)

---

## ⚠️ 중요 사항

- **기존 컬렉션 수정 금지**: `students`, `classes`, `teachers`, `notices` 등은 절대 변경하지 않습니다.
- **민감 정보 저장 금지**: 학생 이름, 번호, 반코드 외의 개인정보는 저장하지 않습니다.
- **자동 삭제**: 토론 로그는 7일 후 자동 삭제 (Cloud Functions 또는 스케줄러로 구현).
