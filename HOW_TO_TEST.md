# 🧪 프로젝트 실행 및 테스트 가이드

## 실행 확인 방법

Next.js 프로젝트는 **HTML 파일이 아닌 개발 서버**를 통해 실행됩니다.

---

## 1️⃣ 빌드 테스트 (코드 오류 확인)

프로젝트가 정상적으로 빌드되는지 확인:

```powershell
cd c:\moviessam2\mvdebate
npm run build
```

**성공 시 예상 출력**:
```
> mvdebate@1.0.0 build
> next build

▲ Next.js 14.0.0
- Creating an optimized production build
- Compiled successfully
- Linting and checking validity of types
- Collecting page data
- Generating static pages (X/X)
- Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                     XXX B    XXX kB
├ ○ /debate                               XXX B    XXX kB
└ ○ /teacher                              XXX B    XXX kB

○  (Static)  prerendered as static content
```

**실패 시**: TypeScript 오류나 import 오류가 표시됩니다.

---

## 2️⃣ 개발 서버 실행 (실제 테스트)

### 실행 방법

```powershell
cd c:\moviessam2\mvdebate
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

### 브라우저에서 확인

1. 개발 서버가 실행되면 브라우저를 엽니다
2. 주소창에 입력: `http://localhost:3000`
3. 홈 화면이 표시되면 성공!

---

## 3️⃣ 확인할 화면들

### ✅ 홈 화면 (`http://localhost:3000`)
- 제목: "AI랑 연습하는 토론 교실"
- 이름 입력 필드
- "토론 연습 시작하기" 버튼
- "교사용 토론 대시보드 보기" 버튼

### ✅ 토론 페이지 (`http://localhost:3000/debate?nickname=테스트`)
- 주제 선택 화면
- 입장 선택 (찬성/반대)
- 채팅 패널
- 주장 구조 패널

### ✅ 교사용 대시보드 (`http://localhost:3000/teacher`)
- 토론 기록 목록 테이블
- 필터 기능
- CSV/PDF 내보내기 버튼

---

## 4️⃣ HTML 파일이 아닌 이유

Next.js는 **서버 사이드 렌더링(SSR)** 프레임워크입니다:

- ❌ **정적 HTML 파일이 아님**
- ✅ **개발 서버가 필요함** (`npm run dev`)
- ✅ **프로덕션 빌드 후 서버 실행** (`npm run build` → `npm run start`)

### 정적 HTML로 내보내기 (선택사항)

만약 정적 HTML 파일이 필요하다면:

```powershell
# next.config.js에 output: 'export' 추가 필요
npm run build
# .next/out 폴더에 HTML 파일 생성됨
```

하지만 현재 프로젝트는 API 라우트를 사용하므로 서버가 필요합니다.

---

## 5️⃣ 문제 해결

### 포트가 이미 사용 중일 때

```powershell
# 다른 포트로 실행
$env:PORT=3001; npm run dev
# 브라우저에서 http://localhost:3001 접속
```

### API 키 오류

```
UPSTAGE_API_KEY is not set
```

**해결**: `.env.local` 파일 생성 및 API 키 입력

### 빌드 오류

TypeScript 오류나 import 오류가 표시되면:
1. 오류 메시지 확인
2. 해당 파일 수정
3. 다시 빌드

---

## 6️⃣ 빠른 체크리스트

실행 전 확인:
- [ ] `npm install` 완료
- [ ] `.env.local` 파일 생성 및 API 키 입력
- [ ] `npm run build` 성공 (선택사항, 오류 확인용)

실행:
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 `http://localhost:3000` 접속
- [ ] 홈 화면 표시 확인
- [ ] 토론 페이지 이동 확인
- [ ] 교사용 대시보드 확인

---

## 요약

**실행 확인 방법**:
1. ✅ `npm run build` - 코드 오류 확인
2. ✅ `npm run dev` - 개발 서버 실행
3. ✅ 브라우저에서 `http://localhost:3000` 접속
4. ✅ 화면이 정상적으로 표시되는지 확인

**HTML 파일이 아닙니다!** Next.js는 서버가 필요한 프레임워크입니다.





