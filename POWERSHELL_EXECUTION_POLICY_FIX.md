# 🔧 PowerShell 실행 정책 오류 해결 방법

## 문제 상황

`npm run dev` 실행 시 다음 오류 발생:
```
npm : 이 시스템에서 스크립트를 실행할 수 없으므로 C:\Program Files\nodejs\npm.ps1 파일을 로드할 수 없습니다.
PSSecurityException: UnauthorizedAccess
```

## 원인

PowerShell의 실행 정책(Execution Policy)이 스크립트 실행을 차단하고 있습니다.

---

## 해결 방법 (3가지)

### 방법 1: npm.cmd 사용 (가장 간단) ⭐ 권장

PowerShell에서 `npm` 대신 `npm.cmd`를 사용:

```powershell
cd c:\moviessam2\mvdebate
npm.cmd install
npm.cmd run dev
```

또는 별칭(alias) 설정:

```powershell
Set-Alias -Name npm -Value npm.cmd
npm install
npm run dev
```

---

### 방법 2: 실행 정책 변경 (영구 해결)

#### 현재 실행 정책 확인
```powershell
Get-ExecutionPolicy
```

#### 실행 정책 변경 (현재 사용자만)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**설명**:
- `RemoteSigned`: 로컬 스크립트는 서명 없이 실행 가능, 원격 스크립트는 서명 필요
- `CurrentUser`: 현재 사용자에게만 적용 (관리자 권한 불필요)

#### 확인
```powershell
Get-ExecutionPolicy
# 출력: RemoteSigned
```

이제 `npm` 명령어가 정상 작동합니다:
```powershell
npm --version
npm install
npm run dev
```

---

### 방법 3: CMD 사용 (대안)

PowerShell 대신 **명령 프롬프트(CMD)** 사용:

1. VS Code에서 터미널 종류 변경:
   - 터미널 상단의 "powershell" 드롭다운 클릭
   - "명령 프롬프트" 또는 "Command Prompt" 선택

2. 또는 새 CMD 창 열기:
   - `Win + R` → `cmd` 입력 → Enter

3. 프로젝트 디렉토리로 이동 후 실행:
```cmd
cd c:\moviessam2\mvdebate
npm install
npm run dev
```

---

## 빠른 해결 (복사해서 실행)

PowerShell에서 다음 명령어를 한 줄씩 실행:

```powershell
# 1. 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. 확인
Get-ExecutionPolicy

# 3. npm 확인
npm --version

# 4. 프로젝트로 이동
cd c:\moviessam2\mvdebate

# 5. 의존성 설치 (아직 안 했다면)
npm install

# 6. 개발 서버 실행
npm run dev
```

---

## 실행 정책 옵션 설명

| 정책 | 설명 | 권장도 |
|------|------|--------|
| `Restricted` | 모든 스크립트 실행 차단 | ❌ |
| `AllSigned` | 서명된 스크립트만 실행 | ⚠️ |
| `RemoteSigned` | 로컬 스크립트 실행 허용 | ✅ 권장 |
| `Unrestricted` | 모든 스크립트 실행 허용 | ⚠️ 보안 위험 |

**권장**: `RemoteSigned` (로컬 스크립트는 안전하게 실행 가능)

---

## 문제가 계속되면

### 1. 관리자 권한으로 실행 정책 변경
```powershell
# 관리자 권한 PowerShell에서
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### 2. Node.js 재설치 확인
- Node.js가 정상 설치되었는지 확인:
```powershell
node --version
where.exe node
```

### 3. PATH 환경 변수 확인
```powershell
$env:PATH -split ';' | Select-String -Pattern 'node'
```

---

## 성공 확인

다음 명령어들이 모두 정상 작동하면 성공:

```powershell
Get-ExecutionPolicy    # ✅ RemoteSigned
npm --version          # ✅ 10.x.x
node --version         # ✅ v20.x.x
```

그 다음 프로젝트 실행:

```powershell
cd c:\moviessam2\mvdebate
npm install
npm run dev
```

---

## 요약

1. **가장 빠른 방법**: `npm.cmd` 사용
2. **영구 해결**: 실행 정책을 `RemoteSigned`로 변경
3. **대안**: CMD 사용

**권장 순서**:
1. 방법 2 (실행 정책 변경) → 영구 해결
2. 방법 1 (npm.cmd) → 빠른 우회
3. 방법 3 (CMD) → 대안



