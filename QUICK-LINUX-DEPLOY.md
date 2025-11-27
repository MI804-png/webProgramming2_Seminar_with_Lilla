# Quick Deployment to Linux Server
# Server: 143.47.98.96 | User: student206 | App: app206

## STEP 1: Connect to Server
ssh student206@143.47.98.96

## STEP 2: Clone/Update Repository
cd ~
git clone https://github.com/MI804-png/webProgramming2_Seminar_with_Lilla.git webprogramming_with_lilla || (cd webprogramming_with_lilla && git pull)

## STEP 3: Navigate and Setup
cd ~/webprogramming_with_lilla/exercise
chmod +x deploy-linux.sh setup-database.sh scripts/*.sh

## STEP 4: Run Deployment Script
./deploy-linux.sh

## ALTERNATIVE: Manual Deployment
# If automatic script fails, run these commands:

# Install Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Install dependencies
npm ci

# Setup database
sudo mysql -u root << 'EOSQL'
CREATE DATABASE IF NOT EXISTS db206 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'studb206'@'localhost' IDENTIFIED BY 'mikha@2001';
GRANT ALL PRIVILEGES ON db206.* TO 'studb206'@'localhost';
FLUSH PRIVILEGES;
EOSQL

# Import database schema
mysql -u studb206 -p'mikha@2001' db206 < company_db.sql

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

## STEP 5: Verify Deployment
# Check PM2 status
pm2 status

# Check logs
pm2 logs app206 --lines 20

# Test health endpoint
curl http://localhost:4206/app206/health

# Test in browser
# Visit: http://143.47.98.96:4206/app206/

## TROUBLESHOOTING

# If app won't start:
pm2 logs app206 --lines 50

# If database connection fails:
mysql -u studb206 -p'mikha@2001' -e "SHOW DATABASES;"

# If port already in use:
pm2 delete app206
pm2 start ecosystem.config.js

# Check if Node.js is installed:
node --version
npm --version

# Restart application:
pm2 restart app206

## USEFUL COMMANDS
pm2 list                    # List all processes
pm2 stop app206             # Stop application
pm2 restart app206          # Restart application
pm2 delete app206           # Delete process
pm2 logs app206             # View logs
pm2 monit                   # Monitor resources
