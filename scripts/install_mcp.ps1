# Check for pnpm
Write-Host "🔍 checking pnpm installation..." -ForegroundColor Cyan
$pkgManager = "pnpm"
if (!(Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ pnpm not found. Checking for npm..." -ForegroundColor Yellow
    if (Get-Command "npm" -ErrorAction SilentlyContinue) {
        $pkgManager = "npm"
        Write-Host "✅ npm found. Will use npm." -ForegroundColor Green
    } else {
        Write-Error "❌ Neither pnpm nor npm found. Please install Node.js."
        exit 1
    }
} else {
    Write-Host "✅ pnpm found." -ForegroundColor Green
}

# Create Directories
Write-Host "`nBg Making directory structure..." -ForegroundColor Cyan
$dirs = @("mcp", "config", "scripts")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  + Created /$dir" -ForegroundColor Gray
    } else {
        Write-Host "  . /$dir exists" -ForegroundColor Gray
    }
}

# Install Dependencies
Write-Host "`n📦 Installing NPM packages (@upstash/context7-mcp, @modelcontextprotocol/sdk)..." -ForegroundColor Cyan
Write-Host "   This might take a moment..." -ForegroundColor Gray
try {
    if ($pkgManager -eq "pnpm") {
        pnpm add -D @modelcontextprotocol/sdk @upstash/context7-mcp
    } else {
        npm install --save-dev @modelcontextprotocol/sdk @upstash/context7-mcp
    }
    Write-Host "✅ Packages installed successfully." -ForegroundColor Green
} catch {
    Write-Error "❌ Failed to install packages using $pkgManager."
    Write-Host "   Manual fix: $pkgManager add/install -D @modelcontextprotocol/sdk @upstash/context7-mcp" -ForegroundColor Yellow
    exit 1
}

# Final Check
Write-Host "`n✨ MCP Setup Script Completed!" -ForegroundColor Green
Write-Host "   Next Step: Check .env.example and configure your keys." -ForegroundColor Yellow
