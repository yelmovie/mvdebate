# 📦 npm install 상태 확인

## 확인 방법

### 1. node_modules 폴더 확인

프로젝트 루트에 `node_modules` 폴더가 있는지 확인:

```powershell
cd c:\moviessam2\mvdebate
Test-Path node_modules
```

**결과**:
- `True` → 의존성 설치 완료
- `False` → `npm install` 실행 필요

### 2. package-lock.json 확인

```powershell
Test-Path package-lock.json
```

**결과**:
- `True` → 설치 완료
- `False` → 설치 필요

### 3. 설치된 패키지 확인

```powershell
npm list --depth=0
```

**예상 출력**:
```
mvdebate@1.0.0
├── next@14.0.0
├── react@18.2.0
├── react-dom@18.2.0
└── zustand@4.4.0
```

---

## npm install 실행

### 정상 실행 시

```powershell
cd c:\moviessam2\mvdebate
npm install
```

**예상 출력**:
```
added 500 packages, and audited 501 packages in 2m

found 0 vulnerabilities
```

**생성되는 파일/폴더**:
- `node_modules/` 폴더 (의존성 패키지들)
- `package-lock.json` 파일 (버전 고정)

### 실행 시간

- **첫 설치**: 1-3분 (인터넷 속도에 따라 다름)
- **재설치**: 30초-1분

---

## 문제 해결

### npm install 실패 시

#### 오류: `npm ERR! code ENOTFOUND`
- **원인**: 인터넷 연결 문제
- **해결**: 인터넷 연결 확인 후 재시도

#### 오류: `npm ERR! code EACCES`
- **원인**: 권한 문제
- **해결**: 관리자 권한으로 PowerShell 실행

#### 오류: `npm ERR! Cannot find module`
- **원인**: package.json 손상 또는 누락
- **해결**: `package.json` 파일 확인

---

## 설치 확인 체크리스트

- [ ] `node_modules/` 폴더 존재
- [ ] `package-lock.json` 파일 존재
- [ ] `npm list --depth=0` 명령어 정상 작동
- [ ] 주요 패키지 확인:
  - [ ] next
  - [ ] react
  - [ ] react-dom
  - [ ] zustand

---

## 다음 단계

의존성 설치가 완료되면:

1. **환경 변수 설정** (`.env.local` 파일)
2. **개발 서버 실행**: `npm run dev`
3. **브라우저에서 확인**: `http://localhost:3000`

---

## 빠른 확인 명령어

```powershell
# 1. node_modules 확인
Test-Path node_modules

# 2. 패키지 목록 확인
npm list --depth=0

# 3. npm 버전 확인
npm --version

# 4. 설치된 패키지 수 확인
(Get-ChildItem node_modules -Directory).Count
```





