#!/usr/bin/env bash

# 1) 현재 디렉토리가 git 레포인지 확인
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "이 디렉토리는 git 레포가 아닙니다."
  exit 1
fi

# 2) 로컬에 commit되지 않은 변경이 있는지 확인
if [ -n "$(git status --porcelain)" ]; then
  git status
  echo "⚠️ 로컬 변경사항이 있어서 작업을 시작할 수 없습니다. 먼저 safe_finish.sh를 실행하거나 직접 커밋해 주세요."
  exit 1
fi

# 3) 변경사항이 없다면 최신 코드 업데이트
echo "🔄 최신 코드를 가져오는 중..."
git fetch origin
git pull --rebase origin main
echo "✅ 최신 코드로 업데이트 완료"
