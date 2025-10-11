# PowerShell script to start webhook server and ngrok tunnel

Write-Host "`n🚀 Starting Excel Meet Webhook Server...`n" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies...`n" -ForegroundColor Yellow
    npm install
}

# Start the webhook server in background
Write-Host "🔧 Starting webhook server on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Start ngrok tunnel
Write-Host "🌐 Starting ngrok tunnel...`n" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node ngrok-setup.js" -WindowStyle Normal

Write-Host "`n✅ Webhook server and tunnel started!" -ForegroundColor Green
Write-Host "   Check the new terminal windows for details.`n" -ForegroundColor White