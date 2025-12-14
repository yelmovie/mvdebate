Write-Host "🔍 Verifying MCP Installation..." -ForegroundColor Cyan

# 1. Check Directories
$missingDirs = 0
$dirs = @("mcp", "config", "scripts")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        Write-Host "❌ Missing Directory: /$dir" -ForegroundColor Red
        $missingDirs++
    } else {
        Write-Host "✅ Directory /$dir OK" -ForegroundColor Green
    }
}

# 2. Check Configurations
$missingFiles = 0
$files = @("mcp/mcp.json", "config/context7.config.json", ".env.example")
foreach ($file in $files) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Missing File: $file" -ForegroundColor Red
        $missingFiles++
    } else {
        Write-Host "✅ File $file OK" -ForegroundColor Green
    }
}

# 3. Check node_modules
if (!(Test-Path "node_modules/@upstash/context7-mcp")) {
    Write-Host "❌ Package @upstash/context7-mcp not found in node_modules" -ForegroundColor Red
    $missingDirs++ # count as error
} else {
    Write-Host "✅ Package @upstash/context7-mcp installed" -ForegroundColor Green
}

if ($missingDirs -eq 0 -and $missingFiles -eq 0) {
    Write-Host "`n✨ All Verification Checks Passed!" -ForegroundColor Green
    Write-Host "You are ready to develop with Context7." -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some checks failed. Please run ./scripts/install_mcp.ps1 or restore missing files." -ForegroundColor Yellow
    exit 1
}
