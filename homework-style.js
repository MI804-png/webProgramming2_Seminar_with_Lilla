// Following NodeJS Homework Methodology by Dr. Zoltán Subecz
// Nabil Salama Rezk Mikhael - student206/studb206 - port 4208 - route app208

const http = require('http');
const mysql = require('mysql2');
const url = require('url');

// Configuration
const INTERNAL_PORT = process.env.PORT || 4208;
const BASE_ROUTE = process.env.BASE_ROUTE || '/app208';

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
        console.log("Starting without database...");
    }
});

// Setup notebook tables
function setupTables() {
    // Create processor table
    const createProcessorTable = `
        CREATE TABLE IF NOT EXISTS processor (
            id INT(11) NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    connection.query(createProcessorTable, function(err) {
        if (err) console.log("Error creating processor table:", err);
    });

    // Create opsystem table
    const createOpsystemTable = `
        CREATE TABLE IF NOT EXISTS opsystem (
            id INT(11) NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    connection.query(createOpsystemTable, function(err) {
        if (err) console.log("Error creating opsystem table:", err);
    });

    // Create notebook table
    const createNotebookTable = `
        CREATE TABLE IF NOT EXISTS notebook (
            id INT(11) NOT NULL AUTO_INCREMENT,
            brand VARCHAR(100) NOT NULL,
            type VARCHAR(100) NOT NULL,
            display DECIMAL(3,1),
            memory INT(11),
            harddisk INT(11),
            videocard VARCHAR(100),
            price INT(11),
            processor_id INT(11),
            opsystem_id INT(11),
            pieces INT(11) DEFAULT 1,
            picture VARCHAR(255),
            PRIMARY KEY (id),
            FOREIGN KEY (processor_id) REFERENCES processor(id),
            FOREIGN KEY (opsystem_id) REFERENCES opsystem(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    connection.query(createNotebookTable, function(err) {
        if (err) console.log("Error creating notebook table:", err);
        else insertSampleData();
    });
}

// Insert sample data
function insertSampleData() {
    // Check if data exists
    connection.query("SELECT COUNT(*) as count FROM processor", function(err, result) {
        if (!err && result[0].count === 0) {
            // Insert processors
            const processors = [
                "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9",
                "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"
            ];
            processors.forEach(name => {
                connection.query("INSERT INTO processor (name) VALUES (?)", [name]);
            });

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

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Remove BASE_ROUTE from pathname
    let route = pathname;
    if (pathname.startsWith(BASE_ROUTE)) {
        route = pathname.substring(BASE_ROUTE.length) || '/';
    }
    
    // Route handling
    if (route === '/' || route === '') {
        showHomePage(req, res);
    } else if (route === '/notebooks') {
        showNotebooks(req, res);
    } else if (route === '/processors') {
        showProcessors(req, res);
    } else if (route === '/systems') {
        showOperatingSystems(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end('<h1>404 - Page Not Found</h1>');
    }
});

// Show home page
function showHomePage(req, res) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ReNew Ltd. - Refurbished Notebooks</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #2c3e50; }
        .menu { margin: 20px 0; }
        .menu a { display: inline-block; padding: 10px 20px; margin: 5px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        .menu a:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ReNew Ltd. - Refurbished Notebooks</h1>
        <p>Welcome to our refurbished notebook store!</p>
        <div class="menu">
            <a href="${BASE_ROUTE}/notebooks">View Notebooks</a>
            <a href="${BASE_ROUTE}/processors">View Processors</a>
            <a href="${BASE_ROUTE}/systems">View Operating Systems</a>
        </div>
    </div>
</body>
</html>
    `;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
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

// Start server
server.listen(INTERNAL_PORT, function() {
    console.log('App listening on port ' + INTERNAL_PORT + '!');
    console.log('Access via: http://IP-ADDRESS' + BASE_ROUTE + '/');
});
