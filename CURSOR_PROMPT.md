# Cursor 개발 프롬프트

이 문서는 Cursor에서 사용할 수 있는 개발 프롬프트입니다.

## 프로젝트 개요

초등학생(4~6학년)을 위한 **채팅형 토론 연습 웹앱**을 구축 중입니다.

학생들이 AI 코치와 대화하면서 토론의 구조(주장 → 근거 → 자료 → 반론 → 재반박)를 자연스럽게 학습할 수 있도록 합니다.

## 핵심 원칙

1. **하드코딩 금지** - 모든 주제, 평가 기준, 시스템 프롬프트는 JSON/DB로 외부화
2. **One Source of Truth** - 설정은 한 곳에서만 관리
3. **적절한 에러 핸들링** - 모든 API 호출, 빈 값, 잘못된 플로우, 네트워크 에러 처리
4. **단일 책임 원칙 (SRP)** - 각 함수/컴포넌트는 하나의 역할만
5. **명확한 폴더 구조** - constants, utilities, hooks, services, styles 체계적 관리
6. **AI 안전성** - 유해한 주제 필터링, 정치/폭력 주제 제외, 학생 안전한 톤 유지

## 주요 기능

### (A) 토론 주제 시스템
- `src/config/topics.json`에서 100개 토론 주제 로드
- "랜덤 주제" 또는 "다른 주제 보기" 플로우
- 각 주제: id, title, category, difficulty, tags

### (B) 토론 준비 마법사
단계별 가이드:
1. 주장(Claim) 작성
2. 근거(Reasons) 2개 이상
3. 자료(Evidence) - 예시/사실/경험
4. 예상 반론(Counterargument)
5. 재반박(Rebuttal)

### (C) AI 코칭 (채팅 모드)
- AI는 `src/config/systemPrompt.json`의 "토론 코치 페르소나" 사용
- 모든 학생 메시지를 라벨링: [claim], [reason], [evidence], [counterargument], [rebuttal], [other]
- 응답 형식: `{ aiMessage, labels[], nextStep }`
- 누락된 구조 추가 유도

### (D) 시각화 패널 (우측)
- 토론 구조 트리 렌더링
- Claim → Reason 리스트 → Evidence → Counterargument → Rebuttal
- 실시간 업데이트

### (E) 요약 + 피드백
- 최종 구조화된 요약
- "잘한 점" / "개선할 점"
- 5개 항목 체크리스트 (`src/config/rubrics.json`)

## 기술 스택

- **프론트엔드**: React, Next.js, TypeScript
- **상태 관리**: Zustand
- **AI**: OpenAI API (GPT-4o-mini)
- **스타일링**: CSS (추후 확장 가능)

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # Next.js 페이지
│   ├── api/      # API 라우트
│   └── *.tsx     # 페이지 컴포넌트
├── hooks/        # 커스텀 훅
├── services/     # API 서비스
├── stores/       # Zustand 스토어
├── config/       # 설정 파일 (JSON)
├── utils/        # 유틸리티 함수
├── types/        # TypeScript 타입
└── styles/       # 스타일 파일
```

## 설정 파일 위치

- `src/config/topics.json` - 토론 주제 100개
- `src/config/systemPrompt.json` - AI 시스템 프롬프트
- `src/config/rubrics.json` - 평가 기준
- `src/config/appSettings.json` - 앱 설정

## 환경 변수

`.env.local` 파일 생성 필요:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

## 개발 가이드

1. **새 기능 추가 시**:
   - 설정은 `src/config/`에 JSON으로 추가
   - 타입은 `src/types/`에 정의
   - 유틸리티는 `src/utils/`에 추가
   - 컴포넌트는 `src/components/`에 추가

2. **API 호출 시**:
   - `src/services/api/`에 서비스 함수 추가
   - 에러 핸들링 필수 (`src/utils/errorHandler.ts` 활용)
   - 재시도 로직 적용

3. **상태 관리**:
   - Zustand 스토어는 `src/stores/`에 정의
   - 각 스토어는 단일 책임 원칙 준수

4. **에러 핸들링**:
   - 모든 API 호출에 try-catch
   - 사용자 친화적 에러 메시지
   - 네트워크 에러 재시도

## 다음 단계

1. OpenAI API 키 설정
2. `npm install` 실행
3. `npm run dev`로 개발 서버 시작
4. 브라우저에서 `http://localhost:3000` 접속

## 참고 문서

- `ARCHITECTURE.md` - 상세 아키텍처 설계
- `PROJECT_SPEC.md` - 프로젝트 명세서
- `README.md` - 프로젝트 개요






