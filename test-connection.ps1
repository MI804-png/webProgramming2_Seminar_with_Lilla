# Test connection to IHUTSC server
# Nabil Salama Rezk Mikhael - Connection Test

Write-Host "🔗 Testing connection to IHUTSC server..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$SERVER_IP = "143.47.98.96"
$USERNAME = "student206"
$PORT = "22"

Write-Host "Server: $SERVER_IP" -ForegroundColor Green
Write-Host "Username: $USERNAME" -ForegroundColor Green
Write-Host "SSH Port: $PORT" -ForegroundColor Green
Write-Host ""

# Test if the server is reachable
Write-Host "📡 Testing server connectivity..." -ForegroundColor Yellow

try {
    $ping = Test-Connection -ComputerName $SERVER_IP -Count 2 -Quiet
    if ($ping) {
        Write-Host "✅ Server is reachable!" -ForegroundColor Green
    } else {
        Write-Host "❌ Server is not reachable" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test SSH connection (this will prompt for password)
Write-Host "🔐 Testing SSH connection..." -ForegroundColor Yellow
Write-Host "You will be prompted for password. Try these common defaults:" -ForegroundColor Cyan
Write-Host "- abc123" -ForegroundColor White  
Write-Host "- 123456" -ForegroundColor White
Write-Host "- student206" -ForegroundColor White
Write-Host "- (or the password provided by your instructor)" -ForegroundColor White
Write-Host ""

$sshCommand = "ssh -o ConnectTimeout=10 -o BatchMode=no $USERNAME@$SERVER_IP 'echo Connection successful; whoami; pwd; ls -la'"

Write-Host "Running: $sshCommand" -ForegroundColor Gray
Write-Host ""

try {
    Invoke-Expression $sshCommand
    Write-Host ""
    Write-Host "✅ SSH connection test completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ready for deployment! Run the upload script:" -ForegroundColor Cyan
    Write-Host "   .\upload-to-ihutsc.ps1" -ForegroundColor White
} catch {
    Write-Host "❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Verify the server IP: $SERVER_IP" -ForegroundColor White
    Write-Host "2. Check your username: $USERNAME" -ForegroundColor White
    Write-Host "3. Ensure you have the correct password" -ForegroundColor White
    Write-Host "4. Contact your instructor if the issue persists" -ForegroundColor White
}
