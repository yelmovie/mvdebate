# Node.js 설치 진단 보고서

## 📋 진단 결과

### 1. Node.js 설치 상태
**❌ Node.js가 설치되어 있지 않습니다.**

- `node -v`: 명령을 찾을 수 없음
- `npm -v`: 명령을 찾을 수 없음
- `where node`: 경로를 찾을 수 없음
- `where npm`: 경로를 찾을 수 없음
- PATH 환경 변수: Node.js 관련 경로 없음

---

## 2. 설치해야 할 버전

### ✅ 권장 버전: Node.js 20.x LTS (Long Term Support)

**현재 LTS 버전**: Node.js 20.11.0 이상 (2024년 11월 기준)

**다운로드 링크**: https://nodejs.org/

**설치 파일**: 
- Windows: `node-v20.x.x-x64.msi` (64-bit)
- macOS: `node-v20.x.x.pkg`
- Linux: 패키지 매니저 사용

---

## 3. PATH 환경 변수 문제 해결

### Windows에서 PATH 수정 방법

#### 방법 1: 시스템 속성에서 수정 (권장)
1. **시작 메뉴** → **"환경 변수"** 검색
2. **"시스템 환경 변수 편집"** 클릭
3. **"환경 변수"** 버튼 클릭
4. **"시스템 변수"** 섹션에서 **"Path"** 선택 → **"편집"** 클릭
5. **"새로 만들기"** 클릭
6. 다음 경로 추가:
   ```
   C:\Program Files\nodejs\
   ```
7. **확인** 클릭하여 모든 창 닫기
8. **새 PowerShell/CMD 창** 열기

#### 방법 2: PowerShell에서 직접 수정 (임시)
```powershell
# 현재 세션에만 적용 (임시)
$env:PATH += ";C:\Program Files\nodejs\"
```

#### 방법 3: 설치 시 자동 추가
- Node.js 설치 시 **"Add to PATH"** 옵션 체크 (기본적으로 체크됨)
- 설치 후 **새 터미널 창** 열기

### macOS에서 PATH 수정 방법

#### 방법 1: ~/.zshrc 또는 ~/.bash_profile 수정
```bash
# zsh 사용 시
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# bash 사용 시
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

#### 방법 2: Homebrew로 설치 (권장)
```bash
brew install node
```

---

## 4. 설치 후 검증 명령어

### 기본 검증
```powershell
# Node.js 버전 확인
node -v

# npm 버전 확인
npm -v

# 설치 경로 확인
where node    # Windows
which node    # macOS/Linux
```

### 예상 출력
```
v20.11.0
10.2.4
C:\Program Files\nodejs\node.exe
```

---

## 5. Hello Test 스크립트 검증

### 테스트 파일 생성 및 실행

**Windows PowerShell:**
```powershell
# 1. 테스트 파일 생성
@"
console.log('✅ Node.js is working correctly!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
"@ | Out-File -FilePath hello-test.js -Encoding utf8

# 2. 실행
node hello-test.js
```

**macOS/Linux:**
```bash
# 1. 테스트 파일 생성
cat > hello-test.js << 'EOF'
console.log('✅ Node.js is working correctly!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
EOF

# 2. 실행
node hello-test.js
```

### 예상 출력
```
✅ Node.js is working correctly!
Node.js version: v20.11.0
Platform: win32
```

---

## 6. 설치 체크리스트

- [ ] Node.js LTS 버전 다운로드 (https://nodejs.org/)
- [ ] 설치 파일 실행 (.msi 또는 .pkg)
- [ ] 설치 마법사에서 "Add to PATH" 옵션 확인
- [ ] 설치 완료 후 **새 터미널 창** 열기
- [ ] `node -v` 명령어로 버전 확인
- [ ] `npm -v` 명령어로 npm 확인
- [ ] `hello-test.js` 파일로 동작 검증

---

## 7. 문제 해결

### "node: command not found" 오류
- **원인**: PATH 환경 변수에 Node.js 경로가 없음
- **해결**: 위의 "PATH 환경 변수 문제 해결" 섹션 참조

### 설치 후에도 인식되지 않음
- **원인**: 기존 터미널 세션에 PATH가 반영되지 않음
- **해결**: 터미널을 완전히 종료하고 새로 열기

### 버전이 예상과 다름
- **원인**: 이전 버전이 설치되어 있거나 PATH 우선순위 문제
- **해결**: 
  ```powershell
  # Windows에서 설치 경로 확인
  where.exe node
  
  # 모든 Node.js 경로 확인
  Get-Command node -All
  ```

---

## 📝 다음 단계

Node.js 설치가 완료되면:

1. 프로젝트 디렉토리로 이동
   ```powershell
   cd c:\moviessam2\mvdebate
   ```

2. 의존성 설치
   ```powershell
   npm install
   ```

3. API 키 설정 (`.env.local` 파일 생성)
   ```env
   UPSTAGE_API_KEY=your_api_key_here
   ```

4. 개발 서버 실행
   ```powershell
   npm run dev
   ```





