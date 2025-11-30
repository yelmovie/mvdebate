# 빠른 실행 스크립트

Write-Host "=== 토론 웹앱 빠른 실행 ===" -ForegroundColor Cyan
Write-Host ""

# 프로젝트 디렉토리로 이동
$projectPath = "c:\moviessam2\mvdebate"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✅ 프로젝트 디렉토리: $projectPath" -ForegroundColor Green
} else {
    Write-Host "❌ 프로젝트 디렉토리를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""

# 실행 정책 확인 및 변경
Write-Host "=== 실행 정책 확인 ===" -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host "현재 실행 정책: $currentPolicy" -ForegroundColor Gray

if ($currentPolicy -eq "Restricted") {
    Write-Host "⚠️ 실행 정책을 변경합니다..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✅ 실행 정책이 RemoteSigned로 변경되었습니다." -ForegroundColor Green
}

Write-Host ""

# Node.js 확인
Write-Host "=== Node.js 확인 ===" -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
        Write-Host "   다운로드: https://nodejs.org/ (LTS 버전)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    exit 1
}

# npm 확인
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm을 찾을 수 없습니다." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ npm을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""

# node_modules 확인
Write-Host "=== 의존성 확인 ===" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules 폴더 존재" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules 폴더가 없습니다. 설치를 시작합니다..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "npm install 실행 중... (1-3분 소요)" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 의존성 설치 완료" -ForegroundColor Green
}

Write-Host ""

# .env.local 확인
Write-Host "=== 환경 변수 확인 ===" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local 파일 존재" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "   API 키 없이도 서버는 실행되지만 AI 기능은 작동하지 않습니다." -ForegroundColor Gray
}

Write-Host ""

# 서버 실행
Write-Host "=== 개발 서버 시작 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "서버가 시작되면 브라우저에서 다음 주소로 접속하세요:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "서버를 종료하려면 Ctrl+C를 누르세요." -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

# 개발 서버 실행
npm run dev



