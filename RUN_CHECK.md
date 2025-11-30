# 🚀 실행 확인 가이드

## 현재 상태

### ✅ 확인된 사항
- ✅ `package.json` 파일 존재
- ✅ `src/` 디렉토리 구조 정상
- ✅ 모든 소스 파일 정상

### ⚠️ 필요한 작업

#### 1. Node.js 및 npm 설치 확인
터미널에서 다음 명령어로 확인:
```bash
node --version
npm --version
```

**설치되지 않은 경우:**
- [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드 및 설치

#### 2. 의존성 설치
```bash
cd c:\moviessam2\mvdebate
npm install
```

#### 3. API 키 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
UPSTAGE_API_KEY=your_upstage_api_key_here
```

#### 4. 개발 서버 실행
```bash
npm run dev
```

#### 5. 브라우저에서 확인
- http://localhost:3000 접속
- 홈 페이지 확인
- 토론 페이지 테스트

## 예상 출력

### 정상 실행 시
```
> mvdebate@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 에러 발생 시

#### 에러: `npm: command not found`
- Node.js가 설치되지 않음
- Node.js 설치 필요

#### 에러: `UPSTAGE_API_KEY is not set`
- `.env.local` 파일이 없거나 API 키가 없음
- `.env.local` 파일 생성 및 API 키 추가

#### 에러: `Module not found`
- 의존성이 설치되지 않음
- `npm install` 실행

## 빠른 시작 명령어

```bash
# 1. 프로젝트 디렉토리로 이동
cd c:\moviessam2\mvdebate

# 2. 의존성 설치 (처음 한 번만)
npm install

# 3. 개발 서버 실행
npm run dev
```

## 문제 해결

### Node.js 설치 확인
```powershell
# PowerShell에서
Get-Command node
Get-Command npm
```

### 프로젝트 구조 확인
```powershell
# 필수 파일 확인
Test-Path package.json
Test-Path src/app
Test-Path src/services/ai/upstageClient.ts
```

### 빌드 테스트
```bash
npm run build
```






