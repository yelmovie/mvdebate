# Node.js 빠른 설치 스크립트 (Windows)
# 이 스크립트는 Node.js 설치를 안내하고 확인합니다.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Node.js 설치 확인 및 안내" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Node.js 확인
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js가 이미 설치되어 있습니다: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Yellow
    Write-Host "1. 브라우저에서 https://nodejs.org/ 접속" -ForegroundColor White
    Write-Host "2. LTS 버전 다운로드 및 설치" -ForegroundColor White
    Write-Host "3. 설치 후 터미널 재시작" -ForegroundColor White
    Write-Host ""
    
    # winget 확인
    $wingetCheck = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCheck) {
        Write-Host "💡 winget을 사용하여 설치할 수 있습니다:" -ForegroundColor Cyan
        Write-Host "   winget install OpenJS.NodeJS.LTS" -ForegroundColor White
        Write-Host ""
        $install = Read-Host "지금 설치하시겠습니까? (Y/N)"
        if ($install -eq "Y" -or $install -eq "y") {
            Write-Host "설치 중..." -ForegroundColor Yellow
            winget install OpenJS.NodeJS.LTS
            Write-Host ""
            Write-Host "✅ 설치 완료! 터미널을 재시작한 후 다시 확인하세요." -ForegroundColor Green
        }
    }
}

Write-Host ""

# npm 확인
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    $npmVersion = npm --version
    Write-Host "✅ npm이 설치되어 있습니다: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "   Node.js를 설치하면 npm도 함께 설치됩니다." -ForegroundColor Yellow
}

Write-Host ""

# 프로젝트 의존성 확인
if (Test-Path "package.json") {
    if (Test-Path "node_modules") {
        Write-Host "✅ 프로젝트 의존성이 설치되어 있습니다." -ForegroundColor Green
    } else {
        Write-Host "⚠️ 프로젝트 의존성이 설치되지 않았습니다." -ForegroundColor Yellow
        if ($npmCheck) {
            Write-Host ""
            $installDeps = Read-Host "지금 설치하시겠습니까? (Y/N)"
            if ($installDeps -eq "Y" -or $installDeps -eq "y") {
                Write-Host "의존성 설치 중..." -ForegroundColor Yellow
                npm install
                Write-Host ""
                Write-Host "✅ 의존성 설치 완료!" -ForegroundColor Green
            }
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. .env.local 파일 생성 (UPSTAGE_API_KEY 추가)" -ForegroundColor White
Write-Host "2. npm run dev 실행" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

