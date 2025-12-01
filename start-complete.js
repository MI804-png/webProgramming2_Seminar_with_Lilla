// Web Programming II - Complete Homework Implementation
// Following NodeJS Homework Methodology by Dr. Zoltán Subecz
// Nabil Salama Rezk Mikhael - student206/studb206 - port 4208 - route app208
// All Requirements: Authentication, CRUD, Contact, Messages, Database Display

const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

// Configuration
const INTERNAL_PORT = process.env.PORT || 4208;
const BASE_ROUTE = process.env.BASE_ROUTE || '/app208';

// Session storage (in-memory)
const sessions = {};

// Helper: Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: Generate session ID
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

// Helper: Parse cookies
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) cookies[name] = value;
        });
    }
    return cookies;
}

// Helper: Get session
function getSession(req) {
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    return sessionId && sessions[sessionId] ? sessions[sessionId] : null;
}

// Helper: Set session
function setSession(res, sessionData) {
    const sessionId = generateSessionId();
    sessions[sessionId] = sessionData;
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=${BASE_ROUTE}/; HttpOnly; Max-Age=86400`);
    return sessionId;
}

// Helper: Destroy session
function destroySession(req, res) {
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }
    res.setHeader('Set-Cookie', `sessionId=; Path=${BASE_ROUTE}/; HttpOnly; Max-Age=0`);
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Database configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'studb206',
    password: 'abc123',
    database: 'db206'
});

// Connect to database
connection.connect(function(err) {
    if (!err) {
        console.log("Database is connected ...");
        setupTables();
    } else {
        console.log("Error connecting database ...");
        console.log(err);
    }
});

// Setup all required tables
function setupTables() {
    // Create admin user if not exists
    connection.query("SELECT * FROM users WHERE username = 'admin'", function(err, result) {
        if (!err && result.length === 0) {
            const adminHash = hashPassword('admin123');
            connection.query(
                "INSERT INTO users (username, password_hash, email, role) VALUES ('admin', ?, 'admin@renew.com', 'admin')",
                [adminHash],
                function(err) {
                    if (!err) console.log("✅ Admin user created: admin/admin123");
                }
            );
        }
    });
    
    // Check if sample data already exists
    connection.query("SELECT COUNT(*) as count FROM notebook", function(err, result) {
        if (!err && result[0].count === 0) {
            // Insert operating systems
            const opsystems = [
                "Windows 10", "Windows 11", "Ubuntu 20.04", "Ubuntu 22.04",
                "macOS Monterey", "macOS Ventura", "No OS"
            ];
            opsystems.forEach(name => {
                connection.query("INSERT INTO opsystem (name) VALUES (?)", [name]);
            });

            // Insert sample notebooks
            const notebooks = [
                ['Dell', 'Latitude 5420', 14.0, 8, 256, 'Intel UHD', 89900, 2, 1, 3, 'dell-latitude.jpg'],
                ['HP', 'EliteBook 840', 14.0, 16, 512, 'Intel Iris Xe', 129900, 3, 2, 2, 'hp-elitebook.jpg'],
                ['Lenovo', 'ThinkPad T14', 14.0, 16, 512, 'AMD Radeon', 119900, 6, 1, 4, 'lenovo-thinkpad.jpg'],
                ['ASUS', 'ZenBook 14', 14.0, 8, 512, 'Intel UHD', 99900, 2, 2, 2, 'asus-zenbook.jpg'],
                ['Acer', 'TravelMate P2', 15.6, 8, 256, 'Intel UHD', 79900, 1, 1, 5, 'acer-travelmate.jpg']
            ];
            
            notebooks.forEach(nb => {
                const query = "INSERT INTO notebook (brand, type, display, memory, harddisk, videocard, price, processor_id, opsystem_id, pieces, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                connection.query(query, nb, function(err) {
                    if (err) console.log("Error inserting notebook:", err);
                });
            });
            
            console.log("Sample data inserted");
        }
    });
}

// Create HTTP server with ALL homework requirements
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const session = getSession(req);
    
    // Remove BASE_ROUTE from pathname
    let route = pathname;
    if (pathname.startsWith(BASE_ROUTE)) {
        route = pathname.substring(BASE_ROUTE.length) || '/';
    }
    
    // Route handling with authentication and CRUD
    if (route === '/' || route === '') {
        showHomePage(req, res, session);
    } else if (route === '/notebooks' || route === '/database') {
        showDatabasePage(req, res, session);
    } else if (route === '/processors') {
        showProcessors(req, res, session);
    } else if (route === '/systems') {
        showOperatingSystems(req, res, session);
    } else if (route === '/register') {
        handleRegister(req, res, session);
    } else if (route === '/login') {
        handleLogin(req, res, session);
    } else if (route === '/logout') {
        handleLogout(req, res, session);
    } else if (route === '/contact') {
        handleContact(req, res, session);
    } else if (route === '/messages') {
        handleMessages(req, res, session);
    } else if (route.startsWith('/crud')) {
        handleCRUD(req, res, session, route);
    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(renderPage('404 Not Found', '<h1>404 - Page Not Found</h1><p><a href="' + BASE_ROUTE + '/">Go Home</a></p>', session));
    }
});

// HTML Template with navigation
function renderPage(title, content, session) {
    const user = session ? session.user : null;
    const isLoggedIn = !!user;
    const isAdmin = user && user.role === 'admin';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - ReNew Ltd.</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .header-top {
            background: #2c3e50;
            color: white;
            padding: 10px 0;
            font-size: 0.9em;
        }
        .header-top .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .logo {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
            text-decoration: none;
            padding: 15px 0;
            display: inline-block;
        }
        nav { background: white; padding: 0; }
        nav ul {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        nav ul li a {
            display: block;
            padding: 15px 20px;
            color: #333;
            text-decoration: none;
            transition: all 0.3s;
            font-weight: 500;
        }
        nav ul li a:hover, nav ul li a.active {
            background: #667eea;
            color: white;
        }
        main {
            background: white;
            margin: 30px auto;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            min-height: 500px;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
        }
        h2 { color: #667eea; margin: 25px 0 15px; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #2c3e50;
        }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-group textarea {
            resize: vertical;
            min-height: 120px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            font-size: 1em;
            font-weight: 600;
            transition: all 0.3s;
            margin: 5px;
        }
        .btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary { background: #95a5a6; }
        .btn-secondary:hover { background: #7f8c8d; }
        .btn-danger { background: #e74c3c; }
        .btn-danger:hover { background: #c0392b; }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #229954; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        tr:hover { background: #f8f9fa; }
        .price {
            color: #27ae60;
            font-weight: bold;
            font-size: 1.1em;
        }
        .alert {
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .alert-success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .alert-error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .alert-info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .card {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 30px 0;
            margin-top: 50px;
        }
        @media (max-width: 768px) {
            nav ul { flex-direction: column; }
            main { padding: 20px; margin: 15px; }
            table { font-size: 0.9em; }
        }
        .actions a { margin: 0 5px; }
    </style>
</head>
<body>
    <header>
        <div class="header-top">
            <div class="container">
                <div>📧 info@renew-ltd.com | 📞 +36 1 234 5678</div>
                <div>${isLoggedIn ? `Welcome, <strong>${escapeHtml(user.username)}</strong> (${escapeHtml(user.role)})` : 'Welcome, Guest'}</div>
            </div>
        </div>
        <div class="container">
            <a href="${BASE_ROUTE}/" class="logo">♻️ ReNew Ltd.</a>
        </div>
        <nav>
            <ul>
                <li><a href="${BASE_ROUTE}/">🏠 Home</a></li>
                <li><a href="${BASE_ROUTE}/database">💻 Products</a></li>
                <li><a href="${BASE_ROUTE}/contact">📧 Contact</a></li>
                ${isLoggedIn ? `<li><a href="${BASE_ROUTE}/messages">📬 Messages</a></li>` : ''}
                ${isAdmin ? `<li><a href="${BASE_ROUTE}/crud">⚙️ Admin</a></li>` : ''}
                ${!isLoggedIn ? `
                    <li><a href="${BASE_ROUTE}/login">🔐 Login</a></li>
                    <li><a href="${BASE_ROUTE}/register">📝 Register</a></li>
                ` : `<li><a href="${BASE_ROUTE}/logout">🚪 Logout</a></li>`}
            </ul>
        </nav>
    </header>
    <div class="container">
        <main>${content}</main>
    </div>
    <footer>
        <div class="container">
            <p>&copy; 2025 ReNew Ltd. - Quality Refurbished Notebooks</p>
            <p>Web Programming II - Homework - Nabil Salama Rezk Mikhael (IHUTSC)</p>
        </div>
    </footer>
</body>
</html>`;
}

// Show spectacular home page
function showHomePage(req, res, session) {
    const content = `
        <h1>Welcome to ReNew Ltd. 🌟</h1>
        <div class="card">
            <h2>Your Trusted Partner in Refurbished Technology</h2>
            <p style="font-size: 1.1em; line-height: 1.8;">
                At <strong>ReNew Ltd.</strong>, we specialize in providing high-quality refurbished notebooks 
                that combine performance, reliability, and affordability. Our mission is to make premium technology 
                accessible while promoting sustainability.
            </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">
            <div class="card">
                <h3>🔧 Quality Assured</h3>
                <p>Every notebook undergoes rigorous testing by certified technicians.</p>
            </div>
            <div class="card">
                <h3>💰 Best Prices</h3>
                <p>Save up to 70% compared to new devices.</p>
            </div>
            <div class="card">
                <h3>🌍 Eco-Friendly</h3>
                <p>Reduce electronic waste and promote sustainability.</p>
            </div>
        </div>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${BASE_ROUTE}/database" class="btn" style="font-size: 1.1em; padding: 15px 40px;">Browse Products →</a>
        </div>
    `;
    const html = renderPage('Home', content, session);
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
}

// Show database page with ALL 3 tables
function showDatabasePage(req, res, session) {
    connection.query(`
        SELECT n.*, 
               CONCAT(p.manufacturer, ' ', p.type) as processor_name, 
               o.osname as os_name 
        FROM notebook n
        LEFT JOIN processor p ON n.processorid = p.id
        LEFT JOIN opsystem o ON n.opsystemid = o.id
        ORDER BY n.id
    `, function(err, notebooks) {
        if (err) {
            const html = renderPage('Error', `<div class="alert alert-error">Database error: ${escapeHtml(err.message)}</div>`, session);
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(html);
        }
        
        connection.query("SELECT * FROM processor ORDER BY id", function(err2, processors) {
            connection.query("SELECT * FROM opsystem ORDER BY id", function(err3, systems) {
                let content = `
                    <h1>💻 Our Product Database</h1>
                    <h2>Available Notebooks (${notebooks.length})</h2>
                    <table>
                        <tr>
                            <th>ID</th><th>Brand</th><th>Model</th><th>Display</th>
                            <th>Memory</th><th>HDD</th><th>Processor</th><th>OS</th>
                            <th>Stock</th><th>Price</th>
                        </tr>
                `;
                
                notebooks.forEach(nb => {
                    content += `
                        <tr>
                            <td>${nb.id}</td>
                            <td>${escapeHtml(nb.manufacturer)}</td>
                            <td>${escapeHtml(nb.type)}</td>
                            <td>${nb.display}"</td>
                            <td>${nb.memory} MB</td>
                            <td>${nb.harddisk} GB</td>
                            <td>${escapeHtml(nb.processor_name || 'N/A')}</td>
                            <td>${escapeHtml(nb.os_name || 'N/A')}</td>
                            <td>${nb.pieces}</td>
                            <td class="price">${nb.price} Ft</td>
                        </tr>
                    `;
                });
                
                content += `</table><h2>Processors (${processors.length})</h2><table><tr><th>ID</th><th>Processor</th></tr>`;
                processors.forEach(p => {
                    content += `<tr><td>${p.id}</td><td>${escapeHtml(p.manufacturer)} ${escapeHtml(p.type)}</td></tr>`;
                });
                
                content += `</table><h2>Operating Systems (${systems.length})</h2><table><tr><th>ID</th><th>OS</th></tr>`;
                systems.forEach(s => {
                    content += `<tr><td>${s.id}</td><td>${escapeHtml(s.osname)}</td></tr>`;
                });
                content += `</table>`;
                
                const html = renderPage('Products Database', content, session);
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(html);
            });
        });
    });
}

// Show notebooks
function showNotebooks(req, res) {
    connection.query(`
        SELECT n.*, 
               CONCAT(p.manufacturer, ' ', p.type) as processor_name, 
               o.osname as os_name 
        FROM notebook n
        LEFT JOIN processor p ON n.processorid = p.id
        LEFT JOIN opsystem o ON n.opsystemid = o.id
        ORDER BY n.id
    `, function(err, result) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end('<h1>Database Error</h1><p>' + err.message + '</p>');
            return;
        }
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Notebooks - ReNew Ltd.</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        tr:hover { background: #f5f5f5; }
        .price { color: #27ae60; font-weight: bold; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Available Notebooks (${result.length})</h1>
        <p><a href="${BASE_ROUTE}/">← Back to Home</a></p>
        <table>
            <tr>
                <th>ID</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Display</th>
                <th>Memory</th>
                <th>HDD</th>
                <th>Processor</th>
                <th>OS</th>
                <th>Pieces</th>
                <th>Price</th>
            </tr>
        `;
        
        for (let i = 0; i < result.length; i++) {
            const nb = result[i];
            html += `
            <tr>
                <td>${nb.id}</td>
                <td>${nb.manufacturer}</td>
                <td>${nb.type}</td>
                <td>${nb.display}"</td>
                <td>${nb.memory} GB</td>
                <td>${nb.harddisk} GB</td>
                <td>${nb.processor_name}</td>
                <td>${nb.os_name}</td>
                <td>${nb.pieces}</td>
                <td class="price">${nb.price.toLocaleString()} Ft</td>
            </tr>
            `;
        }
        
        html += `
        </table>
    </div>
</body>
</html>
        `;
        
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });
}

// Show processors
function showProcessors(req, res) {
    connection.query("SELECT * FROM processor ORDER BY id", function(err, result) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end('<h1>Database Error</h1>');
            return;
        }
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Processors - ReNew Ltd.</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Available Processors (${result.length})</h1>
        <p><a href="${BASE_ROUTE}/">← Back to Home</a></p>
        <table>
            <tr><th>ID</th><th>Processor Name</th></tr>
        `;
        
        for (let i = 0; i < result.length; i++) {
            html += `<tr><td>${result[i].id}</td><td>${result[i].manufacturer} ${result[i].type}</td></tr>`;
        }
        
        html += `
        </table>
    </div>
</body>
</html>
        `;
        
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });
}

// Show operating systems
function showOperatingSystems(req, res) {
    connection.query("SELECT * FROM opsystem ORDER BY id", function(err, result) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end('<h1>Database Error</h1>');
            return;
        }
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Operating Systems - ReNew Ltd.</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Available Operating Systems (${result.length})</h1>
        <p><a href="${BASE_ROUTE}/">← Back to Home</a></p>
        <table>
            <tr><th>ID</th><th>Operating System</th></tr>
        `;
        
        for (let i = 0; i < result.length; i++) {
            html += `<tr><td>${result[i].id}</td><td>${result[i].osname}</td></tr>`;
        }
        
        html += `
        </table>
    </div>
</body>
</html>
        `;
        
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    });
}

// Authentication: Register
function handleRegister(req, res, session) {
    if (req.method === 'GET') {
        const content = `
            <h1>📝 Register New Account</h1>
            <div class="card">
                <form method="POST" action="${BASE_ROUTE}/register">
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="password" name="password" required minlength="6">
                    </div>
                    <button type="submit" class="btn">Register</button>
                    <a href="${BASE_ROUTE}/login" class="btn btn-secondary">Login Instead</a>
                </form>
            </div>
        `;
        const html = renderPage('Register', content, session);
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = querystring.parse(body);
            const passwordHash = hashPassword(data.password);
            
            connection.query(
                "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, 'registered')",
                [data.username, passwordHash, data.email],
                function(err) {
                    if (err) {
                        const content = `<div class="alert alert-error">Registration failed: ${escapeHtml(err.message)}</div><a href="${BASE_ROUTE}/register" class="btn">Try Again</a>`;
                        const html = renderPage('Error', content, session);
                        res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                        return res.end(html);
                    }
                    
                    const content = `<div class="alert alert-success"><h2>✅ Registration Successful!</h2><p>You can now login.</p></div><a href="${BASE_ROUTE}/login" class="btn">Go to Login</a>`;
                    const html = renderPage('Success', content, session);
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(html);
                }
            );
        });
    }
}

// Authentication: Login
function handleLogin(req, res, session) {
    if (req.method === 'GET') {
        const content = `
            <h1>🔐 Login</h1>
            <div class="card">
                <form method="POST" action="${BASE_ROUTE}/login">
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" required>
                    </div>
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="password" name="password" required>
                    </div>
                    <button type="submit" class="btn">Login</button>
                    <a href="${BASE_ROUTE}/register" class="btn btn-secondary">Register</a>
                </form>
                <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                    <strong>Demo:</strong> admin / admin123
                </div>
            </div>
        `;
        const html = renderPage('Login', content, session);
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = querystring.parse(body);
            const passwordHash = hashPassword(data.password);
            
            connection.query(
                "SELECT * FROM users WHERE username = ? AND password_hash = ?",
                [data.username, passwordHash],
                function(err, users) {
                    if (err || users.length === 0) {
                        const content = `<div class="alert alert-error">Invalid credentials!</div><a href="${BASE_ROUTE}/login" class="btn">Try Again</a>`;
                        const html = renderPage('Error', content, null);
                        res.writeHead(401, {'Content-Type': 'text/html; charset=utf-8'});
                        return res.end(html);
                    }
                    
                    setSession(res, { user: users[0] });
                    res.writeHead(302, {'Location': `${BASE_ROUTE}/`});
                    res.end();
                }
            );
        });
    }
}

// Authentication: Logout
function handleLogout(req, res, session) {
    destroySession(req, res);
    res.writeHead(302, {'Location': `${BASE_ROUTE}/`});
    res.end();
}

// Contact Form
function handleContact(req, res, session) {
    if (req.method === 'GET') {
        const content = `
            <h1>📧 Contact Us</h1>
            <div class="card">
                <p style="font-size: 1.1em; margin-bottom: 20px;">
                    Have questions? We'd love to hear from you!
                </p>
                <form method="POST" action="${BASE_ROUTE}/contact">
                    <div class="form-group">
                        <label>Your Name *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Your Email *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Subject</label>
                        <input type="text" name="subject" placeholder="What is this about?">
                    </div>
                    <div class="form-group">
                        <label>Message *</label>
                        <textarea name="message" required></textarea>
                    </div>
                    <button type="submit" class="btn">Send Message 📤</button>
                </form>
            </div>
        `;
        const html = renderPage('Contact', content, session);
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = querystring.parse(body);
            
            connection.query(
                "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
                [data.name, data.email, data.subject || 'General Inquiry', data.message],
                function(err) {
                    if (err) {
                        const content = `<div class="alert alert-error">Error: ${escapeHtml(err.message)}</div>`;
                        const html = renderPage('Error', content, session);
                        res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                        return res.end(html);
                    }
                    
                    const content = `<div class="alert alert-success"><h2>✅ Message Sent!</h2><p>We'll get back to you soon.</p></div><a href="${BASE_ROUTE}/" class="btn">← Home</a>`;
                    const html = renderPage('Success', content, session);
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(html);
                }
            );
        });
    }
}

// Messages Page (Logged-in users only)
function handleMessages(req, res, session) {
    if (!session || !session.user) {
        res.writeHead(302, {'Location': `${BASE_ROUTE}/login`});
        return res.end();
    }
    
    connection.query(
        "SELECT * FROM contact_messages ORDER BY created_at DESC",
        function(err, messages) {
            if (err) {
                const content = `<div class="alert alert-error">Error: ${escapeHtml(err.message)}</div>`;
                const html = renderPage('Error', content, session);
                res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(html);
            }
            
            let content = `<h1>📬 Contact Messages (${messages.length})</h1><div class="alert alert-info">Only logged-in users can view this page.</div>`;
            
            messages.forEach(msg => {
                const date = new Date(msg.created_at);
                content += `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong style="font-size: 1.1em;">${escapeHtml(msg.name)}</strong>
                            <span style="color: #666;">${date.toLocaleString()}</span>
                        </div>
                        <div style="color: #667eea; margin-bottom: 5px;">📧 ${escapeHtml(msg.email)}</div>
                        <div style="font-weight: 600; margin: 10px 0;">Subject: ${escapeHtml(msg.subject || 'No subject')}</div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">${escapeHtml(msg.message)}</div>
                    </div>
                `;
            });
            
            const html = renderPage('Messages', content, session);
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        }
    );
}

// CRUD Operations (Admin only)
function handleCRUD(req, res, session, route) {
    if (!session || !session.user || session.user.role !== 'admin') {
        res.writeHead(302, {'Location': `${BASE_ROUTE}/login`});
        return res.end();
    }
    
    const parts = route.split('/').filter(p => p);
    const action = parts[1] || 'list';
    const id = parts[2];
    
    if (action === 'list' || !action) {
        // List notebooks
        connection.query(
            "SELECT n.*, CONCAT(p.manufacturer, ' ', p.type) as proc, o.osname FROM notebook n LEFT JOIN processor p ON n.processorid = p.id LEFT JOIN opsystem o ON n.opsystemid = o.id ORDER BY n.id",
            function(err, notebooks) {
                if (err) {
                    const content = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
                    const html = renderPage('Error', content, session);
                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                    return res.end(html);
                }
                
                let content = `
                    <h1>⚙️ Admin CRUD - Notebook Management</h1>
                    <div class="alert alert-info">Admin-only: Create, Read, Update, Delete notebooks</div>
                    <a href="${BASE_ROUTE}/crud/create" class="btn btn-success">➕ Add Notebook</a>
                    <table><tr><th>ID</th><th>Brand</th><th>Model</th><th>Display</th><th>Memory</th><th>Price</th><th>Actions</th></tr>
                `;
                
                notebooks.forEach(nb => {
                    content += `
                        <tr>
                            <td>${nb.id}</td>
                            <td>${escapeHtml(nb.manufacturer)}</td>
                            <td>${escapeHtml(nb.type)}</td>
                            <td>${nb.display}"</td>
                            <td>${nb.memory} MB</td>
                            <td class="price">${nb.price} Ft</td>
                            <td class="actions">
                                <a href="${BASE_ROUTE}/crud/edit/${nb.id}" class="btn btn-secondary" style="padding: 8px 15px;">✏️ Edit</a>
                                <a href="${BASE_ROUTE}/crud/delete/${nb.id}" class="btn btn-danger" style="padding: 8px 15px;" onclick="return confirm('Delete?')">🗑️ Del</a>
                            </td>
                        </tr>
                    `;
                });
                
                content += `</table>`;
                const html = renderPage('CRUD Admin', content, session);
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(html);
            }
        );
    } else if (action === 'delete' && id) {
        connection.query("DELETE FROM notebook WHERE id = ?", [id], function(err) {
            res.writeHead(302, {'Location': `${BASE_ROUTE}/crud`});
            res.end();
        });
    } else if (action === 'create') {
        if (req.method === 'GET') {
            // Get processors and OS for dropdowns
            connection.query("SELECT * FROM processor ORDER BY manufacturer", function(err, processors) {
                connection.query("SELECT * FROM opsystem ORDER BY osname", function(err2, systems) {
                    const content = `
                        <h1>➕ Add New Notebook</h1>
                        <div class="card">
                            <form method="POST" action="${BASE_ROUTE}/crud/create">
                                <div class="form-group">
                                    <label>Brand/Manufacturer *</label>
                                    <input type="text" name="manufacturer" required placeholder="e.g., Dell, HP, Lenovo">
                                </div>
                                <div class="form-group">
                                    <label>Model/Type *</label>
                                    <input type="text" name="type" required placeholder="e.g., Latitude 5420">
                                </div>
                                <div class="form-group">
                                    <label>Display Size (inches) *</label>
                                    <input type="number" name="display" step="0.1" required placeholder="e.g., 14.0">
                                </div>
                                <div class="form-group">
                                    <label>Memory (MB) *</label>
                                    <input type="number" name="memory" required placeholder="e.g., 8192">
                                </div>
                                <div class="form-group">
                                    <label>Hard Disk (GB) *</label>
                                    <input type="number" name="harddisk" required placeholder="e.g., 512">
                                </div>
                                <div class="form-group">
                                    <label>Video Controller</label>
                                    <input type="text" name="videocontroller" placeholder="e.g., Intel UHD Graphics">
                                </div>
                                <div class="form-group">
                                    <label>Price (Ft) *</label>
                                    <input type="number" name="price" required placeholder="e.g., 89900">
                                </div>
                                <div class="form-group">
                                    <label>Processor *</label>
                                    <select name="processorid" required>
                                        <option value="">-- Select Processor --</option>
                                        ${processors.map(p => `<option value="${p.id}">${escapeHtml(p.manufacturer)} ${escapeHtml(p.type)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Operating System *</label>
                                    <select name="opsystemid" required>
                                        <option value="">-- Select OS --</option>
                                        ${systems.map(s => `<option value="${s.id}">${escapeHtml(s.osname)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Pieces in Stock *</label>
                                    <input type="number" name="pieces" required value="1" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Picture Filename</label>
                                    <input type="text" name="picture" placeholder="e.g., laptop.jpg">
                                </div>
                                <button type="submit" class="btn btn-success">💾 Create Notebook</button>
                                <a href="${BASE_ROUTE}/crud" class="btn btn-secondary">Cancel</a>
                            </form>
                        </div>
                    `;
                    const html = renderPage('Add Notebook', content, session);
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(html);
                });
            });
        } else {
            // Handle POST - create
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const data = querystring.parse(body);
                const query = "INSERT INTO notebook (manufacturer, type, display, memory, harddisk, videocontroller, price, processorid, opsystemid, pieces, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const values = [data.manufacturer, data.type, data.display, data.memory, data.harddisk, data.videocontroller, data.price, data.processorid, data.opsystemid, data.pieces, data.picture];
                connection.query(query, values, function(err) {
                    if (err) {
                        const content = `<div class="alert alert-error">Error: ${escapeHtml(err.message)}</div><a href="${BASE_ROUTE}/crud/create" class="btn">Try Again</a>`;
                        const html = renderPage('Error', content, session);
                        res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                        return res.end(html);
                    }
                    res.writeHead(302, {'Location': `${BASE_ROUTE}/crud`});
                    res.end();
                });
            });
        }
    } else if (action === 'edit' && id) {
        if (req.method === 'GET') {
            // Get notebook data and lists
            connection.query("SELECT * FROM notebook WHERE id = ?", [id], function(err, notebooks) {
                if (err || notebooks.length === 0) {
                    res.writeHead(302, {'Location': `${BASE_ROUTE}/crud`});
                    return res.end();
                }
                const nb = notebooks[0];
                connection.query("SELECT * FROM processor ORDER BY manufacturer", function(err, processors) {
                    connection.query("SELECT * FROM opsystem ORDER BY osname", function(err2, systems) {
                        const content = `
                            <h1>✏️ Edit Notebook #${nb.id}</h1>
                            <div class="card">
                                <form method="POST" action="${BASE_ROUTE}/crud/edit/${nb.id}">
                                    <div class="form-group">
                                        <label>Brand/Manufacturer *</label>
                                        <input type="text" name="manufacturer" required value="${escapeHtml(nb.manufacturer)}">
                                    </div>
                                    <div class="form-group">
                                        <label>Model/Type *</label>
                                        <input type="text" name="type" required value="${escapeHtml(nb.type)}">
                                    </div>
                                    <div class="form-group">
                                        <label>Display Size (inches) *</label>
                                        <input type="number" name="display" step="0.1" required value="${nb.display}">
                                    </div>
                                    <div class="form-group">
                                        <label>Memory (MB) *</label>
                                        <input type="number" name="memory" required value="${nb.memory}">
                                    </div>
                                    <div class="form-group">
                                        <label>Hard Disk (GB) *</label>
                                        <input type="number" name="harddisk" required value="${nb.harddisk}">
                                    </div>
                                    <div class="form-group">
                                        <label>Video Controller</label>
                                        <input type="text" name="videocontroller" value="${escapeHtml(nb.videocontroller || '')}">
                                    </div>
                                    <div class="form-group">
                                        <label>Price (Ft) *</label>
                                        <input type="number" name="price" required value="${nb.price}">
                                    </div>
                                    <div class="form-group">
                                        <label>Processor *</label>
                                        <select name="processorid" required>
                                            ${processors.map(p => `<option value="${p.id}" ${p.id == nb.processorid ? 'selected' : ''}>${escapeHtml(p.manufacturer)} ${escapeHtml(p.type)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Operating System *</label>
                                        <select name="opsystemid" required>
                                            ${systems.map(s => `<option value="${s.id}" ${s.id == nb.opsystemid ? 'selected' : ''}>${escapeHtml(s.osname)}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Pieces in Stock *</label>
                                        <input type="number" name="pieces" required value="${nb.pieces}" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Picture Filename</label>
                                        <input type="text" name="picture" value="${escapeHtml(nb.picture || '')}">
                                    </div>
                                    <button type="submit" class="btn btn-success">💾 Update Notebook</button>
                                    <a href="${BASE_ROUTE}/crud" class="btn btn-secondary">Cancel</a>
                                </form>
                            </div>
                        `;
                        const html = renderPage('Edit Notebook', content, session);
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                        res.end(html);
                    });
                });
            });
        } else {
            // Handle POST - update
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const data = querystring.parse(body);
                const query = "UPDATE notebook SET manufacturer=?, type=?, display=?, memory=?, harddisk=?, videocontroller=?, price=?, processorid=?, opsystemid=?, pieces=?, picture=? WHERE id=?";
                const values = [data.manufacturer, data.type, data.display, data.memory, data.harddisk, data.videocontroller, data.price, data.processorid, data.opsystemid, data.pieces, data.picture, id];
                connection.query(query, values, function(err) {
                    if (err) {
                        const content = `<div class="alert alert-error">Error: ${escapeHtml(err.message)}</div><a href="${BASE_ROUTE}/crud/edit/${id}" class="btn">Try Again</a>`;
                        const html = renderPage('Error', content, session);
                        res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                        return res.end(html);
                    }
                    res.writeHead(302, {'Location': `${BASE_ROUTE}/crud`});
                    res.end();
                });
            });
        }
    }
}

// Start server
server.listen(INTERNAL_PORT, function() {
    console.log('✅ ReNew Ltd. Application Started!');
    console.log('📍 Port:', INTERNAL_PORT);
    console.log('🌐 Access: http://143.47.98.96' + BASE_ROUTE + '/');
    console.log('👤 Admin: admin/admin123');
});
