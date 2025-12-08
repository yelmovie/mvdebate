# Cursor용 프롬프트: 교사 대시보드 구현

## 📋 작업 요청

교사용 대시보드 페이지를 위 구조로 만들어주세요. 기존 Auth / Student / DebateService는 건드리지 말고, UI 컴포넌트만 추가하세요.

---

## 🎯 구현 범위

### 1. 새로 생성할 파일

#### 타입 정의 (이미 생성됨)
- ✅ `src/types/classroom.ts` - 교실 중심 데이터 타입 정의

#### 서비스 레이어
- `src/services/classroomService.ts` - Firestore CRUD 함수들

#### 컴포넌트
- `src/components/teacher/ClassSelector.tsx`
- `src/components/teacher/SessionSelector.tsx`
- `src/components/teacher/ClassSummaryCard.tsx`
- `src/components/teacher/LiveDebatePanel.tsx`
- `src/components/teacher/TeacherControlPanel.tsx`
- `src/components/teacher/AnnouncementTab.tsx`
- `src/components/teacher/TopicTab.tsx`
- `src/components/teacher/CouponTab.tsx`
- `src/components/teacher/StudentTable.tsx`
- `src/components/teacher/StudentReportDrawer.tsx`

#### 페이지
- `src/app/teacher/dashboard/page.tsx` (기존 파일 수정 또는 새로 생성)

---

## 📚 참고 문서

1. **데이터 구조:** `FIRESTORE_SCHEMA.md`
2. **컴포넌트 구조:** `COMPONENT_STRUCTURE.md`
3. **타입 정의:** `src/types/classroom.ts`

---

## ⚠️ 중요 제약사항

### 절대 건드리면 안 되는 것
- ❌ `src/contexts/AuthContext.ts` - 인증 로직
- ❌ `src/services/studentService.ts` - 학생 서비스
- ❌ `src/services/teacherService.ts` - 기존 교사 서비스 (확장은 가능)
- ❌ `src/components/student/StudentEntryForm.tsx` - 학생 입장 폼
- ❌ 기존 Debate 관련 서비스/컴포넌트

### 수정 가능한 것
- ✅ `src/app/teacher/dashboard/page.tsx` - 교사 대시보드 메인 페이지
- ✅ `src/services/teacherService.ts` - 확장 (새 함수 추가는 가능)

---

## 🔧 구현 가이드

### 1. `classroomService.ts` 구현

Firestore CRUD 함수를 구현하세요:

```typescript
// src/services/classroomService.ts

import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import {
  Class,
  Student,
  DebateSession,
  Announcement,
  Coupon,
  StudentReport,
  LiveStatus,
  DebateLog,
  ClassSummary,
  StudentTableRow
} from "../types/classroom";

// 1. 반 목록 조회 (교사별)
export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
  // TODO: classes 컬렉션에서 teacherId로 필터링
}

// 2. 반 요약 조회
export async function getClassSummary(classId: string, sessionId: string | null): Promise<ClassSummary> {
  // TODO: students, reports, coupons 데이터를 집계
}

// 3. 실시간 토론 현황 구독
export function subscribeLiveStatus(
  classId: string,
  sessionId: string,
  callback: (status: LiveStatus | null) => void
): () => void {
  // TODO: onSnapshot으로 실시간 구독
}

// 4. 공지사항 CRUD
export async function createAnnouncement(announcement: Omit<Announcement, 'announcementId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  // TODO: announcements 컬렉션에 추가
}

export async function getClassAnnouncements(classId: string, limitCount: number = 10): Promise<Announcement[]> {
  // TODO: classId로 필터링, 최신순 정렬
}

// 5. 토론 세션 CRUD
export async function createSession(session: Omit<DebateSession, 'sessionId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  // TODO: sessions 컬렉션에 추가
}

export async function updateSessionTopic(sessionId: string, topicTitle: string, topicDescription?: string): Promise<void> {
  // TODO: sessions/{sessionId} 업데이트
}

// 6. 쿠폰 일괄 발급
export async function issueCoupons(coupons: Omit<Coupon, 'couponId' | 'issuedAt'>[]): Promise<void> {
  // TODO: batch write로 일괄 생성
}

// 7. 학생 리스트 조회
export async function getStudentTableRows(classId: string, sessionId: string | null): Promise<StudentTableRow[]> {
  // TODO: students, reports 데이터를 조합하여 테이블 행 생성
}

// 8. 학생 리포트 조회
export async function getStudentReport(studentId: string, sessionId: string): Promise<StudentReport | null> {
  // TODO: reports 컬렉션에서 조회
}

// 9. 발언 로그 조회
export async function getDebateLogs(studentId: string, sessionId: string): Promise<DebateLog[]> {
  // TODO: debateLogs 컬렉션에서 조회, 시간순 정렬
}

// 10. 실시간 현황 업데이트
export async function updateLiveStatus(
  classId: string,
  sessionId: string,
  updates: Partial<LiveStatus>
): Promise<void> {
  // TODO: liveStatus/{classId}_{sessionId} 업데이트
}
```

### 2. 메인 페이지 구현

```typescript
// src/app/teacher/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ClassSelector from "@/components/teacher/ClassSelector";
import SessionSelector from "@/components/teacher/SessionSelector";
import ClassSummaryCard from "@/components/teacher/ClassSummaryCard";
import LiveDebatePanel from "@/components/teacher/LiveDebatePanel";
import TeacherControlPanel from "@/components/teacher/TeacherControlPanel";
import StudentTable from "@/components/teacher/StudentTable";
import StudentReportDrawer from "@/components/teacher/StudentReportDrawer";
import { getTeacherClasses, getClassSummary, subscribeLiveStatus, ... } from "@/services/classroomService";
import { Class, DebateSession, ClassSummary, LiveStatus, StudentTableRow } from "@/types/classroom";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [studentRows, setStudentRows] = useState<StudentTableRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 로드: 교사가 담당한 반 목록
  useEffect(() => {
    if (user?.uid) {
      getTeacherClasses(user.uid).then(setClasses);
    }
  }, [user]);

  // 반 선택 시: 세션 목록, 요약, 학생 리스트 조회
  useEffect(() => {
    if (currentClassId) {
      // TODO: 세션 목록, 요약, 학생 리스트 조회
    }
  }, [currentClassId, currentSessionId]);

  // 실시간 현황 구독
  useEffect(() => {
    if (currentClassId && currentSessionId) {
      const unsubscribe = subscribeLiveStatus(
        currentClassId,
        currentSessionId,
        setLiveStatus
      );
      return unsubscribe;
    }
  }, [currentClassId, currentSessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* 상단 바 */}
      <div className="flex items-center gap-4 mb-6">
        <ClassSelector
          classes={classes}
          currentClassId={currentClassId}
          onClassChange={setCurrentClassId}
        />
        <SessionSelector
          classId={currentClassId || ""}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionChange={setCurrentSessionId}
        />
        <div className="text-white">
          {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 왼쪽 컬럼 */}
        <div className="lg:col-span-2 space-y-6">
          <ClassSummaryCard summary={summary} loading={loading} />
          <LiveDebatePanel
            classId={currentClassId || ""}
            sessionId={currentSessionId}
            liveStatus={liveStatus}
            onToggleRoom={(isOpen) => {
              // TODO: 토론 방 열기/닫기
            }}
          />
        </div>

        {/* 오른쪽 컬럼 */}
        <div>
          <TeacherControlPanel
            classId={currentClassId || ""}
            currentSession={sessions.find(s => s.sessionId === currentSessionId) || null}
          />
        </div>
      </div>

      {/* 학생 리스트 테이블 */}
      <StudentTable
        classId={currentClassId || ""}
        sessionId={currentSessionId}
        students={studentRows}
        onStudentClick={setSelectedStudentId}
        loading={loading}
      />

      {/* 리포트 상세 패널 */}
      <StudentReportDrawer
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId || ""}
        classId={currentClassId || ""}
        sessionId={currentSessionId}
      />
    </div>
  );
}
```

### 3. 컴포넌트 구현 가이드

각 컴포넌트는 다음 원칙을 따르세요:

1. **Tailwind CSS만 사용** (별도 CSS 파일 생성 금지)
2. **TypeScript 타입 안전성** (모든 Props 타입 정의)
3. **에러 핸들링** (try-catch, 로딩 상태)
4. **반응형 디자인** (모바일/태블릿/PC)
5. **접근성** (키보드 네비게이션, ARIA 레이블)

---

## 🎨 스타일 가이드

### 카드 스타일
```tsx
<div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-6">
  {/* 내용 */}
</div>
```

### 버튼 스타일
```tsx
<button className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity">
  버튼 텍스트
</button>
```

### 테이블 스타일
```tsx
<table className="w-full bg-white/5 rounded-xl overflow-hidden">
  <thead className="bg-white/10">
    {/* 헤더 */}
  </thead>
  <tbody>
    {/* 행 */}
  </tbody>
</table>
```

---

## ✅ 체크리스트

구현 완료 후 다음을 확인하세요:

- [ ] 모든 컴포넌트가 TypeScript 타입 안전성을 만족하는가?
- [ ] Firestore 쿼리가 올바른 인덱스를 사용하는가?
- [ ] 실시간 구독이 제대로 cleanup 되는가?
- [ ] 에러 핸들링이 모든 비동기 함수에 적용되어 있는가?
- [ ] 반응형 디자인이 모바일/태블릿/PC에서 잘 작동하는가?
- [ ] 기존 Auth/Student 서비스를 건드리지 않았는가?

---

## 🚀 시작하기

1. `src/services/classroomService.ts` 생성 및 구현
2. 각 컴포넌트를 순서대로 구현
3. 메인 페이지에 통합
4. 테스트 및 디버깅

**참고:** 기존 코드 구조와 스타일을 최대한 따르세요.

