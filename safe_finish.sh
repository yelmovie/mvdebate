#!/usr/bin/env bash

# 1) 현재 디렉토리가 git 레포인지 확인
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "이 디렉토리는 git 레포가 아닙니다."
  exit 1
fi

# 2) 변경사항이 있는지 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "변경사항이 없습니다. 커밋/푸시할 내용이 없습니다."
  exit 0
fi

# 3) 변경사항이 있다면 처리
git status
read -p "커밋 메시지를 입력하세요: " msg

if [ -z "$msg" ]; then
  echo "❌ 커밋 메시지가 입력되지 않았습니다. 작업을 취소합니다."
  exit 1
fi

git add .
git commit -m "$msg"
git push origin main
echo "✅ GitHub로 안전하게 동기화 완료"
