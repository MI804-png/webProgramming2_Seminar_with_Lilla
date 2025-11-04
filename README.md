# TechCorp Solutions – Web Programming II Homework

This Node.js + Express app fulfills the homework requirements: free responsive theme, authentication with roles, database views, contact/messages, and an admin CRUD.

## Theme
- Bootswatch (Lux) + Bootstrap 5
- Integrated in `views/layout.ejs` via CDN

## Roles
- visitor (not logged-in)
- registered (sees Messages menu)
- admin (sees Admin menu + CRUD)

Demo users (auto-seeded on startup):
- Admin: admin / admin123
- Registered: testuser / hello

## Run locally (Windows PowerShell)
```powershell
cd c:\webprogramming2_homework\exercise
npm install
npm start
# Open http://localhost:3000
```

Optional environment variables (defaults in parentheses):
- DB_HOST (localhost)
- DB_PORT (3306)
- DB_USER (root)
- DB_PASS (empty)
- DB_NAME (company_db)
- SESSION_SECRET (webprogramming2_secret_key_2025)

Import database once:
- Import `company_db.sql` into MySQL.

## Deploy to Linux server
Target path: `/home/<username>/exercise/start.js`
1) Copy project to server (scp/git). 2) `npm ci` 3) Import SQL 4) `node start.js`.

Optional process managers:
- PM2: `pm2 start ecosystem.config.js`
- systemd: see `docs/systemd-techcorp.service` (templated for user instance)

See also:
- Deployment guide: `docs/deploy-linux.md`
- Production env template: `.env.production.example`

## IHUTSC Server Deployment

**Student:** Nabil Salama Rezk Mikhael  
**Server:** 143.47.98.96:4206  
**Route:** /app206  

### Quick Deployment Steps:

1. **Test connection:**
   ```powershell
   .\test-connection.ps1
   ```

2. **Upload to server:**
   ```powershell
   .\upload-to-ihutsc.ps1
   ```

3. **Connect and deploy:**
   ```bash
   ssh student206@143.47.98.96
   cd ~/exercise
   chmod +x deploy-ihutsc-full.sh
   ./deploy-ihutsc-full.sh
   ```

4. **Access application:**
   - URL: http://143.47.98.96:4206/app206
   - Health: http://143.47.98.96:4206/app206/health
   - Admin: admin / admin123

### Management Commands:
```bash
pm2 status          # Check status
pm2 logs app206     # View logs  
pm2 restart app206  # Restart app
pm2 stop app206     # Stop app
```

## Project work + GitHub
- Make >=5 commits showing progress.
- Use GitHub Projects/Issues to attribute tasks per member.
- Repo must be public for evaluation.

## Structure
- `start.js`, `routes/`, `views/`, `public/`, `company_db.sql`

Additional docs:
- Full documentation draft: `docs/Documentation-Full.md`
- Deployment: `docs/deploy-linux.md`
