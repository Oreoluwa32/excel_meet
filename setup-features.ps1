# PowerShell script to help set up the new features
# Run this with: .\setup-features.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Excel Meet - Feature Setup Assistant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up:" -ForegroundColor Yellow
Write-Host "  1. Image Upload functionality" -ForegroundColor White
Write-Host "  2. Saved Jobs feature" -ForegroundColor White
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking for Supabase CLI..." -ForegroundColor Yellow
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if ($supabaseCli) {
    Write-Host "✓ Supabase CLI found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Would you like to run migrations using Supabase CLI? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "Running migrations..." -ForegroundColor Yellow
        
        # Run migrations
        supabase migration up
        
        Write-Host ""
        Write-Host "✓ Migrations completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Run: node verify-setup.js" -ForegroundColor White
        Write-Host "  2. Start your app and test the features" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Manual setup required. Please follow these steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "STEP 1: Create saved_jobs table" -ForegroundColor Cyan
        Write-Host "  1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
        Write-Host "  2. Open: supabase/migrations/20250117000000_create_saved_jobs_table.sql" -ForegroundColor White
        Write-Host "  3. Copy and paste the SQL" -ForegroundColor White
        Write-Host "  4. Click 'Run'" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 2: Create storage bucket" -ForegroundColor Cyan
        Write-Host "  1. Go to Supabase Dashboard → Storage" -ForegroundColor White
        Write-Host "  2. Click 'New bucket'" -ForegroundColor White
        Write-Host "  3. Name: jobs" -ForegroundColor White
        Write-Host "  4. Make it PUBLIC ✓" -ForegroundColor White
        Write-Host "  5. Click 'Create'" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 3: Set up storage policies" -ForegroundColor Cyan
        Write-Host "  1. Go to SQL Editor" -ForegroundColor White
        Write-Host "  2. Open: supabase/migrations/20250117000001_create_jobs_storage_bucket.sql" -ForegroundColor White
        Write-Host "  3. Copy and paste the SQL" -ForegroundColor White
        Write-Host "  4. Click 'Run'" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 4: Verify setup" -ForegroundColor Cyan
        Write-Host "  Run: node verify-setup.js" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "✗ Supabase CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual setup required. Please follow these steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "STEP 1: Create saved_jobs table" -ForegroundColor Cyan
    Write-Host "  1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
    Write-Host "  2. Open: supabase/migrations/20250117000000_create_saved_jobs_table.sql" -ForegroundColor White
    Write-Host "  3. Copy and paste the SQL" -ForegroundColor White
    Write-Host "  4. Click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "STEP 2: Create storage bucket" -ForegroundColor Cyan
    Write-Host "  1. Go to Supabase Dashboard → Storage" -ForegroundColor White
    Write-Host "  2. Click 'New bucket'" -ForegroundColor White
    Write-Host "  3. Name: jobs" -ForegroundColor White
    Write-Host "  4. Make it PUBLIC ✓" -ForegroundColor White
    Write-Host "  5. Click 'Create'" -ForegroundColor White
    Write-Host ""
    Write-Host "STEP 3: Set up storage policies" -ForegroundColor Cyan
    Write-Host "  1. Go to SQL Editor" -ForegroundColor White
    Write-Host "  2. Open: supabase/migrations/20250117000001_create_jobs_storage_bucket.sql" -ForegroundColor White
    Write-Host "  3. Copy and paste the SQL" -ForegroundColor White
    Write-Host "  4. Click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "STEP 4: Verify setup" -ForegroundColor Cyan
    Write-Host "  Run: node verify-setup.js" -ForegroundColor White
    Write-Host ""
    Write-Host "TIP: Install Supabase CLI for easier setup:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  • SETUP_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "  • FEATURE_SUMMARY.md" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Open the migration files in default editor
Write-Host "Would you like to open the migration files? (Y/N)" -ForegroundColor Yellow
$openFiles = Read-Host

if ($openFiles -eq "Y" -or $openFiles -eq "y") {
    Write-Host ""
    Write-Host "Opening migration files..." -ForegroundColor Yellow
    
    $migration1 = "supabase\migrations\20250117000000_create_saved_jobs_table.sql"
    $migration2 = "supabase\migrations\20250117000001_create_jobs_storage_bucket.sql"
    
    if (Test-Path $migration1) {
        Start-Process $migration1
    }
    
    if (Test-Path $migration2) {
        Start-Process $migration2
    }
    
    Write-Host "✓ Files opened" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup assistant completed!" -ForegroundColor Green
Write-Host ""