# Node.js 설치 가이드 (Windows)

## 방법 1: 공식 웹사이트에서 설치 (권장)

### 1단계: Node.js 다운로드
1. 브라우저에서 https://nodejs.org/ 접속
2. **LTS 버전** (Long Term Support) 다운로드 클릭
   - 예: `v20.x.x LTS` 또는 `v18.x.x LTS`
   - Windows Installer (.msi) 파일 다운로드

### 2단계: 설치 실행
1. 다운로드한 `.msi` 파일 실행
2. 설치 마법사에서:
   - ✅ "Add to PATH" 옵션 체크 (기본적으로 체크됨)
   - ✅ "Install npm package manager" 체크
   - "Next" 클릭하여 설치 진행
3. 설치 완료 후 **컴퓨터 재시작** (권장)

### 3단계: 설치 확인
PowerShell 또는 명령 프롬프트에서:
```powershell
node --version
npm --version
```

정상적으로 설치되었다면 버전 번호가 표시됩니다:
```
v20.11.0
10.2.4
```

## 방법 2: Chocolatey 사용 (고급 사용자)

Chocolatey가 설치되어 있다면:
```powershell
choco install nodejs-lts
```

## 방법 3: winget 사용 (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## 설치 후 확인

### 1. 터미널 재시작
설치 후 **새 터미널 창**을 열어야 PATH가 업데이트됩니다.

### 2. 버전 확인
```powershell
node --version
npm --version
```

### 3. 프로젝트 디렉토리로 이동
```powershell
cd c:\moviessam2\mvdebate
```

### 4. 의존성 설치
```powershell
npm install
```

### 5. 개발 서버 실행
```powershell
npm run dev
```

## 문제 해결

### "node: command not found" 에러
- 터미널을 완전히 종료하고 새로 열기
- 컴퓨터 재시작
- 환경 변수 PATH 확인

### 설치 확인
```powershell
# Node.js 설치 경로 확인
where.exe node
where.exe npm
```

### 수동 PATH 추가 (필요한 경우)
1. Windows 설정 → 시스템 → 정보 → 고급 시스템 설정
2. 환경 변수 클릭
3. 시스템 변수에서 "Path" 선택 → 편집
4. Node.js 설치 경로 추가 (예: `C:\Program Files\nodejs\`)

## 다음 단계

Node.js 설치가 완료되면:
1. ✅ `npm install` - 의존성 설치
2. ✅ `.env.local` 파일 생성 (API 키 추가)
3. ✅ `npm run dev` - 개발 서버 실행

