# 토론씨앗 (DebateMate Kids)

초등학생을 위한 AI 기반 토론 연습 웹앱

## 프로젝트 개요

학생들이 AI 코치와 채팅하면서 토론의 구조(주장 → 근거 → 자료 → 반론 → 재반박)를 자연스럽게 학습할 수 있는 웹앱입니다.

## 주요 기능

- 🎯 **랜덤 토론 주제**: 100개의 미리 준비된 토론 주제 중 선택
- 📝 **토론 준비 마법사**: 단계별 가이드를 통한 체계적인 토론 준비
- 💬 **AI 코칭**: 실시간 채팅을 통한 토론 연습
- 📊 **시각화 패널**: 토론 구조를 한눈에 볼 수 있는 구조 패널
- 📈 **피드백 리포트**: 토론 후 상세한 피드백 제공

## 기술 스택

- **프론트엔드**: React, Next.js, TypeScript
- **상태 관리**: Zustand
- **AI**: OpenAI API
- **스타일링**: CSS Modules (추후 확장 가능)

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── stores/         # Zustand 스토어
├── config/         # 설정 파일 (JSON)
├── utils/          # 유틸리티 함수
├── types/          # TypeScript 타입 정의
└── styles/         # 스타일 파일
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 설정 파일

모든 설정은 `src/config/` 폴더에서 관리됩니다:

- `topics.json`: 토론 주제 100개
- `systemPrompt.json`: AI 시스템 프롬프트
- `rubrics.json`: 평가 기준
- `appSettings.json`: 앱 설정

## 핵심 원칙

1. **하드코딩 금지**: 모든 설정은 JSON/DB로 외부화
2. **One Source of Truth**: 설정은 한 곳에서만 관리
3. **적절한 에러 핸들링**: 모든 에러 상황 처리
4. **단일 책임 원칙**: 각 함수/컴포넌트는 하나의 역할만
5. **AI 안전성**: 학생 안전을 위한 필터링

## 라이선스

MIT





