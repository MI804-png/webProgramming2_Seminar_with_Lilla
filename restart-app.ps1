# Quick script to check and restart the application on the Linux server

Write-Host "Checking application status on server..." -ForegroundColor Cyan

$statusCheck = ssh student206@143.47.98.96 "~/.local/bin/pm2 status app206 2>&1"

if ($statusCheck -match "online") {
    Write-Host "✓ Application is running!" -ForegroundColor Green
    Write-Host "Access at: http://143.47.98.96/app206/" -ForegroundColor Cyan
} else {
    Write-Host "✗ Application is not running. Starting it now..." -ForegroundColor Yellow
    ssh student206@143.47.98.96 "cd ~/webprogramming_with_lilla && ~/.local/bin/pm2 start ecosystem.config.js"
    Write-Host "✓ Application started!" -ForegroundColor Green
    Write-Host "Access at: http://143.47.98.96/app206/" -ForegroundColor Cyan
}
