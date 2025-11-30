# ❌ npm 명령어를 찾을 수 없을 때 해결 방법

## 문제 상황

터미널에서 `npm run dev` 실행 시 다음 오류 발생:
```
npm : 'npm' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

## 원인

1. **Node.js가 설치되지 않음**
2. **Node.js는 설치되었지만 PATH 환경 변수에 등록되지 않음**
3. **기존 터미널 세션에 PATH가 반영되지 않음**

---

## 해결 방법

### 방법 1: 새 터미널 창 열기 (가장 간단)

Node.js를 설치한 후 **기존 터미널을 완전히 닫고 새로 열어야** PATH가 업데이트됩니다.

1. 현재 터미널 창을 **완전히 닫기**
2. VS Code를 다시 시작하거나 새 터미널 창 열기
3. 다시 `npm --version` 확인

### 방법 2: Node.js 설치 확인

#### 설치 여부 확인
```powershell
# PowerShell에서 실행
node --version
npm --version
```

#### 설치되지 않은 경우
1. https://nodejs.org/ 접속
2. **LTS 버전** 다운로드 (권장: v20.x.x)
3. 설치 파일 실행
4. 설치 마법사에서 **"Add to PATH"** 옵션 확인 (기본적으로 체크됨)
5. 설치 완료 후 **새 터미널 창** 열기

### 방법 3: PATH 환경 변수 수동 확인/수정

#### 현재 PATH 확인
```powershell
$env:PATH -split ';' | Select-String -Pattern 'node'
```

#### Node.js 설치 경로 확인
일반적으로 다음 경로 중 하나:
- `C:\Program Files\nodejs\`
- `C:\Program Files (x86)\nodejs\`
- `C:\Users\[사용자명]\AppData\Roaming\npm`

#### PATH에 수동 추가 (임시)
```powershell
# 현재 세션에만 적용 (임시)
$env:PATH += ";C:\Program Files\nodejs\"
```

#### PATH에 영구 추가
1. **시작 메뉴** → **"환경 변수"** 검색
2. **"시스템 환경 변수 편집"** 클릭
3. **"환경 변수"** 버튼 클릭
4. **"시스템 변수"** 섹션에서 **"Path"** 선택 → **"편집"** 클릭
5. **"새로 만들기"** 클릭
6. Node.js 설치 경로 추가: `C:\Program Files\nodejs\`
7. **확인** 클릭하여 모든 창 닫기
8. **새 터미널 창** 열기

---

## 설치 후 확인

### 1단계: Node.js 확인
```powershell
node --version
```
**예상 출력**: `v20.11.0` (또는 다른 버전)

### 2단계: npm 확인
```powershell
npm --version
```
**예상 출력**: `10.2.4` (또는 다른 버전)

### 3단계: 설치 경로 확인
```powershell
where node
where npm
```
**예상 출력**: `C:\Program Files\nodejs\node.exe`

---

## 빠른 체크리스트

- [ ] Node.js 설치 확인 (`node --version`)
- [ ] npm 설치 확인 (`npm --version`)
- [ ] 새 터미널 창 열기 (중요!)
- [ ] PATH 환경 변수 확인
- [ ] 프로젝트 디렉토리로 이동 (`cd c:\moviessam2\mvdebate`)
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행

---

## 문제가 계속되면

### 1. Node.js 재설치
1. 기존 Node.js 제거 (제어판 → 프로그램 제거)
2. https://nodejs.org/ 에서 최신 LTS 버전 다운로드
3. 설치 시 **"Add to PATH"** 옵션 확인
4. 설치 완료 후 **컴퓨터 재시작** (권장)

### 2. 관리자 권한으로 실행
PowerShell을 **관리자 권한**으로 실행:
1. 시작 메뉴에서 "PowerShell" 검색
2. **"관리자 권한으로 실행"** 클릭
3. 프로젝트 디렉토리로 이동
4. `npm --version` 확인

### 3. 시스템 재시작
환경 변수 변경 후 시스템을 재시작하면 PATH가 확실히 업데이트됩니다.

---

## 성공 확인

다음 명령어들이 모두 정상 작동하면 성공:

```powershell
node --version    # ✅ v20.x.x
npm --version     # ✅ 10.x.x
where node        # ✅ C:\Program Files\nodejs\node.exe
```

그 다음 프로젝트 실행:

```powershell
cd c:\moviessam2\mvdebate
npm install
npm run dev
```

---

## 요약

**가장 흔한 원인**: Node.js 설치 후 **새 터미널 창을 열지 않음**

**해결책**:
1. ✅ Node.js 설치 확인
2. ✅ **터미널 완전히 닫고 새로 열기** (가장 중요!)
3. ✅ `node --version`, `npm --version` 확인
4. ✅ 프로젝트 실행





