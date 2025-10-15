#!/usr/bin/env pwsh
# PWA Deployment Script for Vercel

Write-Host "🚀 Excel Meet PWA Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Step 2: Verify PWA files exist
Write-Host "🔍 Verifying PWA files..." -ForegroundColor Yellow
$requiredFiles = @(
    "public\manifest.json",
    "public\service-worker.js",
    "public\icon-192.png",
    "public\icon-512.png",
    "public\icon-192-maskable.png",
    "public\icon-512-maskable.png"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some PWA files are missing!" -ForegroundColor Red
    Write-Host "Please generate icons using generate-icons-browser.html" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 3: Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Verify build output
Write-Host "🔍 Verifying build output..." -ForegroundColor Yellow
$buildFiles = @(
    "build\index.html",
    "build\manifest.json",
    "build\service-worker.js",
    "build\icon-192.png",
    "build\icon-512.png"
)

$allBuildFilesExist = $true
foreach ($file in $buildFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING)" -ForegroundColor Red
        $allBuildFilesExist = $false
    }
}

if (-not $allBuildFilesExist) {
    Write-Host ""
    Write-Host "❌ Some files missing from build output!" -ForegroundColor Red
    Write-Host "Check your vite.config.mjs - copyPublicDir should be true" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Choose deployment type:" -ForegroundColor Cyan
Write-Host "  1. Preview (test deployment)" -ForegroundColor White
Write-Host "  2. Production (live deployment)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Magenta
    vercel --prod
} else {
    Write-Host ""
    Write-Host "🚀 Deploying to PREVIEW..." -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Testing your PWA:" -ForegroundColor Cyan
Write-Host "  1. Open the Vercel URL in Chrome DevTools" -ForegroundColor White
Write-Host "  2. Go to Application tab → Manifest" -ForegroundColor White
Write-Host "  3. Check for 'No errors' message" -ForegroundColor White
Write-Host "  4. Go to Service Workers - should show 'activated'" -ForegroundColor White
Write-Host "  5. Wait 30-60 seconds on the page" -ForegroundColor White
Write-Host "  6. Install prompt should appear!" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If issues persist, check:" -ForegroundColor Yellow
Write-Host "  • Console for errors (F12)" -ForegroundColor White
Write-Host "  • Network tab - verify manifest.json loads" -ForegroundColor White
Write-Host "  • All icon URLs return 200 (not 404)" -ForegroundColor White
Write-Host ""