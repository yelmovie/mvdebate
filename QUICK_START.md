# 🚀 빠른 시작 가이드

## 현재 상태 확인

### ✅ 프로젝트 구조
- ✅ 모든 소스 파일 정상
- ✅ 설정 파일 정상

### ⚠️ 필요한 작업

#### 1. Node.js 설치 확인
PowerShell에서 확인:
```powershell
node --version
npm --version
```

**설치되지 않은 경우:**
- https://nodejs.org/ 접속
- LTS 버전 다운로드 및 설치
- 설치 후 **새 PowerShell 창** 열기

#### 2. 의존성 설치
```powershell
cd c:\moviessam2\mvdebate
npm install
```

#### 3. API 키 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
UPSTAGE_API_KEY=your_upstage_api_key_here
```

#### 4. 개발 서버 실행
```powershell
npm run dev
```

## 실행 확인 체크리스트

- [ ] Node.js 설치 확인 (`node --version`)
- [ ] npm 설치 확인 (`npm --version`)
- [ ] 의존성 설치 (`npm install`)
- [ ] API 키 설정 (`.env.local` 파일)
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 브라우저에서 http://localhost:3000 접속

## 예상 결과

### 정상 실행 시
```
> mvdebate@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 에러 발생 시

#### `node: command not found`
→ Node.js 설치 필요

#### `UPSTAGE_API_KEY is not set`
→ `.env.local` 파일 생성 필요

#### `Module not found`
→ `npm install` 실행 필요






