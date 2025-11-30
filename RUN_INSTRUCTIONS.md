# 🚀 프로젝트 실행 가이드

## 현재 상태

- ✅ Node.js 설치 완료
- ✅ API 키 설정 완료 (`.env.local`)
- ⏳ 의존성 설치 필요

## 실행 단계

### 1단계: 의존성 설치

프로젝트 디렉토리에서 다음 명령어를 실행하세요:

```powershell
cd c:\moviessam2\mvdebate
npm install
```

**예상 소요 시간**: 1-3분  
**예상 출력**:
```
added 500 packages, and audited 501 packages in 2m
```

### 2단계: 개발 서버 실행

의존성 설치가 완료되면 다음 명령어로 개발 서버를 실행하세요:

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

### 3단계: 브라우저에서 확인

개발 서버가 실행되면 브라우저에서 다음 주소로 접속하세요:

```
http://localhost:3000
```

## 실행 순서 요약

```powershell
# 1. 프로젝트 디렉토리로 이동
cd c:\moviessam2\mvdebate

# 2. 의존성 설치 (처음 한 번만)
npm install

# 3. 개발 서버 실행
npm run dev
```

## 문제 해결

### npm install 실패 시

**오류**: `npm ERR! code ENOTFOUND`
- 인터넷 연결 확인 후 재시도

**오류**: `npm ERR! code EACCES`
- 관리자 권한으로 PowerShell 실행

### 개발 서버 실행 오류

**오류**: `UPSTAGE_API_KEY is not set`
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바르게 입력되었는지 확인

**오류**: `Port 3000 is already in use`
- 다른 포트로 실행:
  ```powershell
  $env:PORT=3001; npm run dev
  ```

## 완료 체크리스트

- [ ] `npm install` 실행 완료
- [ ] `npm run dev` 실행 완료
- [ ] 브라우저에서 http://localhost:3000 접속 성공
- [ ] 홈 화면이 정상적으로 표시됨

---

**준비가 완료되면 위 순서대로 실행하세요!** 🎉





