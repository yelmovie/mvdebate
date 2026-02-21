# 🧩 UI 공통 컴포넌트 가이드

## 📦 설치 및 사용

모든 컴포넌트는 `/src/app/components/ui/` 에 있으며, index.ts를 통해 쉽게 import할 수 있습니다.

```tsx
import { Button, Card, Input, Badge, Modal, Toast, toast } from './components/ui';
```

## 1. BUTTON

### Variants
- **primary**: Gradient 배경, 그림자 효과
- **secondary**: Outlined 스타일
- **ghost**: 투명 배경, hover 효과
- **danger**: 빨간색 gradient (삭제 등)
- **success**: 녹색 gradient (완료 등)

### Sizes
- **sm**: 36px 높이
- **md**: 44px 높이 (기본값)
- **lg**: 52px 높이

### 예제

```tsx
import { Button } from './components/ui';
import { Send, Trash2 } from 'lucide-react';

// Primary 버튼
<Button variant="primary" size="md">
  저장하기
</Button>

// 아이콘이 있는 버튼
<Button variant="secondary" size="sm" icon={<Send className="w-4 h-4" />}>
  전송
</Button>

// 로딩 상태
<Button variant="primary" loading={true}>
  저장 중...
</Button>

// Danger 버튼
<Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
  삭제
</Button>

// Ghost 버튼
<Button variant="ghost" onClick={() => console.log('Clicked')}>
  취소
</Button>
```

---

## 2. CARD

### Variants
- **default**: 기본 그림자
- **elevated**: 강한 그림자
- **outlined**: 테두리 스타일

### Props
- **hoverable**: hover 시 lift 효과
- **selected**: 선택 상태 (링 효과)

### 예제

```tsx
import { Card, CardHeader, CardContent, CardFooter } from './components/ui';

// 기본 카드
<Card>
  <CardContent>
    <p>카드 내용</p>
  </CardContent>
</Card>

// 구조화된 카드
<Card variant="elevated" hoverable>
  <CardHeader>
    <h3 className="text-lg font-bold">카드 제목</h3>
  </CardHeader>
  <CardContent>
    <p>카드 본문 내용</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">액션</Button>
  </CardFooter>
</Card>

// 선택 가능한 카드
<Card 
  hoverable 
  selected={isSelected}
  onClick={() => setIsSelected(!isSelected)}
>
  <CardContent>
    <p>클릭해서 선택하세요</p>
  </CardContent>
</Card>
```

---

## 3. INPUT

### Props
- **label**: 라벨 텍스트
- **error**: 에러 메시지 (빨간색 표시)
- **helper**: 도움말 텍스트
- **leftIcon**: 왼쪽 아이콘
- **rightIcon**: 오른쪽 아이콘

### 예제

```tsx
import { Input, Textarea } from './components/ui';
import { Search, Mail } from 'lucide-react';

// 기본 입력
<Input 
  label="이름" 
  placeholder="이름을 입력하세요"
/>

// 아이콘이 있는 입력
<Input
  label="이메일"
  placeholder="email@example.com"
  leftIcon={<Mail className="w-5 h-5" />}
/>

// 검색 입력
<Input
  placeholder="검색..."
  leftIcon={<Search className="w-5 h-5" />}
/>

// 에러 상태
<Input
  label="비밀번호"
  type="password"
  error="비밀번호는 최소 8자 이상이어야 합니다"
/>

// 도움말이 있는 입력
<Input
  label="사용자 이름"
  helper="영문, 숫자, 밑줄만 사용 가능합니다"
/>

// Textarea
<Textarea
  label="의견"
  rows={4}
  placeholder="의견을 입력하세요..."
/>
```

---

## 4. BADGE

### Variants
- **default**: 회색 배경
- **success**: 녹색 (성공, 완료)
- **warning**: 노란색 (경고, 대기)
- **error**: 빨간색 (오류, 거부)
- **info**: 파란색 (정보)

### Sizes
- **sm**: 작은 크기
- **md**: 중간 크기 (기본값)

### 예제

```tsx
import { Badge } from './components/ui';
import { Check, AlertTriangle } from 'lucide-react';

// 기본 뱃지
<Badge variant="default">기본</Badge>

// 성공 뱃지
<Badge variant="success" icon={<Check className="w-3 h-3" />}>
  완료
</Badge>

// 경고 뱃지
<Badge variant="warning" size="sm">
  대기 중
</Badge>

// 에러 뱃지
<Badge variant="error">
  오류
</Badge>

// 정보 뱃지
<Badge variant="info">
  새 메시지 3개
</Badge>
```

---

## 5. MODAL

### Sizes
- **sm**: 작은 모달 (max-w-md)
- **md**: 중간 모달 (max-w-2xl) - 기본값
- **lg**: 큰 모달 (max-w-4xl)
- **xl**: 매우 큰 모달 (max-w-6xl)

### Props
- **isOpen**: 모달 표시 여부
- **onClose**: 닫기 핸들러
- **title**: 모달 제목
- **showCloseButton**: X 버튼 표시 여부

### 예제

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter, Button } from './components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        모달 열기
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="확인"
        size="md"
      >
        <p>정말로 삭제하시겠습니까?</p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </Modal>

      {/* 커스텀 구조 */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <h2 className="text-xl font-bold">커스텀 헤더</h2>
        </ModalHeader>
        <ModalContent>
          <p>모달 내용</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary">취소</Button>
          <Button variant="primary">확인</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

---

## 6. TOAST

### Variants
- **success**: 녹색 (성공 메시지)
- **error**: 빨간색 (오류 메시지)
- **warning**: 노란색 (경고 메시지)
- **info**: 파란색 (정보 메시지)

### Positions
- **top-right**: 우측 상단 (기본값)
- **top-left**: 좌측 상단
- **bottom-right**: 우측 하단
- **bottom-left**: 좌측 하단
- **top-center**: 중앙 상단
- **bottom-center**: 중앙 하단

### 설정

**1. App.tsx에 ToastContainer 추가**

```tsx
import { ToastContainer } from './components/ui';

export default function App() {
  return (
    <div>
      {/* 앱 컨텐츠 */}
      <ToastContainer />
    </div>
  );
}
```

**2. Toast 사용**

```tsx
import { toast } from './components/ui';

function MyComponent() {
  const handleSave = () => {
    // ... 저장 로직
    toast.success('저장되었습니다!');
  };

  const handleDelete = () => {
    // ... 삭제 로직
    toast.error('삭제할 수 없습니다');
  };

  const handleWarning = () => {
    toast.warning('주의하세요!', 3000); // 3초 후 자동 닫힘
  };

  const handleInfo = () => {
    toast.info('새로운 메시지가 있습니다', 5000, 'bottom-right');
  };

  return (
    <div>
      <Button onClick={handleSave}>저장</Button>
      <Button onClick={handleDelete}>삭제</Button>
      <Button onClick={handleWarning}>경고</Button>
      <Button onClick={handleInfo}>정보</Button>
    </div>
  );
}
```

---

## 🎨 디자인 토큰

모든 컴포넌트는 프로젝트의 디자인 시스템을 따릅니다:

### Colors
- **Primary**: Coral Orange (#FF8C69)
- **Secondary**: Mint Green (#7DD3C0)
- **Accent**: Sunflower Yellow (#FFD93D)

### Gradients
```css
.bg-gradient-primary { /* Coral gradient */ }
.bg-gradient-secondary { /* Mint gradient */ }
.bg-gradient-accent { /* Yellow gradient */ }
```

### Shadows
```css
.shadow-soft { /* 부드러운 그림자 */ }
.shadow-medium { /* 중간 그림자 */ }
.shadow-strong { /* 강한 그림자 */ }
.shadow-glow { /* 발광 효과 */ }
```

### Border Radius
```css
.rounded-2xl { /* 16px */ }
.rounded-3xl { /* 24px */ }
.rounded-full { /* 완전한 원형 */ }
```

---

## 📱 반응형

모든 컴포넌트는 기본적으로 반응형입니다:

```tsx
// 모바일에서는 full width
<Button className="w-full sm:w-auto">
  버튼
</Button>

// 작은 화면에서 크기 조정
<Input className="text-sm sm:text-base" />

// 카드 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## 🚀 Best Practices

### 1. 일관성 유지
같은 액션에는 같은 variant를 사용하세요.
```tsx
// ✅ Good
<Button variant="primary">저장</Button>
<Button variant="primary">완료</Button>

// ❌ Bad
<Button variant="primary">저장</Button>
<Button variant="success">완료</Button>
```

### 2. 적절한 크기 사용
터치 타겟은 최소 44px 이상이어야 합니다.
```tsx
// ✅ Good - 모바일 친화적
<Button size="md">클릭</Button>

// ⚠️ Caution - 모바일에서 작을 수 있음
<Button size="sm">클릭</Button>
```

### 3. Toast 남용 방지
너무 많은 Toast는 사용자 경험을 해칩니다.
```tsx
// ✅ Good - 중요한 액션에만 사용
function handleSave() {
  saveData();
  toast.success('저장되었습니다');
}

// ❌ Bad - 모든 클릭마다 표시
function handleClick() {
  toast.info('클릭됨');
}
```

### 4. Modal 접근성
ESC 키와 backdrop 클릭으로 닫을 수 있도록 항상 설정하세요.
```tsx
// ✅ Good - 기본값 사용
<Modal isOpen={isOpen} onClose={handleClose}>
  ...
</Modal>
```

---

## 🎯 실전 예제

### 폼 제출

```tsx
import { Button, Input, Card, CardHeader, CardContent, toast } from './components/ui';
import { useState } from 'react';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signup(email, password);
      toast.success('회원가입이 완료되었습니다!');
    } catch (error) {
      toast.error('회원가입에 실패했습니다');
      setErrors({ email: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">회원가입</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            가입하기
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 선택 가능한 카드 리스트

```tsx
import { Card, CardContent, Badge } from './components/ui';
import { useState } from 'react';

function TopicList({ topics }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <Card
          key={topic.id}
          hoverable
          selected={selectedId === topic.id}
          onClick={() => setSelectedId(topic.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg">{topic.title}</h3>
              <Badge variant={topic.difficulty === 'easy' ? 'success' : 'warning'}>
                {topic.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">{topic.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🔧 커스터마이징

모든 컴포넌트는 `className` prop을 통해 추가 스타일링이 가능합니다:

```tsx
<Button 
  variant="primary" 
  className="mt-4 w-full sm:w-auto"
>
  커스텀 버튼
</Button>

<Card className="border-2 border-primary">
  <CardContent>특별한 카드</CardContent>
</Card>
```
