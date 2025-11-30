# API 키 확인 및 서버 실행 스크립트

Write-Host "=== API 키 및 서버 상태 확인 ===" -ForegroundColor Cyan
Write-Host ""

# 1. .env.local 파일 확인
Write-Host "1. 환경 변수 파일 확인:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local 파일 존재" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -ErrorAction SilentlyContinue
    $hasApiKey = $false
    foreach ($line in $envContent) {
        if ($line -match "^UPSTAGE_API_KEY\s*=") {
            $hasApiKey = $true
            $keyValue = $line -replace "^UPSTAGE_API_KEY\s*=\s*", ""
            if ($keyValue -and $keyValue -ne "your_upstage_api_key_here" -and $keyValue.Length -gt 10) {
                Write-Host "   ✅ API 키가 설정되어 있습니다 (길이: $($keyValue.Length)자)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ API 키가 설정되지 않았거나 예시 값입니다" -ForegroundColor Yellow
            }
            break
        }
    }
    if (-not $hasApiKey) {
        Write-Host "   ⚠️ UPSTAGE_API_KEY가 .env.local 파일에 없습니다" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env.local 파일이 없습니다" -ForegroundColor Red
    Write-Host "   → API 키를 설정하려면 .env.local 파일을 생성하세요" -ForegroundColor Yellow
}

Write-Host ""

# 2. Node.js 프로세스 확인
Write-Host "2. 서버 실행 상태 확인:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✅ Node.js 프로세스 실행 중 (PID: $($nodeProcesses[0].Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ 서버가 실행되지 않았습니다" -ForegroundColor Red
}

# 포트 3000 확인
$port3000 = netstat -ano 2>$null | Select-String ":3000"
if ($port3000) {
    Write-Host "   ✅ 포트 3000 사용 중" -ForegroundColor Green
} else {
    Write-Host "   ❌ 포트 3000이 사용되지 않습니다" -ForegroundColor Red
}

Write-Host ""

# 3. HTTP 연결 테스트
Write-Host "3. 서버 연결 테스트:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ 서버가 정상적으로 응답합니다! (상태 코드: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   → 브라우저에서 http://localhost:3000 접속 가능" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Message -like "*연결할 수 없습니다*" -or $_.Exception.Message -like "*cannot connect*") {
        Write-Host "   ❌ 서버에 연결할 수 없습니다" -ForegroundColor Red
        Write-Host "   → 서버를 실행해야 합니다" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 4. node_modules 확인
Write-Host "4. 의존성 확인:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules 폴더 존재" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules 폴더 없음" -ForegroundColor Red
    Write-Host "   → npm install 필요" -ForegroundColor Yellow
}

Write-Host ""

# 요약 및 다음 단계
Write-Host "=== 요약 ===" -ForegroundColor Cyan
Write-Host ""

$needsInstall = -not (Test-Path "node_modules")
$needsServer = -not $nodeProcesses

if ($needsInstall) {
    Write-Host "❌ npm install 필요" -ForegroundColor Red
}

if ($needsServer) {
    Write-Host "❌ 개발 서버 실행 필요" -ForegroundColor Red
}

if ($needsInstall -or $needsServer) {
    Write-Host ""
    Write-Host "=== 다음 단계 ===" -ForegroundColor Cyan
    Write-Host ""
    
    if ($needsInstall) {
        Write-Host "1. 의존성 설치:" -ForegroundColor Yellow
        Write-Host "   npm install" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "2. 개발 서버 실행:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "   또는 이 스크립트를 계속 실행하면 자동으로 서버를 시작합니다." -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "지금 서버를 실행하시겠습니까? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "=== 개발 서버 시작 ===" -ForegroundColor Cyan
        Write-Host "브라우저에서 http://localhost:3000 을 열어주세요." -ForegroundColor Yellow
        Write-Host "서버를 종료하려면 Ctrl+C를 누르세요." -ForegroundColor Gray
        Write-Host ""
        
        if ($needsInstall) {
            Write-Host "의존성 설치 중..." -ForegroundColor Cyan
            npm install
        }
        
        Write-Host "개발 서버 시작 중..." -ForegroundColor Cyan
        npm run dev
    }
} else {
    Write-Host "✅ 모든 준비가 완료되었습니다!" -ForegroundColor Green
    Write-Host "브라우저에서 http://localhost:3000 을 열어보세요." -ForegroundColor Cyan
}



