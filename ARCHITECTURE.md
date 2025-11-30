# 아키텍처 설계 문서

## 📁 폴더 구조

```
mvdebate/
├── public/
│   └── (정적 파일)
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/         # 공통 컴포넌트 (Button, Input, Card 등)
│   │   ├── debate/         # 토론 관련 컴포넌트
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── DebateStructurePanel.tsx
│   │   │   ├── TopicSelector.tsx
│   │   │   └── FeedbackCard.tsx
│   │   └── layout/         # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── TopicSelectPage.tsx
│   │   ├── PreparationPage.tsx
│   │   ├── DebatePage.tsx
│   │   ├── SummaryPage.tsx
│   │   └── TeacherDashboard.tsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useDebateSession.ts
│   │   ├── useAIChat.ts
│   │   └── useDebateStructure.ts
│   ├── services/           # API 서비스
│   │   ├── api/
│   │   │   ├── debateApi.ts
│   │   │   └── aiService.ts
│   │   └── storage/
│   │       └── sessionStorage.ts
│   ├── stores/             # Zustand 스토어
│   │   ├── debateStore.ts
│   │   ├── userStore.ts
│   │   └── topicStore.ts
│   ├── config/             # 설정 파일 (JSON)
│   │   ├── topics.json
│   │   ├── systemPrompt.json
│   │   ├── rubrics.json
│   │   └── appSettings.json
│   ├── utils/              # 유틸리티 함수
│   │   ├── labelClassifier.ts
│   │   ├── errorHandler.ts
│   │   └── validators.ts
│   ├── types/              # TypeScript 타입 정의
│   │   ├── debate.ts
│   │   ├── user.ts
│   │   └── topic.ts
│   ├── styles/             # 스타일 파일
│   │   ├── globals.css
│   │   └── components.css
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 데이터 플로우

### 1. 토론 세션 시작 플로우
```
User 입력 (닉네임, 난이도)
  ↓
TopicStore에서 랜덤 주제 선택
  ↓
DebateStore에 새 세션 생성
  ↓
PreparationPage로 이동
```

### 2. AI 채팅 플로우
```
학생 메시지 입력
  ↓
useAIChat 훅 → aiService.sendMessage()
  ↓
OpenAI API 호출 (systemPrompt.json 사용)
  ↓
응답 파싱 (JSON: { aiMessage, labels[], nextStep })
  ↓
DebateStore 업데이트 (메시지 + 라벨 추가)
  ↓
DebateStructurePanel 자동 업데이트
```

### 3. 토론 구조 업데이트 플로우
```
학생 메시지 → labelClassifier로 라벨 분류
  ↓
DebateStore의 구조 상태 업데이트
  ↓
useDebateStructure 훅이 변경 감지
  ↓
DebateStructurePanel 리렌더링
```

## 🗄️ 상태 관리 구조

### DebateStore (Zustand)
```typescript
{
  currentSession: DebateSession | null
  messages: DebateTurn[]
  structure: {
    claim: string
    reasons: Reason[]
    counterarguments: Counterargument[]
    rebuttals: Rebuttal[]
  }
  currentStep: 'claim' | 'reasons' | 'evidence' | 'counterargument' | 'rebuttal' | 'debate'
  actions: {
    startSession()
    addMessage()
    updateStructure()
    finishSession()
  }
}
```

### TopicStore (Zustand)
```typescript
{
  topics: Topic[]
  currentTopic: Topic | null
  difficulty: 1 | 2 | 3
  actions: {
    loadTopics()
    selectRandomTopic()
    selectTopicById()
  }
}
```

### UserStore (Zustand)
```typescript
{
  user: User | null
  actions: {
    setUser()
    clearUser()
  }
}
```

## 🔌 API 엔드포인트 설계

### Next.js API Routes (또는 Express)

```
POST /api/debate/session
  - 새 토론 세션 생성

POST /api/debate/chat
  - AI와 채팅 (OpenAI API 프록시)
  - Request: { sessionId, message, context }
  - Response: { aiMessage, labels[], nextStep }

GET /api/debate/session/:id
  - 세션 조회

GET /api/topics
  - 주제 목록 조회 (topics.json에서)

GET /api/topics/random
  - 랜덤 주제 반환

GET /api/teacher/sessions
  - 교사용: 학생 세션 목록 조회
```

## 🛡️ 에러 핸들링 전략

1. **네트워크 에러**: 재시도 로직 (최대 3회)
2. **AI API 에러**: 폴백 메시지 표시
3. **빈 입력**: 유효성 검사 후 경고
4. **세션 손실**: localStorage에 자동 저장 및 복구
5. **잘못된 JSON**: 파싱 에러 처리 및 기본값 반환

## 🔐 AI 안전성

1. **주제 필터링**: topics.json에서 유해 주제 제외
2. **프롬프트 안전성**: systemPrompt.json에 안전 가이드라인 포함
3. **응답 검증**: AI 응답에 유해 내용 필터링
4. **학생 안전 톤**: 모든 AI 응답은 초등학생에 적합한 언어 사용






