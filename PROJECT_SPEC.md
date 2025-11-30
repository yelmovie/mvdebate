# 토론 연습 웹앱 - 프로젝트 명세서

## 📌 1. 제품 배경

초등학생(4~6학년)을 위한 **채팅형 토론 연습 웹앱**을 구축합니다.

학생들이 AI 코치와 대화하면서 토론의 구조(주장 → 근거 → 자료 → 반론 → 재반박)를 자연스럽게 학습할 수 있도록 합니다.

### 핵심 원칙
1. **하드코딩 금지** - 모든 주제, 평가 기준, 시스템 프롬프트는 JSON/DB로 외부화
2. **One Source of Truth** - 설정은 한 곳에서만 관리
3. **적절한 에러 핸들링** - 모든 API 호출, 빈 값, 잘못된 플로우, 네트워크 에러 처리
4. **단일 책임 원칙 (SRP)** - 각 함수/컴포넌트는 하나의 역할만
5. **명확한 폴더 구조** - constants, utilities, hooks, services, styles 체계적 관리
6. **AI 안전성** - 유해한 주제 필터링, 정치/폭력 주제 제외, 학생 안전한 톤 유지

---

## 📌 2. 핵심 기능

### (A) 토론 주제 시스템
- `topics.json`에서 100개 토론 주제 로드 (하드코딩 금지)
- "랜덤 주제" 또는 "다른 주제 보기" 플로우 제공
- 각 주제: id, title, category, difficulty, tags

### (B) 토론 준비 마법사
단계별 가이드 플로우:
1. 주장(Claim) 작성
2. 근거(Reasons) 2개 이상 작성
3. 자료(Evidence) - 예시/사실/경험 연결
4. 예상 반론(Counterargument) 작성
5. 재반박(Rebuttal) 작성

각 단계는 상태에 저장 → 세션 스토어에 자동 저장

### (C) AI 코칭 (채팅 모드)
- AI는 `systemPrompt.json`에 정의된 "토론 코치 페르소나" 채택
- AI는 모든 학생 메시지를 다음 중 하나로 라벨링:
  - [claim], [reason], [evidence], [counterargument], [rebuttal], [other]
- 응답은 JSON 형식: `{ aiMessage, labels[], nextStep }`
- AI는 누락된 구조를 추가하도록 유도 (예: "왜 그렇게 생각해? 근거를 하나 더 붙여볼까?")

### (D) 시각화 패널 (우측)
- 학생의 토론 구성요소를 트리/구조화된 레이아웃으로 렌더링:
  - Claim → Reason 리스트 → 각 Reason → Evidence 리스트 → Counterargument → Rebuttal
- 학생이 메시지를 보낼 때마다 자동 업데이트

### (E) 요약 + 피드백
토론 종료 후 생성:
- 최종 구조화된 요약
- "잘한 점"
- "다음에 개선할 점"
- 5개 항목 체크리스트 평가 (`rubrics.json`으로 설정 가능)

### (F) 교사 대시보드 (후속)
- userId / topic / date별 학생 세션 조회
- 다운로드 가능한 간단한 리포트

---

## 📌 3. 데이터 구조

### JSON 설정 파일 (One Source of Truth)
- `/config/topics.json` - 토론 주제 100개
- `/config/systemPrompt.json` - AI 시스템 프롬프트
- `/config/rubrics.json` - 평가 기준
- `/config/appSettings.json` - 앱 설정

### 주요 엔티티
```typescript
User {
  id: string
  nickname: string
  grade: number
  class: string
  role: 'student' | 'teacher'
}

Topic {
  id: string
  title: string
  category: string
  difficulty: 1 | 2 | 3
  tags: string[]
}

DebateSession {
  id: string
  userId: string
  topicId: string
  stance: 'pro' | 'con'
  createdAt: Date
  finishedAt: Date | null
  summary: string | null
}

DebateTurn {
  id: string
  sessionId: string
  sender: 'student' | 'ai'
  text: string
  label: 'claim' | 'reason' | 'evidence' | 'counterargument' | 'rebuttal' | 'other'
  timestamp: Date
}
```

---

## 📌 4. 기술 요구사항

- **프론트엔드**: React + 깔끔한 폴더 구조
  - `components/` - 재사용 가능한 컴포넌트
  - `pages/` - 페이지 컴포넌트
  - `hooks/` - 커스텀 훅
  - `services/` - API 서비스
  - `config/` - 설정 파일
  - `styles/` - 스타일 파일
  - `stores/` - 상태 관리
  - `utils/` - 유틸리티 함수

- **백엔드**: Next.js API routes 또는 Node/Express
- **상태 관리**: Zustand (SRP 준수)
- **AI**: OpenAI API (안전 필터 포함)
- **에러 핸들링**:
  - 네트워크 재시도
  - 잘못된 JSON 반환 처리
  - 빈 사용자 입력 처리
  - 세션 손실 복구

---

## 📌 5. 페르소나

### 학생 페르소나 (Primary)
- 이름: 민수 (가명), 5~6학년
- 상황: 국어 시간에 토론을 해봤지만 막상 말하려니 할 말이 생각이 안 남
- 목표: 토론 시간에 적어도 한 번은 손을 들고 말하고 싶음
- 문제점: 주장-근거-자료-반론-재반박 구조를 머리로는 들어봤지만 실제 말할 때는 섞여버림

### 교사 페르소나 (Secondary)
- 이름: 예리 (담임/국어 교사)
- 목표: 수업 시간 전에 학생들이 기본적인 토론 구조를 익혀온 상태가 되기를 바람
- 문제점: 전체 학급을 동시에 지도하다 보니 개별 피드백을 주기 어려움

### AI 토론 코치 페르소나 (In-app)
- 역할: 친절하지만 느슨하게 넘어가지 않는 '토론 코치'
- 말투: 초등 고학년 기준, 교실 컨셉에 맞게 선택
- 기능: 학생이 주장만 말하고 근거를 빼먹으면 바로 "왜 그렇게 생각해? 근거를 하나만 더 붙여볼까?" 라고 질문

---

## 📌 6. 화면 흐름

1. **입장 화면**: 닉네임/학번 입력 → 난이도 선택
2. **토론 주제 뽑기**: 랜덤 주제 표시 → "이 주제로 할래요" / "다른 주제 보여줘"
3. **입장 선택**: 찬성/반대 선택 → 초기 주장 한 줄 작성
4. **준비 단계**: 좌측 채팅창 + 우측 구조 패널
5. **실전 토론**: AI가 반대편 역할로 반론 제시 → 학생 재반박
6. **정리 & 피드백**: 오늘 토론 요약 + 체크리스트 + 저장

---

## 📌 7. 코드 스타일 규칙

- 절대 하드코딩 금지 (주제, 프롬프트, 평가 기준)
- 모든 설정 가능한 값은 JSON 또는 `/config`에서
- 각 함수는 하나의 작업만 수행 (SRP)
- async/await만 사용
- 명확한 네이밍 컨벤션
- 모든 모듈에 주석






