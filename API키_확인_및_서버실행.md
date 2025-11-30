# 🔍 API 키 확인 및 서버 실행 가이드

## 현재 상황

✅ **API 키는 설정하셨다고 하셨습니다.**  
❌ **하지만 서버가 실행되지 않아서 사이트에 연결이 안 됩니다.**

---

## 확인 방법

### 1. API 키 파일 확인

PowerShell에서 다음 명령어로 확인:

```powershell
cd c:\moviessam2\mvdebate
Get-Content .env.local
```

**예상 출력**:
```
UPSTAGE_API_KEY=sk-xxxxxxxxxxxxx
```

---

### 2. 서버 실행 상태 확인

```powershell
# Node.js 프로세스 확인
Get-Process -Name node -ErrorAction SilentlyContinue

# 포트 3000 확인
netstat -ano | findstr :3000
```

**결과 해석**:
- 프로세스가 있으면 → 서버 실행 중
- 프로세스가 없으면 → 서버 미실행

---

## 서버 실행 방법

### 방법 1: 자동 확인 및 실행 스크립트

```powershell
cd c:\moviessam2\mvdebate
.\verify-and-run.ps1
```

이 스크립트가 자동으로:
- API 키 확인
- 서버 실행 상태 확인
- 의존성 설치 확인
- 서버 실행

---

### 방법 2: 수동 실행

#### 1단계: 의존성 설치 (처음 한 번만)

```powershell
cd c:\moviessam2\mvdebate
npm install
```

**예상 소요 시간**: 1-3분

#### 2단계: 개발 서버 실행

```powershell
npm run dev
```

**예상 출력**:
```
> mvdebate@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

#### 3단계: 브라우저에서 확인

서버가 실행되면 브라우저에서:
```
http://localhost:3000
```

---

## 문제 해결

### "npm이 인식되지 않습니다"

**해결**: `npm.cmd` 사용
```powershell
npm.cmd install
npm.cmd run dev
```

또는 실행 정책 변경:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### "포트 3000이 이미 사용 중입니다"

다른 포트로 실행:
```powershell
$env:PORT=3001; npm run dev
```

브라우저에서 `http://localhost:3001` 접속

---

### "UPSTAGE_API_KEY is not set" 오류

이 오류가 나타나면:

1. **`.env.local` 파일 위치 확인**
   - 파일 위치: `c:\moviessam2\mvdebate\.env.local`
   - 프로젝트 루트에 있어야 합니다

2. **파일 내용 확인**
   ```env
   UPSTAGE_API_KEY=실제_API_키_값
   ```
   - `=` 앞뒤에 공백 없이
   - 따옴표 없이

3. **서버 재시작**
   - 서버를 중지 (Ctrl+C)
   - 다시 실행 (`npm run dev`)

---

## 빠른 실행 (복사해서 실행)

PowerShell에서 다음 명령어를 순서대로 실행:

```powershell
# 1. 프로젝트 디렉토리로 이동
cd c:\moviessam2\mvdebate

# 2. 실행 정책 변경 (한 번만)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. 의존성 설치 (처음 한 번만)
npm install

# 4. 개발 서버 실행
npm run dev
```

---

## 체크리스트

서버 실행 전 확인:

- [ ] `.env.local` 파일 존재
- [ ] `UPSTAGE_API_KEY=실제키값` 형식으로 설정
- [ ] `node_modules` 폴더 존재 (또는 `npm install` 완료)
- [ ] `npm run dev` 실행
- [ ] 터미널에 "Ready" 메시지 표시
- [ ] 브라우저에서 `http://localhost:3000` 접속

---

## 중요 사항

1. **서버 실행 중에는 터미널 창을 닫지 마세요**
   - 서버가 종료되면 사이트에 접속할 수 없습니다

2. **서버 종료 방법**
   - 터미널에서 `Ctrl + C` 누르기

3. **환경 변수 변경 후**
   - 서버를 재시작해야 변경사항이 적용됩니다

---

**지금 바로 서버를 실행해보세요!**

```powershell
cd c:\moviessam2\mvdebate
npm run dev
```



