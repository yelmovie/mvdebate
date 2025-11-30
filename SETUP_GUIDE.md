# 설치 및 실행 가이드

## 1. 프로젝트 설정

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

## 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 3. 프로젝트 구조 확인

주요 파일 위치:

- **설정 파일**: `src/config/`
  - `topics.json` - 토론 주제 100개
  - `systemPrompt.json` - AI 시스템 프롬프트
  - `rubrics.json` - 평가 기준
  - `appSettings.json` - 앱 설정

- **페이지**: `src/pages/`
  - `index.tsx` - 홈 페이지 (사용자 정보 입력)
  - `TopicSelectPage.tsx` - 토론 주제 선택
  - `PreparationPage.tsx` - 토론 준비
  - `DebatePage.tsx` - AI와 토론
  - `SummaryPage.tsx` - 토론 요약 및 피드백

- **상태 관리**: `src/stores/`
  - `debateStore.ts` - 토론 세션 상태
  - `topicStore.ts` - 토론 주제 상태
  - `userStore.ts` - 사용자 상태

- **API 서비스**: `src/services/`
  - `api/aiService.ts` - OpenAI API 통신
  - `api/debateApi.ts` - 토론 API
  - `storage/sessionStorage.ts` - 세션 저장소

## 4. 주요 기능 테스트

1. **홈 페이지**: 닉네임, 학년 입력
2. **주제 선택**: 난이도 선택 후 랜덤 주제 확인
3. **준비 단계**: 찬성/반대 선택 및 초기 주장 작성
4. **토론 단계**: AI와 채팅하며 토론 진행
5. **요약 페이지**: 토론 결과 확인

## 5. 문제 해결

### OpenAI API 키 오류
- `.env.local` 파일이 올바른 위치에 있는지 확인
- API 키가 유효한지 확인
- 환경 변수 이름이 `NEXT_PUBLIC_OPENAI_API_KEY`인지 확인

### 주제가 로드되지 않음
- `src/config/topics.json` 파일이 존재하는지 확인
- JSON 형식이 올바른지 확인

### 세션 저장 오류
- 브라우저의 localStorage가 활성화되어 있는지 확인
- 개발자 도구에서 콘솔 에러 확인

## 6. 다음 단계

프로젝트가 정상적으로 실행되면:

1. UI/UX 개선
2. 추가 기능 개발 (교사 대시보드 등)
3. 스타일링 개선
4. 성능 최적화
5. 테스트 작성

## 참고

- 프로젝트 명세: `PROJECT_SPEC.md`
- 아키텍처 설계: `ARCHITECTURE.md`
- Cursor 프롬프트: `CURSOR_PROMPT.md`






