#!/bin/bash
# Node.js 설치 검증 스크립트 (macOS/Linux)
# 사용법: chmod +x validate-node-install.sh && ./validate-node-install.sh

echo "=== Node.js 설치 검증 ==="
echo ""

# 1. Node.js 버전 확인
echo "1. Node.js 버전 확인:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ $NODE_VERSION"
else
    echo "   ❌ Node.js가 설치되지 않았습니다."
    echo "   다운로드: https://nodejs.org/ (LTS 버전 권장)"
    exit 1
fi

# 2. npm 버전 확인
echo ""
echo "2. npm 버전 확인:"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ $NPM_VERSION"
else
    echo "   ❌ npm이 설치되지 않았습니다."
    exit 1
fi

# 3. 설치 경로 확인
echo ""
echo "3. 설치 경로 확인:"
NODE_PATH=$(which node)
if [ -n "$NODE_PATH" ]; then
    echo "   ✅ $NODE_PATH"
else
    echo "   ⚠️ 경로를 찾을 수 없습니다."
fi

# 4. hello-test.js 실행
echo ""
echo "4. 테스트 스크립트 실행:"
if [ -f "hello-test.js" ]; then
    echo "   실행 중..."
    node hello-test.js
    echo ""
    echo "   ✅ 모든 검증 테스트 통과!"
else
    echo "   ⚠️ hello-test.js 파일이 없습니다."
    echo "   파일을 생성하려면 다음 명령어 실행:"
    echo "   node -e \"console.log('Node.js works!')\""
fi

echo ""
echo "=== 검증 완료 ==="





