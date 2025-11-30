# 🚀 MovieSam Debate Lab - 설정 체크리스트

## ✅ 필수 설정 단계

### 1. 환경 변수 설정

#### `.env.local` 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요:

```env
UPSTAGE_API_KEY=your_upstage_api_key_here
```

**위치**: `c:\moviessam2\mvdebate\.env.local`

**참고**: `.env.local.example` 파일을 복사해서 사용할 수 있습니다.

### 2. 의존성 설치 확인

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 브라우저에서 확인

1. http://localhost:3000 접속
2. 홈 화면에서 닉네임 입력
3. `/debate` 페이지로 이동
4. 토론 주제 선택 및 세션 생성
5. AI와 채팅 테스트

## ✅ 코드 상태 확인

### 현재 사용 중인 파일 (정상 작동)
- ✅ `src/services/ai/upstageClient.ts` - Upstage API 클라이언트
- ✅ `src/services/debateService.ts` - 토론 서비스
- ✅ `src/app/api/debate/turn/route.ts` - API 라우트
- ✅ `src/components/debate/ChatPanel.tsx` - 채팅 UI
- ✅ `src/app/debate/page.tsx` - 토론 페이지

### 사용되지 않는 파일 (삭제 가능)
다음 파일들은 현재 사용되지 않지만, 참고용으로 남겨둘 수 있습니다:

- ⚠️ `src/services/api/aiService.ts` - 구버전 OpenAI 코드
- ⚠️ `src/pages/api/debate/chat.ts` - Pages Router API (App Router로 대체됨)
- ⚠️ `src/hooks/useAIChat.ts` - 사용되지 않는 훅
- ⚠️ `src/pages/DebatePage.tsx` - Pages Router 페이지 (App Router로 대체됨)

## 🔍 문제 해결

### API 키 관련 에러
**에러**: `UPSTAGE_API_KEY is not set`
- ✅ `.env.local` 파일이 프로젝트 루트에 있는지 확인
- ✅ 파일 이름이 정확히 `.env.local`인지 확인
- ✅ 개발 서버를 재시작했는지 확인

### 빌드 에러
**에러**: TypeScript 타입 오류
- ✅ `npm run build` 실행하여 타입 체크
- ✅ 모든 import 경로가 올바른지 확인

### 런타임 에러
**에러**: API 호출 실패
- ✅ Upstage API 키가 유효한지 확인
- ✅ 네트워크 연결 확인
- ✅ 브라우저 콘솔에서 에러 메시지 확인

## 📋 최종 확인 사항

- [ ] `.env.local` 파일 생성 및 API 키 입력
- [ ] `npm install` 완료
- [ ] `npm run dev` 실행 성공
- [ ] 홈 페이지 접속 가능
- [ ] 토론 페이지 접속 가능
- [ ] AI 채팅 기능 작동 확인
- [ ] 교사용 대시보드 접속 가능

## 🎉 완료!

모든 체크리스트를 완료하면 앱이 정상적으로 작동합니다!






