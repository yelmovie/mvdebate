# MovieSam Debate Lab - 설정 가이드

## 환경 변수 설정

### 1. `.env.local` 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요:

```env
# Upstage API Configuration
UPSTAGE_API_KEY=your_upstage_api_key_here
```

### 2. API 키 발급 방법

1. [Upstage AI](https://www.upstage.ai/) 웹사이트 방문
2. 회원가입 또는 로그인
3. API 키 발급 페이지에서 새 API 키 생성
4. 생성된 키를 `.env.local` 파일의 `UPSTAGE_API_KEY` 값에 입력

### 3. 파일 위치

```
mvdebate/
  ├── .env.local          ← 여기에 API 키 입력
  ├── .env.local.example  ← 참고용 (예시 파일)
  ├── src/
  └── ...
```

### 4. 보안 주의사항

- ⚠️ `.env.local` 파일은 절대 Git에 커밋하지 마세요
- ⚠️ API 키를 코드에 하드코딩하지 마세요
- ✅ `.gitignore`에 이미 `.env.local`이 포함되어 있습니다

### 5. 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 6. 확인 방법

1. 개발 서버 실행
2. `/debate` 페이지로 이동
3. 토론 세션 생성 후 메시지 전송
4. 브라우저 콘솔에서 에러가 없는지 확인
5. AI 응답이 정상적으로 오는지 확인

### 문제 해결

**에러: "UPSTAGE_API_KEY is not set"**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일 이름이 정확히 `.env.local`인지 확인 (`.env.local.txt` 아님)
- 개발 서버를 재시작했는지 확인

**에러: "Network error" 또는 "401 Unauthorized"**
- API 키가 올바른지 확인
- Upstage 계정에서 API 키가 활성화되어 있는지 확인
- API 키에 충분한 크레딧이 있는지 확인






