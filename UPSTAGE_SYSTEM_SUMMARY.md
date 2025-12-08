# Upstage 기반 시스템 구현 완료 요약

## ✅ 생성된 파일 목록

### 1. Upstage API 클라이언트
- `src/lib/upstage.ts` - Upstage Solar LLM 호출 유틸리티

### 2. API 라우트 (서버 전용)
- `src/app/api/eval/score/route.ts` - 학생 발언 자동 평가
- `src/app/api/report/generate/route.ts` - 학생 리포트 생성
- `src/app/api/portfolio/generate/route.ts` - 포트폴리오 생성
- `src/app/api/battle/match/route.ts` - 배틀 매칭
- `src/app/api/battle/start/route.ts` - 배틀 시작
- `src/app/api/battle/round/route.ts` - 배틀 라운드 처리

### 3. 학생용 페이지
- `src/app/student/report/page.tsx` - 내 토론 리포트
- `src/app/student/portfolio/page.tsx` - 내 성장 포트폴리오
- `src/app/student/battle/page.tsx` - 토론 배틀

### 4. 교사용 페이지
- `src/app/teacher/reports/[id]/page.tsx` - 학생 리포트 상세
- `src/app/teacher/portfolio/[id]/page.tsx` - 학생 포트폴리오 상세
- `src/app/teacher/ranking/page.tsx` - 반별 랭킹 + 배지 시스템
- `src/app/teacher/battle-monitor/page.tsx` - 배틀 실시간 모니터링

### 5. 문서
- `FIRESTORE_SCHEMA.md` - Firestore 스키마 정의

---

## 🎯 주요 기능

### 1. 학생 발언 자동 평가
- Upstage AI가 발언을 5개 항목(논리성, 명확성, 근거, 공감, 참여도)으로 평가
- 0-100점 점수 제공
- `/api/eval/score` 엔드포인트 사용

### 2. 학생 리포트 자동 생성
- 토론 로그를 분석하여 리포트 생성
- 강점, 개선점, 점수 추이 분석
- `/api/report/generate` 엔드포인트 사용

### 3. 성장 포트폴리오
- 학기 전체 성장 기록 요약
- 레벨 시스템 (초급/중급/상급/마스터)
- 배지 및 키워드 클라우드
- `/api/portfolio/generate` 엔드포인트 사용

### 4. 반별 랭킹 시스템
- 학생별 평균 점수 기반 랭킹
- 성장률 계산 및 배지 자동 지급
- `/teacher/ranking` 페이지

### 5. 토론 배틀 시스템
- 실시간 1:1 토론 배틀
- Upstage AI가 주제 자동 생성
- 실시간 모니터링 가능
- `/student/battle` 및 `/teacher/battle-monitor` 페이지

---

## 🔧 환경 변수 설정

`.env.local` 파일에 다음을 추가하세요:

```env
UPSTAGE_API_KEY=your_upstage_api_key_here
```

---

## 📊 Firestore 컬렉션

새로 추가된 컬렉션:
- `debateLogs` - 학생 발언 로그
- `studentReports` - 학생 리포트
- `portfolios` - 학생 포트폴리오
- `battleQueue` - 배틀 대기 큐
- `battles` - 토론 배틀

기존 컬렉션은 절대 수정하지 않았습니다.

---

## 🎨 UI 스타일

모든 페이지는 MovieSSam glassmorphism 스타일을 유지합니다:
- `bg-white/10 backdrop-blur-xl rounded-3xl`
- `border border-white/20`
- Purple/Pink gradient 버튼

---

## ⚠️ 중요 사항

1. **기존 코드 수정 없음**: 모든 기능은 신규 파일로만 추가되었습니다.
2. **서버 전용 API**: 모든 Upstage 호출은 서버 라우트에서만 수행됩니다.
3. **보안**: API 키는 환경 변수로만 관리됩니다.
4. **민감 정보**: 학생 이름, 번호, 반코드 외의 개인정보는 저장하지 않습니다.

---

## 🚀 사용 방법

### 학생
1. 토론 참여 후 `/student/report`에서 리포트 생성
2. `/student/portfolio`에서 포트폴리오 확인
3. `/student/battle`에서 배틀 참가

### 교사
1. `/teacher/ranking`에서 반별 랭킹 확인
2. `/teacher/reports/[id]`에서 학생 리포트 상세 확인
3. `/teacher/portfolio/[id]`에서 학생 포트폴리오 확인
4. `/teacher/battle-monitor`에서 실시간 배틀 모니터링

---

## 📝 다음 단계

1. Firestore 인덱스 생성 (FIRESTORE_SCHEMA.md 참조)
2. `.env.local`에 `UPSTAGE_API_KEY` 설정
3. 테스트 및 디버깅
4. Cloud Functions로 7일 후 로그 자동 삭제 설정 (선택)

