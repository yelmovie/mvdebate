# 🔧 프로젝트 유지보수 체크리스트

## ✅ 리팩터링 완료 사항

### 보안
- [x] Upstage API 키는 환경변수로만 접근
- [x] 모든 Upstage 호출은 서버 사이드에서만
- [x] console.log에서 이메일 주소 제거
- [x] 에러 메시지 일반화
- [x] API 키가 코드에 하드코딩되지 않음

### 코드 품질
- [x] 사용하지 않는 파일 제거 (`errorHandler.ts`, `validators.ts`)
- [x] API 라우트 버그 수정
- [x] 훅 규칙 준수 확인
- [x] 타입 안정성 강화

---

## 📋 프로덕션 배포 전 체크리스트

### 1. 환경 변수 설정
```env
UPSTAGE_API_KEY=your_upstage_api_key_here
MAIL_USER=your_email@example.com  # 이메일 발송용
MAIL_PASS=your_email_password     # 이메일 발송용
```

### 2. DB 연결 (필수)
현재 localStorage를 사용하는 부분을 DB로 교체:

#### `src/app/api/teachers/route.ts`
- `loadTeachersServer()`: DB에서 선생님 목록 조회
- `addTeacherServer()`: DB에 선생님 추가
- `removeTeacherServer()`: DB에서 선생님 삭제

#### `src/app/api/debate/send-summary/route.ts`
- `getTeacherByIdServer()`: DB에서 선생님 정보 조회

#### 예시 (Prisma 사용 시):
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTeacherById(teacherId: string) {
  return await prisma.teacher.findUnique({ where: { id: teacherId } });
}
```

### 3. 이메일 발송 설정
`nodemailer` 라이브러리 설치 및 설정:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

#### `src/app/api/debate/send-summary/route.ts` 수정:
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // 또는 다른 SMTP 서비스
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

await transporter.sendMail({
  from: process.env.MAIL_USER,
  to: teacherEmail,
  subject: `[AI 모의 토론 요약] ${teacherDisplayName} 선생님 - ${topic}`,
  text: [
    `${teacherDisplayName} 선생님께,`,
    "",
    `주제: ${topic}`,
    "",
    "=== 대화 로그 ===",
    log,
  ].join("\n"),
});
```

### 4. 빌드 및 테스트
```bash
# 타입 체크
npm run build

# 린트 체크
npm run lint

# 개발 서버 실행
npm run dev
```

---

## 🚨 보안 주의사항

### 절대 하지 말 것
- ❌ API 키를 코드에 하드코딩
- ❌ 클라이언트 코드에서 API 키 접근
- ❌ console.log에 민감 정보 출력
- ❌ `.env.local` 파일을 Git에 커밋

### 반드시 해야 할 것
- ✅ 모든 API 키는 환경변수로 관리
- ✅ Upstage 호출은 서버 사이드에서만
- ✅ 이메일 주소는 로그에 출력하지 않음
- ✅ 에러 메시지는 일반화

---

## 📝 코드 작성 규칙

### 1. 훅 사용 규칙
- 모든 훅은 컴포넌트 상단에서 조건 없이 호출
- 조건부 return은 모든 훅 정의 이후에

```typescript
// ✅ 올바른 예
function MyComponent() {
  const [state, setState] = useState("");
  useEffect(() => {}, []);
  
  if (!condition) return null; // 훅 이후에 조건부 return
  return <div>...</div>;
}

// ❌ 잘못된 예
function MyComponent() {
  if (!condition) return null; // 훅 이전에 조건부 return
  const [state, setState] = useState(""); // 에러!
  return <div>...</div>;
}
```

### 2. API 라우트 작성 규칙
- 모든 API 호출은 try/catch로 감싸기
- 에러 메시지는 일반화 (민감 정보 제외)
- 환경변수는 `process.env`로만 접근

### 3. 타입 안정성
- 모든 함수에 타입 정의
- `any` 타입 최소화
- 인터페이스는 `types/domain.ts`에 통합

---

## 🔍 정기 점검 사항

### 주간
- [ ] 빌드 성공 여부 확인
- [ ] 린트 에러 확인
- [ ] 환경 변수 설정 확인

### 월간
- [ ] 사용하지 않는 파일 정리
- [ ] 의존성 업데이트 확인
- [ ] 보안 취약점 스캔

### 배포 전
- [ ] 모든 환경 변수 설정
- [ ] DB 연결 테스트
- [ ] 이메일 발송 테스트
- [ ] API 키 유효성 확인

---

## 📚 참고 문서

- `REFACTORING_REPORT.md` - 리팩터링 상세 보고서
- `REFACTORING_SUMMARY.md` - 리팩터링 완료 요약
- `README.md` - 프로젝트 개요

---

**마지막 업데이트**: 리팩터링 완료 시점

