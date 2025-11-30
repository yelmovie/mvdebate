# 서버 실행 상태 확인 스크립트

Write-Host "=== 서버 실행 상태 확인 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Node.js 프로세스 확인
Write-Host "1. Node.js 프로세스 확인:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✅ Node.js 프로세스 실행 중:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "      - PID: $($_.Id), 시작 시간: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Node.js 프로세스가 실행 중이 아닙니다." -ForegroundColor Red
}

Write-Host ""

# 2. 포트 3000 확인
Write-Host "2. 포트 3000 사용 확인:" -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "   ✅ 포트 3000이 사용 중입니다:" -ForegroundColor Green
    Write-Host "   $port3000" -ForegroundColor Gray
} else {
    Write-Host "   ❌ 포트 3000이 사용 중이 아닙니다." -ForegroundColor Red
    Write-Host "   → 서버가 실행되지 않았습니다." -ForegroundColor Yellow
}

Write-Host ""

# 3. node_modules 확인
Write-Host "3. 의존성 설치 확인:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules 폴더 존재" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules 폴더 없음" -ForegroundColor Red
    Write-Host "   → npm install 필요" -ForegroundColor Yellow
}

Write-Host ""

# 4. .env.local 확인
Write-Host "4. 환경 변수 파일 확인:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local 파일 존재" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ .env.local 파일 없음" -ForegroundColor Yellow
    Write-Host "   → API 키 설정 필요 (선택사항)" -ForegroundColor Gray
}

Write-Host ""

# 5. HTTP 연결 테스트
Write-Host "5. HTTP 연결 테스트:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ 서버가 정상적으로 응답합니다!" -ForegroundColor Green
    Write-Host "   상태 코드: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ⚠️ 서버는 실행 중이지만 페이지를 찾을 수 없습니다." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*연결할 수 없습니다*" -or $_.Exception.Message -like "*cannot connect*") {
        Write-Host "   ❌ 서버에 연결할 수 없습니다." -ForegroundColor Red
        Write-Host "   → 서버가 실행되지 않았습니다." -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 요약 ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

if (-not (Test-Path "node_modules")) {
    Write-Host "❌ npm install 필요" -ForegroundColor Red
    $allGood = $false
}

if (-not $nodeProcesses) {
    Write-Host "❌ 개발 서버가 실행되지 않았습니다." -ForegroundColor Red
    Write-Host "   다음 명령어로 서버를 실행하세요:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    $allGood = $false
}

if ($allGood) {
    Write-Host "✅ 모든 확인 완료!" -ForegroundColor Green
    Write-Host "브라우저에서 http://localhost:3000 을 열어보세요." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== 다음 단계 ===" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "1. 의존성 설치:" -ForegroundColor Yellow
        Write-Host "   npm install" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "2. 개발 서버 실행:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. 브라우저에서 확인:" -ForegroundColor Yellow
    Write-Host "   http://localhost:3000" -ForegroundColor White
}



