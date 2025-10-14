# PWA Testing Script for Excel Meet
# This script helps you test PWA functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Excel Meet PWA Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if icons exist
Write-Host "Checking for PWA icons..." -ForegroundColor Yellow
$iconsPath = "public"
$requiredIcons = @("icon-192.png", "icon-512.png", "icon-192-maskable.png", "icon-512-maskable.png")
$missingIcons = @()

foreach ($icon in $requiredIcons) {
    $iconPath = Join-Path $iconsPath $icon
    if (Test-Path $iconPath) {
        Write-Host "  ✓ $icon found" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $icon missing" -ForegroundColor Red
        $missingIcons += $icon
    }
}

if ($missingIcons.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing icons detected!" -ForegroundColor Yellow
    Write-Host "Please generate icons using one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. Open 'generate-icons.html' in your browser" -ForegroundColor White
    Write-Host "  2. Open 'create-placeholder-icons.html' for quick placeholders" -ForegroundColor White
    Write-Host ""
}

# Check if service worker exists
Write-Host ""
Write-Host "Checking for Service Worker..." -ForegroundColor Yellow
$swPath = "public\service-worker.js"
if (Test-Path $swPath) {
    Write-Host "  ✓ Service Worker found" -ForegroundColor Green
} else {
    Write-Host "  ✗ Service Worker missing" -ForegroundColor Red
}

# Check if manifest exists
Write-Host ""
Write-Host "Checking for Web App Manifest..." -ForegroundColor Yellow
$manifestPath = "public\manifest.json"
if (Test-Path $manifestPath) {
    Write-Host "  ✓ Manifest found" -ForegroundColor Green
    
    # Validate manifest
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        Write-Host "  ✓ Manifest is valid JSON" -ForegroundColor Green
        Write-Host "    - Name: $($manifest.name)" -ForegroundColor Cyan
        Write-Host "    - Short Name: $($manifest.short_name)" -ForegroundColor Cyan
        Write-Host "    - Icons: $($manifest.icons.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "  ✗ Manifest has invalid JSON" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Manifest missing" -ForegroundColor Red
}

# Check if PWA components exist
Write-Host ""
Write-Host "Checking for PWA Components..." -ForegroundColor Yellow
$pwaComponentPath = "src\components\PWAInstallPrompt.jsx"
if (Test-Path $pwaComponentPath) {
    Write-Host "  ✓ PWA Install Prompt component found" -ForegroundColor Green
} else {
    Write-Host "  ✗ PWA Install Prompt component missing" -ForegroundColor Red
}

$swRegisterPath = "src\utils\registerServiceWorker.js"
if (Test-Path $swRegisterPath) {
    Write-Host "  ✓ Service Worker registration utility found" -ForegroundColor Green
} else {
    Write-Host "  ✗ Service Worker registration utility missing" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Desktop Testing (Chrome/Edge):" -ForegroundColor Yellow
Write-Host "  1. Start dev server: npm start" -ForegroundColor White
Write-Host "  2. Open DevTools (F12)" -ForegroundColor White
Write-Host "  3. Go to Application tab" -ForegroundColor White
Write-Host "  4. Check Manifest and Service Workers sections" -ForegroundColor White
Write-Host "  5. Run Lighthouse audit for PWA score" -ForegroundColor White
Write-Host ""
Write-Host "Mobile Testing (Android):" -ForegroundColor Yellow
Write-Host "  1. Deploy to HTTPS server (required for PWA)" -ForegroundColor White
Write-Host "  2. Visit site on Chrome mobile" -ForegroundColor White
Write-Host "  3. Wait for install prompt" -ForegroundColor White
Write-Host "  4. Tap 'Install App'" -ForegroundColor White
Write-Host ""
Write-Host "Mobile Testing (iOS):" -ForegroundColor Yellow
Write-Host "  1. Deploy to HTTPS server (required for PWA)" -ForegroundColor White
Write-Host "  2. Visit site on Safari" -ForegroundColor White
Write-Host "  3. Tap Share button" -ForegroundColor White
Write-Host "  4. Tap 'Add to Home Screen'" -ForegroundColor White
Write-Host ""
Write-Host "Build for Production:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see PWA_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""