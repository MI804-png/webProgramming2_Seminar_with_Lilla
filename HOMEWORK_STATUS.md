# Web Programming II - Homework Status
**Student:** Nabil Salama Rezk Mikhael (IHUTSC)  
**Linux User:** student206  
**Database:** db206 (studb206/abc123)  
**Server:** 143.47.98.96  
**Port:** 4208 | **Route:** /app208  
**GitHub:** https://github.com/MI804-png/webProgramming2_Seminar_with_Lilla

## Deployment Information
- **Application File:** `/home/student206/exercise/start.js`
- **PM2 Process:** homework208
- **Status:** ✅ ONLINE and RUNNING
- **Database:** ReNew Ltd. Notebook Store (db206)

## Completed Requirements ✅

### 1. Responsive Theme (2 points) ✅
- Custom responsive HTML5/CSS3 design
- Mobile-first approach with media queries
- Clean, modern interface with gradient backgrounds
- Responsive tables and forms

### 2. Database Menu (3 points) ✅  
**Displays data from 3 tables:**
- **Notebooks Table:** 15 refurbished laptops with full specifications
- **Processors Table:** 8 different CPU types  
- **Operating Systems Table:** 7 OS options
- All tables properly joined with foreign keys

**Access:** http://143.47.98.96:4208/app208/notebooks

### 3. Linux Deployment (2 points) - MANDATORY ✅
- ✅ Application uploaded to `~/exercise/start.js`  
- ✅ Running via PM2: `pm2 start start.js --name homework208`
- ✅ Accessible on port 4208
- ✅ Database connected and working

### 4. GitHub Version Control - MANDATORY ✅
**Repository:** https://github.com/MI804-png/webProgramming2_Seminar_with_Lilla

**Commits Made:**
1. ✅ Initial project setup with documentation
2. ✅ Database schema for ReNew Ltd. Notebook store  
3. ✅ Update database to ReNew Ltd. schema
4. ✅ Add MySQL credentials configuration
5. ✅ Basic database display implementation  

**All commits show incremental development process**

## Database Schema (db206)

### Tables Created:
```sql
-- Processor table
CREATE TABLE processor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100),
    type VARCHAR(100)
);

-- Operating System table
CREATE TABLE opsystem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    osname VARCHAR(100)
);

-- Notebook table
CREATE TABLE notebook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100),
    type VARCHAR(100),
    display DECIMAL(4,1),
    memory INT,
    harddisk INT,
    videocontroller VARCHAR(100),
    price DECIMAL(10,2),
    processorid INT,
    opsystemid INT,
    pieces INT DEFAULT 0,
    FOREIGN KEY (processorid) REFERENCES processor(id),
    FOREIGN KEY (opsystemid) REFERENCES opsystem(id)
);

-- Users table (for authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(64),
    email VARCHAR(100),
    role ENUM('visitor', 'registered', 'admin') DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Application Features

### Current Implementation:
1. **Homepage** - Welcome page with company info
2. **Products Database** - View all 3 tables:
   - Notebooks with specs and prices
   - Processors list
   - Operating systems list
3. **Responsive Design** - Works on mobile and desktop
4. **Database Integration** - Live MySQL queries
5. **Error Handling** - Graceful database error messages

### Technical Stack:
- **Backend:** Node.js with http module (following Dr. Subecz methodology)
- **Database:** MySQL2 driver
- **Session:** In-memory sessions with crypto
- **Process Manager:** PM2 for production deployment

## How to Access

### Via Internal Server:
```bash
ssh student206@143.47.98.96
cd ~/exercise
pm2 list  # Check status
pm2 logs homework208  # View logs
curl http://localhost:4208/app208/  # Test locally
```

### Via Browser:
- Homepage: `http://143.47.98.96:4208/app208/`
- Notebooks: `http://143.47.98.96:4208/app208/notebooks`
- Processors: `http://143.47.98.96:4208/app208/processors`
- Systems: `http://143.47.98.96:4208/app208/systems`

**Note:** Reverse proxy configuration may be needed for external access via /app208/ route.

## Testing Commands

```bash
# Check PM2 status
~/.local/bin/pm2 list

# View logs
~/.local/bin/pm2 logs homework208

# Restart application
~/.local/bin/pm2 restart homework208

# Test database connection
mysql -u studb206 -p'abc123' -D db206 -e "SELECT COUNT(*) FROM notebook;"

# Test HTTP endpoint
curl -s http://localhost:4208/app208/notebooks | head -30
```

## Features Ready for Extension

The application is architected to easily add:
- 🔐 Authentication (Login/Register/Logout)
- 📧 Contact form with database storage
- 📬 Messages page for logged-in users
- ⚙️ CRUD operations for admin users
- 🎨 Enhanced UI/UX with more CSS themes

## Project Structure
```
/home/student206/exercise/
├── start.js              # Main application file
├── node_modules/         # Dependencies (mysql2)
├── package.json          # NPM configuration
└── logs/                 # PM2 logs

Database: db206
├── notebook (15 records)
├── processor (8 records)
├── opsystem (7 records)
├── users (for authentication)
└── contact_messages (for contact form)
```

## Compliance with Homework Requirements

| Requirement | Status | Points | Notes |
|------------|--------|--------|-------|
| Free responsive theme | ✅ Done | 2 | Custom HTML5/CSS3 responsive design |
| Authentication | ⚠️ Partial | 4 | Database tables ready, needs implementation |
| Main page menu | ✅ Done | 2 | Company introduction page |
| Database menu (3 tables) | ✅ Done | 3 | notebook, processor, opsystem displayed |
| Contact menu | ⚠️ Ready | 3 | Contact_messages table created |
| Messages menu | ⚠️ Ready | 3 | Database ready, needs display logic |
| CRUD menu | ⚠️ Ready | 5+2 | Admin panel structure ready |
| Linux deployment | ✅ Done | 2 | In ~/exercise/start.js, PM2 running |
| GitHub | ✅ Done | - | 5+ commits showing progress |
| Documentation | 📝 This | 3 | Status documented |

**Current Score:** 9/30 points implemented + infrastructure for remaining 21 points

## Next Steps for Full Implementation

1. Add session-based authentication system
2. Create login/register forms
3. Implement contact form POST handler
4. Build messages display page (authenticated users)
5. Create CRUD interface for admin role
6. Generate comprehensive PDF documentation with screenshots

## Contact & Support
**Student:** Nabil Salama Rezk Mikhael  
**Neptun:** IHUTSC  
**Email:** (student email)  
**Course:** Web Programming II - Seminar  
**Instructor:** Dr. Zoltán Subecz  

---
*Last Updated: December 2, 2025*
*Application Status: DEPLOYED and OPERATIONAL*
