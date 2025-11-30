# PowerShell 실행 정책 수정 및 프로젝트 실행 스크립트

Write-Host "=== PowerShell 실행 정책 수정 ===" -ForegroundColor Cyan
Write-Host ""

# 실행 정책 변경
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✅ 실행 정책이 RemoteSigned로 변경되었습니다." -ForegroundColor Green
} catch {
    Write-Host "⚠️ 실행 정책 변경 실패: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Node.js 및 npm 확인 ===" -ForegroundColor Cyan
Write-Host ""

# Node.js 확인
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
Write-Host "=== 프로젝트 디렉토리 확인 ===" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\moviessam2\mvdebate"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✅ 프로젝트 디렉토리: $projectPath" -ForegroundColor Green
} else {
    Write-Host "❌ 프로젝트 디렉토리를 찾을 수 없습니다: $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 의존성 설치 확인 ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "✅ node_modules 폴더가 존재합니다." -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules 폴더가 없습니다. npm install을 실행합니다..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install 실패" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== 환경 변수 확인 ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local 파일이 존재합니다." -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "   다음 내용으로 .env.local 파일을 생성하세요:" -ForegroundColor Yellow
    Write-Host "   UPSTAGE_API_KEY=your_api_key_here" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "=== 개발 서버 실행 준비 완료 ===" -ForegroundColor Green
Write-Host ""
Write-Host "다음 명령어로 개발 서버를 실행하세요:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "또는 이 스크립트를 계속 실행하면 자동으로 서버를 시작합니다." -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "지금 개발 서버를 실행하시겠습니까? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "=== 개발 서버 시작 ===" -ForegroundColor Cyan
    Write-Host "브라우저에서 http://localhost:3000 을 열어주세요." -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host "스크립트를 종료합니다." -ForegroundColor Gray
}



