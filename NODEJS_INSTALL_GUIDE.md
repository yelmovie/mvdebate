# Node.js 설치 가이드 (Windows)

## 🚀 설치 방법

### 방법 1: 공식 웹사이트에서 다운로드 (권장)

1. **Node.js 공식 사이트 방문**
   - https://nodejs.org/ 접속
   - **LTS 버전** (Long Term Support) 다운로드
   - 예: `v20.x.x LTS` 또는 `v18.x.x LTS`

2. **설치 파일 실행**
   - 다운로드한 `.msi` 파일 실행
   - 설치 마법사 따라하기
   - ✅ "Add to PATH" 옵션 체크 확인 (기본적으로 체크됨)

3. **설치 확인**
   - PowerShell 또는 명령 프롬프트 열기
   - 다음 명령어 실행:
   ```powershell
   node --version
   npm --version
   ```
   - 버전 번호가 출력되면 설치 성공!

### 방법 2: Chocolatey 사용 (이미 설치된 경우)

```powershell
# 관리자 권한 PowerShell에서
choco install nodejs-lts
```

### 방법 3: winget 사용 (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ 설치 확인

설치 후 PowerShell에서 확인:

```powershell
# Node.js 버전 확인
node --version
# 예상 출력: v20.x.x 또는 v18.x.x

# npm 버전 확인
npm --version
# 예상 출력: 10.x.x 또는 9.x.x
```

## 🔧 설치 후 다음 단계

### 1. 프로젝트 디렉토리로 이동
```powershell
cd c:\moviessam2\mvdebate
```

### 2. 의존성 설치
```powershell
npm install
```

### 3. API 키 설정
`.env.local` 파일 생성:
```env
UPSTAGE_API_KEY=your_upstage_api_key_here
```

### 4. 개발 서버 실행
```powershell
npm run dev
```

## ⚠️ 문제 해결

### "node is not recognized"
- 설치 후 **새 PowerShell 창**을 열어야 합니다
- 또는 컴퓨터 재시작

### "npm is not recognized"
- Node.js 설치 시 npm이 함께 설치됩니다
- 설치가 완료되지 않았을 수 있습니다
- Node.js 재설치 시도

### 권한 오류
- 관리자 권한으로 PowerShell 실행
- 또는 사용자 디렉토리에 설치

## 📝 빠른 체크리스트

- [ ] Node.js LTS 버전 다운로드
- [ ] 설치 파일 실행
- [ ] "Add to PATH" 확인
- [ ] 새 PowerShell 창 열기
- [ ] `node --version` 확인
- [ ] `npm --version` 확인
- [ ] 프로젝트 디렉토리로 이동
- [ ] `npm install` 실행
- [ ] `.env.local` 파일 생성
- [ ] `npm run dev` 실행

## 🎯 설치 완료 후

설치가 완료되면 다음 명령어로 프로젝트를 실행할 수 있습니다:

```powershell
cd c:\moviessam2\mvdebate
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 확인하세요!
