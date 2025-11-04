# TechCorp Solutions - IHUTSC Server Upload Script
# Nabil Salama Rezk Mikhael - Windows PowerShell Upload Script

Write-Host "🚀 TechCorp Solutions - IHUTSC Server Upload" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Student: Nabil Salama Rezk Mikhael" -ForegroundColor Green
Write-Host "Neptun: IHUTSC" -ForegroundColor Green
Write-Host "Server: 143.47.98.96:4206" -ForegroundColor Green
Write-Host "Route: /app206" -ForegroundColor Green
Write-Host ""

$SERVER_IP = "143.47.98.96"
$USERNAME = "student206" 
$REMOTE_PATH = "~/exercise"

# Check if we're in the exercise directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: This script must be run from the exercise directory" -ForegroundColor Red
    Write-Host "Please navigate to: c:\webprogramming2_homework\exercise" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Green

# Method 1: Using SCP (if available)
Write-Host "📦 Method 1: Attempting SCP upload..." -ForegroundColor Yellow

try {
    # Test if SCP is available
    $scpTest = Get-Command scp -ErrorAction Stop
    
    Write-Host "📤 Uploading files via SCP..." -ForegroundColor Cyan
    Write-Host "You will be prompted for the password. Default is usually: abc123" -ForegroundColor Yellow
    Write-Host ""
    
    # Upload all files except node_modules and .git
    scp -r -o ConnectTimeout=30 `
        --exclude=node_modules `
        --exclude=.git `
        --exclude="*.log" `
        . "$USERNAME@${SERVER_IP}:$REMOTE_PATH/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SCP upload successful!" -ForegroundColor Green
        $uploadSuccess = $true
    } else {
        throw "SCP upload failed"
    }
} catch {
    Write-Host "⚠️  SCP not available or failed. Trying alternative method..." -ForegroundColor Yellow
    $uploadSuccess = $false
}

# Method 2: Using Git (if SCP fails)
if (-not $uploadSuccess) {
    Write-Host "📦 Method 2: Git deployment preparation..." -ForegroundColor Yellow
    
    # Check if this is a git repository
    if (Test-Path ".git") {
        Write-Host "📝 Committing latest changes..." -ForegroundColor Cyan
        
        git add .
        git status
        
        $commitMessage = "Production deployment for IHUTSC server - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        git commit -m $commitMessage
        
        Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
        git push origin main
        
        Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Connect to server: ssh $USERNAME@$SERVER_IP" -ForegroundColor White
        Write-Host "2. Clone/pull the repository on the server" -ForegroundColor White
        Write-Host "3. Run the deployment script" -ForegroundColor White
        
    } else {
        Write-Host "❌ No git repository found. Please initialize git or use manual upload." -ForegroundColor Red
        exit 1
    }
}

# Method 3: Manual instructions
Write-Host ""
Write-Host "🔧 Server Deployment Instructions:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$sshCommand = "ssh $USERNAME@$SERVER_IP"
$deploymentCommands = @"
# Connect to the server
$sshCommand

# Navigate to exercise directory (create if needed)
mkdir -p ~/exercise
cd ~/exercise

# If using git method:
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME .
# OR if already cloned: git pull origin main

# Make deployment script executable
chmod +x deploy-ihutsc-full.sh

# Run the deployment script
./deploy-ihutsc-full.sh

# Alternative manual steps if script fails:
# 1. Install Node.js and PM2
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Install dependencies
npm ci --production

# 3. Setup environment
cp .env.production .env

# 4. Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Check status
pm2 status
pm2 logs app206
"@

Write-Host $deploymentCommands -ForegroundColor White

Write-Host ""
Write-Host "🌐 After successful deployment, access your application at:" -ForegroundColor Green
Write-Host "   Main URL: http://143.47.98.96:4206/app206" -ForegroundColor Cyan
Write-Host "   Health Check: http://143.47.98.96:4206/app206/health" -ForegroundColor Cyan
Write-Host "   Admin Login: admin / admin123" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Deployment Summary for Documentation:" -ForegroundColor Yellow
Write-Host "- Server IP: 143.47.98.96" -ForegroundColor White
Write-Host "- Username: student206" -ForegroundColor White
Write-Host "- Application Port: 4206" -ForegroundColor White
Write-Host "- Application Route: /app206" -ForegroundColor White
Write-Host "- Database: studb206@localhost:3306/db206" -ForegroundColor White
Write-Host "- Full URL: http://143.47.98.96:4206/app206" -ForegroundColor White

Write-Host ""
Write-Host "✅ Upload script completed!" -ForegroundColor Green
