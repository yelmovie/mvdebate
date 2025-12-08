# 교사 대시보드 컴포넌트 구조 설계

## 📋 개요

교사 대시보드 페이지의 컴포넌트 구조와 역할을 정의합니다.

---

## 🎯 페이지 구조

### 메인 페이지: `src/app/teacher/dashboard/page.tsx`

```
TeacherDashboardPage
├── ClassSelector (상단)
├── SessionSelector (상단)
├── DateDisplay (상단)
└── MainContent
    ├── LeftColumn
    │   ├── ClassSummaryCard
    │   └── LiveDebatePanel
    ├── RightColumn
    │   └── TeacherControlPanel
    │       ├── AnnouncementTab
    │       ├── TopicTab
    │       └── CouponTab
    └── BottomSection
        └── StudentTable
            └── StudentReportDrawer (슬라이드 패널)
```

---

## 🧩 컴포넌트 상세

### 1. `ClassSelector`
**위치:** `src/components/teacher/ClassSelector.tsx`

**역할:**
- 교사가 담당한 반 목록을 드롭다운으로 표시
- 반 선택 시 전체 대시보드가 해당 `classId` 기준으로 리셋

**Props:**
```typescript
interface ClassSelectorProps {
  classes: Class[]; // 교사가 담당한 반 목록
  currentClassId: string | null;
  onClassChange: (classId: string) => void;
}
```

**기능:**
- 드롭다운에서 반 선택
- 선택된 반 하이라이트

---

### 2. `SessionSelector`
**위치:** `src/components/teacher/SessionSelector.tsx`

**역할:**
- 현재 선택된 반의 오늘 토론 회차 목록 표시
- 회차 선택 시 해당 `sessionId` 기준으로 데이터 필터링

**Props:**
```typescript
interface SessionSelectorProps {
  classId: string;
  sessions: DebateSession[];
  currentSessionId: string | null;
  onSessionChange: (sessionId: string) => void;
}
```

**기능:**
- 드롭다운에서 회차 선택
- "새 회차 만들기" 버튼 (선택사항)

---

### 3. `ClassSummaryCard`
**위치:** `src/components/teacher/ClassSummaryCard.tsx`

**역할:**
- 반 요약 정보를 카드 형태로 표시

**Props:**
```typescript
interface ClassSummaryCardProps {
  summary: ClassSummary;
  loading?: boolean;
}
```

**표시 내용:**
- 오늘 토론 회차
- 참석 인원 수 / 전체 인원
- 발언 총 횟수
- 평균 발언 수
- 사용된 쿠폰 수

**스타일:**
- Tailwind 유틸리티 클래스 사용
- 카드 형태 (glassmorphism)

---

### 4. `LiveDebatePanel`
**위치:** `src/components/teacher/LiveDebatePanel.tsx`

**역할:**
- 실시간 토론 현황 표시
- "토론 방 열기/닫기" 버튼

**Props:**
```typescript
interface LiveDebatePanelProps {
  classId: string;
  sessionId: string | null;
  liveStatus: LiveStatus | null;
  onToggleRoom: (isOpen: boolean) => void;
  loading?: boolean;
}
```

**표시 내용:**
- 현재 토론 방에 들어와 있는 학생 수
- 마지막 발언 시각
- 찬성/반대 인원 비율 (시각화)
- "토론 방 열기/닫기" 토글 버튼

**실시간 업데이트:**
- Firestore `onSnapshot` 사용하여 실시간 구독

---

### 5. `TeacherControlPanel`
**위치:** `src/components/teacher/TeacherControlPanel.tsx`

**역할:**
- 공지사항, 토론 주제, 쿠폰 설정을 탭으로 관리

**Props:**
```typescript
interface TeacherControlPanelProps {
  classId: string;
  currentSession: DebateSession | null;
}
```

**내부 탭:**
1. **AnnouncementTab** - 공지사항 작성
2. **TopicTab** - 공통 토론 주제 선택/수정
3. **CouponTab** - 일괄 쿠폰 발급

---

### 6. `AnnouncementTab`
**위치:** `src/components/teacher/AnnouncementTab.tsx`

**역할:**
- 공지사항 작성 폼
- 최근 공지사항 목록 (3개)

**Props:**
```typescript
interface AnnouncementTabProps {
  classId: string;
  onSave: (announcement: Omit<Announcement, 'announcementId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}
```

**기능:**
- 제목, 내용 입력
- 상단 고정 체크박스
- 저장 버튼 → Firestore에 저장 → 학생 화면에 즉시 반영

---

### 7. `TopicTab`
**위치:** `src/components/teacher/TopicTab.tsx`

**역할:**
- 공통 토론 주제 선택/수정

**Props:**
```typescript
interface TopicTabProps {
  classId: string;
  currentSession: DebateSession | null;
  onTopicChange: (topicTitle: string, topicDescription?: string) => Promise<void>;
}
```

**기능:**
- 주제 입력 필드
- 배경 정보/한 줄 요약 입력
- 저장 버튼 → `sessions/{sessionId}` 업데이트 또는 새 세션 생성

---

### 8. `CouponTab`
**위치:** `src/components/teacher/CouponTab.tsx`

**역할:**
- 일괄 쿠폰 발급

**Props:**
```typescript
interface CouponTabProps {
  classId: string;
  students: Student[];
  onIssueCoupons: (coupons: Omit<Coupon, 'couponId' | 'issuedAt'>[]) => Promise<void>;
}
```

**기능:**
- 쿠폰 타입 선택
- 발급 대상 선택 (전원 / 특정 학생)
- 발급 버튼 → Firestore `coupons` 컬렉션에 일괄 생성

---

### 9. `StudentTable`
**위치:** `src/components/teacher/StudentTable.tsx`

**역할:**
- 학생 리스트 테이블 표시
- 필터링 기능
- 학생 클릭 시 리포트 상세 패널 열기

**Props:**
```typescript
interface StudentTableProps {
  classId: string;
  sessionId: string | null;
  students: StudentTableRow[];
  onStudentClick: (studentId: string) => void;
  loading?: boolean;
}
```

**테이블 컬럼:**
- [번호]
- [이름]
- [오늘 발언 횟수]
- [찬성/반대 비율] (시각화)
- [쿠폰 사용 여부] (아이콘)
- [리포트 보기 버튼]

**색상/아이콘 표시:**
- 발언 적음 (주의) - 노란색/경고 아이콘
- 정상 - 초록색
- 과다 (조정 필요) - 빨간색/주의 아이콘

**필터:**
- "참여도 낮음만"
- "쿠폰 사용한 학생만"
- "리포트 있는 학생만"

---

### 10. `StudentReportDrawer`
**위치:** `src/components/teacher/StudentReportDrawer.tsx`

**역할:**
- 학생 리포트 상세를 우측 슬라이드 패널로 표시

**Props:**
```typescript
interface StudentReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  classId: string;
  sessionId: string | null;
}
```

**표시 내용:**
- 학생 기본 정보 (이름, 번호)
- 오늘/누적 발언 로그 (리스트)
- AI 요약 리포트
- 교사가 남긴 메모 (편집 가능)
- 사용한 쿠폰 기록

**기능:**
- 교사 메모 입력/수정
- 리포트 저장 버튼

---

## 📁 파일 구조

```
src/
├── app/
│   └── teacher/
│       └── dashboard/
│           └── page.tsx (메인 페이지)
├── components/
│   └── teacher/
│       ├── ClassSelector.tsx
│       ├── SessionSelector.tsx
│       ├── ClassSummaryCard.tsx
│       ├── LiveDebatePanel.tsx
│       ├── TeacherControlPanel.tsx
│       ├── AnnouncementTab.tsx
│       ├── TopicTab.tsx
│       ├── CouponTab.tsx
│       ├── StudentTable.tsx
│       └── StudentReportDrawer.tsx
└── services/
    └── classroomService.ts (새로 생성 - Firestore CRUD 함수)
```

---

## 🔄 데이터 플로우

### 1. 페이지 로드
```
TeacherDashboardPage 마운트
  ↓
useEffect: 교사가 담당한 반 목록 조회 (getTeacherClasses)
  ↓
첫 번째 반 선택 (또는 저장된 반)
  ↓
useEffect: 해당 반의 세션 목록 조회 (getClassSessions)
  ↓
오늘 첫 번째 세션 선택 (또는 저장된 세션)
  ↓
useEffect: 반 요약, 실시간 현황, 학생 리스트 조회
```

### 2. 반 변경
```
ClassSelector에서 반 선택
  ↓
currentClassId 상태 업데이트
  ↓
전체 대시보드 리셋:
  - 세션 목록 재조회
  - 반 요약 재조회
  - 학생 리스트 재조회
  - 실시간 현황 재조회
```

### 3. 공지사항 작성
```
AnnouncementTab에서 공지 작성
  ↓
createAnnouncement() 호출
  ↓
Firestore에 저장
  ↓
학생 화면에 즉시 반영 (실시간 구독)
```

### 4. 학생 리포트 열기
```
StudentTable에서 학생 클릭
  ↓
StudentReportDrawer 열기
  ↓
해당 학생의 리포트 조회 (getStudentReport)
  ↓
발언 로그 조회 (getDebateLogs)
  ↓
패널에 표시
```

---

## 🎨 스타일 가이드

- **Tailwind CSS** 유틸리티 클래스 사용
- **Glassmorphism** 스타일 (카드)
- **반응형 디자인** (모바일/태블릿/PC)
- **다크 모드** 지원

---

## ✅ 다음 단계

1. ✅ 데이터 구조 확정
2. ✅ 컴포넌트 구조 설계 (이 문서)
3. ⏭️ `classroomService.ts` 구현 (Firestore CRUD)
4. ⏭️ 각 컴포넌트 구현
5. ⏭️ 통합 테스트

