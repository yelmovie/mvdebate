# 🔧 프로젝트 리팩터링 보고서

## 📋 1단계: 프로젝트 전체 스캔 결과

### ✅ 핵심 기능 (유지)
- ✅ AI와 모의 토론 기능 (학생-AI 토론 배틀, 20턴 제한, 주제 유지)
- ✅ 교사용 대시보드 (토론 결과 조회, 필터링, 리포트)
- ✅ 선생님 관리 탭 (이름/별명 + 이메일 등록/수정)
- ✅ 토론 결과/요약을 선생님 이메일로 보내는 기능
- ✅ Upstage API 호출 로직 (LLM 호출, 요약/채점)

---

## 🚨 발견된 문제점

### 1. 사용하지 않는 파일/폴더

#### 빈 폴더 (삭제 가능)
- `src/hooks/` - 비어있음
- `src/pages/` - Pages Router 사용 안 함 (App Router 사용 중)
- `src/services/api/` - 비어있음
- `src/services/storage/` - 비어있음
- `src/stores/` - 비어있음 (실제는 `src/store/` 사용)

#### 사용하지 않는 유틸리티 파일
- `src/utils/errorHandler.ts` - 정의만 있고 실제 사용 안 함
- `src/utils/validators.ts` - 정의만 있고 실제 사용 안 함

#### 중복 문서 파일 (정리 필요)
- 루트에 20개 이상의 `.md` 파일 (설정 가이드, 체크리스트 등)
- 실제로 필요한 것만 남기고 정리 필요

---

### 2. 중복 코드

#### API 라우트 중복 패턴
- 모든 API 라우트에서 동일한 에러 핸들링 패턴 반복
- `console.error` 로깅 패턴 중복

#### 선생님 저장소 접근 중복
- `src/app/api/teachers/route.ts`에서 `addTeacherServer`, `removeTeacherServer` 함수 호출하지만 정의되지 않음
- 실제로는 `teacherStorage.ts`의 함수를 사용해야 함

#### localStorage 접근 패턴 중복
- 여러 파일에서 동일한 `isBrowser()` 체크 패턴 반복

---

### 3. 보안 이슈

#### ✅ 안전한 부분
- ✅ Upstage API 키는 `process.env.UPSTAGE_API_KEY`로만 접근
- ✅ 모든 Upstage 호출은 서버 사이드 API 라우트에서만 실행
- ✅ 클라이언트 코드에서 API 키 직접 접근 없음

#### ⚠️ 개선 필요
- `console.log`에서 이메일 주소 출력 (민감 정보 노출 가능성)
- 에러 메시지에 상세 정보 포함 (프로덕션에서는 제한 필요)

---

### 4. 버그

#### API 라우트 버그
1. **`src/app/api/teachers/route.ts`**
   - `addTeacherServer`, `removeTeacherServer` 함수가 정의되지 않음
   - 실제로는 `addTeacher`, `removeTeacher`를 사용해야 함

2. **`src/app/api/debate/turn/route.ts`**
   - `topicTitle`, `stance` 파라미터를 받지만 사용하지 않음
   - `debateService.ts`에서는 전달하지만 API 라우트에서 무시됨

3. **`src/app/api/debate/summarize/route.ts`**
   - `sendDebateMessage` import 누락

4. **`src/app/api/debate/send-summary/route.ts`**
   - 서버 사이드에서 localStorage 접근 시도 (불가능)
   - 실제로는 클라이언트에서만 작동하도록 수정 필요

---

### 5. 훅 규칙 위반 가능성

#### 확인 필요
- 모든 컴포넌트에서 훅이 조건부 return 이전에 호출되는지 확인
- `TeacherDashboardPage`는 이미 수정됨 ✅

---

## 📝 리팩터링 계획

### 1단계: 안전한 정리 (Unused Code 제거)
1. 빈 폴더 제거
2. 사용하지 않는 유틸리티 파일 제거 또는 사용처 추가
3. 중복 문서 파일 정리

### 2단계: 버그 수정
1. API 라우트 버그 수정 (`teachers`, `turn`, `summarize`, `send-summary`)
2. 함수 정의 누락 수정

### 3단계: 중복 코드 통합
1. 공용 에러 핸들링 유틸 생성
2. localStorage 접근 패턴 통합

### 4단계: 보안 강화
1. console.log에서 민감 정보 제거
2. 에러 메시지 일반화

### 5단계: 타입/폴더 구조 정리
1. 타입 정의 통합 확인
2. 폴더 구조 정리

---

## 🔒 보안 체크리스트

- [x] Upstage API 키는 환경변수로만 접근
- [x] 모든 Upstage 호출은 서버 사이드에서만
- [ ] console.log에서 이메일 주소 제거
- [ ] 에러 메시지 일반화
- [ ] 프로덕션 환경 변수 검증 강화

---

## 📦 다음 단계

리팩터링을 단계별로 진행하겠습니다. 각 단계마다 변경 사항을 요약하고, 핵심 기능이 정상 작동하는지 확인하겠습니다.

