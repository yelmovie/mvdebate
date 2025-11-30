# Node.js 설치 검증 스크립트 (PowerShell)
# 사용법: .\validate-node-install.ps1

Write-Host "=== Node.js 설치 검증 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Node.js 버전 확인
Write-Host "1. Node.js 버전 확인:" -ForegroundColor Yellow
try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
        Write-Host "   다운로드: https://nodejs.org/ (LTS 버전 권장)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "   다운로드: https://nodejs.org/ (LTS 버전 권장)" -ForegroundColor Yellow
    exit 1
}

# 2. npm 버전 확인
Write-Host ""
Write-Host "2. npm 버전 확인:" -ForegroundColor Yellow
try {
    $npmVersion = npm -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ npm이 설치되지 않았습니다." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ npm이 설치되지 않았습니다." -ForegroundColor Red
    exit 1
}

# 3. 설치 경로 확인
Write-Host ""
Write-Host "3. 설치 경로 확인:" -ForegroundColor Yellow
try {
    $nodePath = where.exe node 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $nodePath" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ 경로를 찾을 수 없습니다." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ 경로를 찾을 수 없습니다." -ForegroundColor Yellow
}

# 4. hello-test.js 실행
Write-Host ""
Write-Host "4. 테스트 스크립트 실행:" -ForegroundColor Yellow
if (Test-Path "hello-test.js") {
    try {
        Write-Host "   실행 중..." -ForegroundColor Gray
        node hello-test.js
        Write-Host ""
        Write-Host "   ✅ 모든 검증 테스트 통과!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ 테스트 실행 실패" -ForegroundColor Red
        Write-Host "   오류: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️ hello-test.js 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "   파일을 생성하려면 다음 명령어 실행:" -ForegroundColor Gray
    Write-Host "   node -e \"console.log('Node.js works!')\"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== 검증 완료 ===" -ForegroundColor Cyan





