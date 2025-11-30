# ✅ 프로젝트 실행 준비 완료 가이드

## 현재 상태

- ✅ Node.js 설치 완료
- ✅ npm 설치 완료
- ✅ 프로젝트 구조 확인 완료

## 다음 단계

### 1. 의존성 설치

프로젝트 디렉토리에서 다음 명령어를 실행하세요:

```powershell
cd c:\moviessam2\mvdebate
npm install
```

**예상 소요 시간**: 1-3분 (인터넷 속도에 따라 다름)

**예상 출력**:
```
added 500 packages, and audited 501 packages in 2m
```

### 2. API 키 설정

`.env.local` 파일을 생성하고 Upstage API 키를 입력하세요:

```powershell
# 방법 1: PowerShell에서 직접 생성
@"
UPSTAGE_API_KEY=your_actual_api_key_here
"@ | Out-File -FilePath .env.local -Encoding utf8

# 방법 2: 텍스트 에디터로 .env.local 파일 생성
# 내용: UPSTAGE_API_KEY=your_actual_api_key_here
```

**중요**: 
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- `your_actual_api_key_here` 부분을 실제 Upstage API 키로 교체하세요

### 3. 프로젝트 실행

의존성 설치와 API 키 설정이 완료되면 다음 명령어로 개발 서버를 실행하세요:

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

### 4. 브라우저에서 확인

개발 서버가 실행되면 브라우저에서 다음 주소로 접속하세요:

```
http://localhost:3000
```

## 문제 해결

### npm install 실패 시

**오류**: `npm ERR! code ENOTFOUND`
- **원인**: 인터넷 연결 문제
- **해결**: 인터넷 연결 확인 후 재시도

**오류**: `npm ERR! code EACCES`
- **원인**: 권한 문제
- **해결**: 관리자 권한으로 PowerShell 실행

### API 키 오류 시

**오류**: `UPSTAGE_API_KEY is not set`
- **원인**: `.env.local` 파일이 없거나 API 키가 설정되지 않음
- **해결**: `.env.local` 파일 생성 및 API 키 확인

**오류**: `Upstage API request failed: 401`
- **원인**: 잘못된 API 키
- **해결**: Upstage API 키 확인 및 재설정

### 포트 충돌 시

**오류**: `Port 3000 is already in use`
- **원인**: 다른 프로세스가 3000 포트 사용 중
- **해결**: 
  ```powershell
  # 다른 포트로 실행
  $env:PORT=3001; npm run dev
  ```

## 체크리스트

실행 전 확인사항:

- [ ] Node.js 설치 확인 (`node -v`)
- [ ] npm 설치 확인 (`npm -v`)
- [ ] 의존성 설치 완료 (`npm install`)
- [ ] `.env.local` 파일 생성
- [ ] Upstage API 키 입력
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 브라우저에서 http://localhost:3000 접속

## 다음 단계

프로젝트가 정상적으로 실행되면:

1. **홈 화면** (`/`)에서 이름 입력 후 토론 시작
2. **토론 주제 선택** - 100개의 랜덤 주제 중 선택
3. **입장 선택** - 찬성/반대 선택
4. **AI와 채팅** - 주장, 근거, 자료를 정리하며 토론 연습
5. **교사용 대시보드** (`/teacher`)에서 학생 기록 확인

---

**준비가 완료되면 `npm run dev` 명령어로 개발 서버를 실행하세요!** 🚀





