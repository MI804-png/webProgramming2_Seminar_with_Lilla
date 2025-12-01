# ReNew Ltd. Notebook Database Setup

## Database Schema

The application is now configured to use the **ReNew Ltd. Notebook** database schema for selling refurbished notebooks.

### Database Name: `notebook`

### Tables Structure:

1. **processor** - Processor information
   - `id` (INT, Primary Key, Auto Increment)
   - `manufacturer` (VARCHAR) - Intel, AMD, etc.
   - `type` (VARCHAR) - Processor model

2. **opsystem** - Operating Systems
   - `id` (INT, Primary Key, Auto Increment)
   - `osname` (VARCHAR) - Operating system name

3. **notebook** - Notebook inventory
   - `id` (INT, Primary Key, Auto Increment)
   - `manufacturer` (VARCHAR) - Dell, HP, Lenovo, etc.
   - `type` (VARCHAR) - Model name
   - `display` (DECIMAL) - Screen size in inches
   - `memory` (INT) - RAM in MiB
   - `harddisk` (INT) - Storage in GB
   - `videocontroller` (VARCHAR) - Graphics card
   - `price` (DECIMAL) - Price in pounds
   - `processorid` (INT, Foreign Key → processor.id)
   - `opsystemid` (INT, Foreign Key → opsystem.id)
   - `pieces` (INT) - Stock quantity

4. **users** - User authentication
5. **contact_messages** - Customer inquiries

## Current Status

✅ Database schema created: `notebook_db.sql`  
✅ Configuration updated: `ecosystem.config.js`  
✅ Application running at: http://143.47.98.96/app206/

⚠️ **Currently running in DEMO MODE** with mock data because:
- MySQL database user 'student206' doesn't have access to create the 'notebook' database
- Requires database administrator to run: `mysql < notebook_db.sql`

## To Enable Full Database Functionality

Contact your server administrator to:

1. Create the database and import schema:
```bash
mysql -u root -p < notebook_db.sql
```

2. Grant permissions:
```sql
GRANT ALL PRIVILEGES ON notebook.* TO 'student206'@'localhost';
FLUSH PRIVILEGES;
```

3. Restart the application:
```bash
pm2 restart app206
```

## Sample Data

The database includes:
- 8 processors (Intel Core i5/i7, AMD Ryzen)
- 7 operating systems (Windows 10/11, Ubuntu, No OS)
- 15 refurbished notebooks with realistic specifications and prices
- 2 default users (admin/admin123, testuser/hello)
- 3 sample contact messages

## Mock Mode Features

While running in mock mode, the application provides:
- Full user authentication
- In-memory notebook inventory
- Contact message system
- All CRUD operations (non-persistent)

Data resets on application restart.
