// TechCorp Solutions - Following NodeJS Homework Methodology
// This follows the exact structure from "Using Linux for NodeJS Homework"

const http = require('http');
const mysql = require('mysql');
const url = require('url');

// Configuration (set these based on your assignment)
// Nabil Salama Rezk Mikhael - IHUTSC - student206/studb206 - port 4206 - route app206
const INTERNAL_PORT = process.env.INTERNAL_PORT || 4206;
const BASE_ROUTE = process.env.BASE_ROUTE || '/app206';

// Database configuration (following homework methodology)
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER || 'studb206',
    password: process.env.DB_PASS || 'mikha@2001',
    database: process.env.DB_NAME || 'db206'
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

// Setup required tables (following homework methodology)
function setupTables() {
    // Create employee table if not exists (from homework)
    const createEmployeeTable = `
        CREATE TABLE IF NOT EXISTS employee (
            id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(45) NOT NULL DEFAULT '',
            address VARCHAR(70) NOT NULL DEFAULT '',
            age INT NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE = MYISAM CHARACTER SET utf8 COLLATE utf8_general_ci
    `;
    
    connection.query(createEmployeeTable, function(err) {
        if (err) {
            console.log("Error creating employee table:", err);
        } else {
            // Insert sample data if table is empty
            connection.query("SELECT COUNT(*) as count FROM employee", function(err, result) {
                if (!err && result[0].count === 0) {
                    const insertData = `
                        INSERT INTO employee (id, name, address, age) VALUES 
                        (1, 'Mark Smith', 'Budapest', 35),
                        (2, 'Julia Brown', 'Szeged', 20),
                        (3, 'Peter Cooper', 'Debrecen', 23),
                        (4, 'TechCorp Admin', 'Headquarters', 30),
                        (5, 'System Manager', 'Remote Office', 28)
                    `;
                    connection.query(insertData, function(err) {
                        if (err) console.log("Error inserting sample data:", err);
                        else console.log("Sample employee data inserted");
                    });
                }
            });
        }
    });
    
    // Create users table for TechCorp
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(createUsersTable, function(err) {
        if (err) {
            console.log("Error creating users table:", err);
        } else {
            // Insert admin user if not exists
            connection.query("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", function(err, result) {
                if (!err && result[0].count === 0) {
                    const insertAdmin = "INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')";
                    connection.query(insertAdmin, function(err) {
                        if (err) console.log("Error creating admin user:", err);
                        else console.log("Admin user created (admin/admin123)");
                    });
                }
            });
        }
    });
}

// Main server (following homework methodology)
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
      // Route handling (following homework req.url display pattern)
    if (pathname === '/' || pathname === '') {
        // Root path - redirect to base route or show welcome page
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Solutions</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p>Welcome to TechCorp Solutions!</p>');
        res.write('<p><strong>Direct Access Mode</strong> - Running on port ' + INTERNAL_PORT + '</p>');
        res.write('<h3>Available Pages:</h3>');
        res.write('<ul>');        res.write('<li><a href="/employees">View Employees</a></li>');
        res.write('<li><a href="/crud">Employee Management (CRUD)</a></li>');
        res.write('<li><a href="/database">Database Test</a></li>');
        res.write('<li><a href="/health">Health Check</a></li>');
        res.write('<li><a href="/demo/test">Multi-level Route Demo</a></li>');
        res.write('<li><a href="' + BASE_ROUTE + '/">Access via Base Route (' + BASE_ROUTE + ')</a></li>');
        res.write('</ul>');
        res.end();
        
    } else if (pathname === BASE_ROUTE + '/' || pathname === BASE_ROUTE) {
        // Main page via base route
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Solutions</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p>Welcome to TechCorp Solutions!</p>');
        res.write('<p><strong>Base Route Mode</strong> - ' + BASE_ROUTE + '</p>');
        res.write('<h3>Available Pages:</h3>');
        res.write('<ul>');        res.write('<li><a href="' + BASE_ROUTE + '/employees">View Employees</a></li>');
        res.write('<li><a href="' + BASE_ROUTE + '/crud">Employee Management (CRUD)</a></li>');
        res.write('<li><a href="' + BASE_ROUTE + '/database">Database Test</a></li>');
        res.write('<li><a href="' + BASE_ROUTE + '/health">Health Check</a></li>');
        res.write('<li><a href="' + BASE_ROUTE + '/demo/test">Multi-level Route Demo</a></li>');
        res.write('</ul>');
        res.end();
      } else if (pathname === '/employees' || pathname === BASE_ROUTE + '/employees') {
        // Display employees table (following homework table display methodology)
        displayEmployees(req, res);
        
    } else if (pathname === '/crud' || pathname === BASE_ROUTE + '/crud') {
        // CRUD main page
        displayCrudMain(req, res);
        
    } else if (pathname === '/crud/add' || pathname === BASE_ROUTE + '/crud/add') {
        // Add new employee
        handleAddEmployee(req, res);
        
    } else if (pathname === '/crud/edit' || pathname === BASE_ROUTE + '/crud/edit') {
        // Edit employee
        handleEditEmployee(req, res, parsedUrl.query);
        
    } else if (pathname === '/crud/delete' || pathname === BASE_ROUTE + '/crud/delete') {
        // Delete employee
        handleDeleteEmployee(req, res, parsedUrl.query);
        
    } else if (pathname === '/crud/view' || pathname === BASE_ROUTE + '/crud/view') {
        // View single employee
        handleViewEmployee(req, res, parsedUrl.query);
        
    } else if (pathname === '/database' || pathname === BASE_ROUTE + '/database') {
        // Database connection test (following homework methodology)
        testDatabase(req, res);
        
    } else if (pathname === '/health' || pathname === BASE_ROUTE + '/health') {
        // Health check
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Health Check</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p style="color: green;">✅ Application is running</p>');
        res.write('<p style="color: green;">✅ Server port: ' + INTERNAL_PORT + '</p>');
        res.write('<p><a href="' + BASE_ROUTE + '/">Back to Home</a></p>');
        res.end();
        
    } else if (pathname.startsWith(BASE_ROUTE + '/')) {
        // Multi-level route demo (following homework methodology)
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Solutions</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p>Multi-level route example</p>');
        res.write('<p>This demonstrates the reverse proxy routing capability.</p>');
        res.write('<p><a href="' + BASE_ROUTE + '/">Back to Home</a></p>');
        res.end();
        
    } else {
        // 404 - Not found
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>404 - Not Found</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p><a href="' + BASE_ROUTE + '/">Go to TechCorp Home</a></p>');
        res.end();
    }
});

// Database test function (following homework methodology)
function testDatabase(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write('<h1>TechCorp Database Test</h1>');
    res.write('<p>Request URL: ' + req.url + '</p>');
    
    // Test database with a simple query instead of reconnecting
    connection.query('SELECT 1 as test', function(err, result) {
        if (!err) {
            res.write('<p style="color: green;">✅ Database is connected ...</p>');
            res.write('<p style="color: blue;">Database test query successful!</p>');
            res.write('<p>Test result: ' + JSON.stringify(result) + '</p>');
        } else {
            res.write('<p style="color: red;">❌ Error connecting database ...</p>');
            res.write('<p>Error: ' + err.message + '</p>');
        }
        
        res.write('<p><a href="' + BASE_ROUTE + '/">Back to Home</a></p>');
        res.end();
    });
}

// Display employees function (following homework table display methodology)
function displayEmployees(req, res) {
    connection.query("SELECT * FROM employee", function(err, result, fields) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Employees</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        
        if (err) {
            res.write('<p style="color: red;">Database error: ' + err + '</p>');
        } else {
            console.log(fields);
            console.log(result);
            
            // Display table (following homework methodology)
            res.write('<table border="1" cellpadding="5" cellspacing="0">');
            res.write('<tr><th>ID</th><th>Name</th><th>Address</th><th>Age</th></tr>');
            
            let text = "";
            for (let i = 0; i < result.length; i++) {
                res.write('<tr>');
                for (let j in result[i]) {
                    text += result[i][j] + " ";
                    res.write('<td>' + result[i][j] + '</td>');
                }
                text += "<br>";
                res.write('</tr>');
            }
            res.write('</table>');
            
            res.write('<h3>Raw Data (Console Format):</h3>');
            res.write('<pre>' + text + '</pre>');
        }
        
        res.write('<p><a href="' + BASE_ROUTE + '/">Back to Home</a></p>');
        res.end();
    });
}

// ===============================
// CRUD FUNCTIONS (Following Homework Methodology)
// ===============================

// Main CRUD page - displays all employees with action buttons
function displayCrudMain(req, res) {
    connection.query("SELECT * FROM employee ORDER BY id", function(err, result) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>TechCorp Employee Management (CRUD)</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<p><a href="/crud/add" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">➕ Add New Employee</a></p>');
        
        if (err) {
            res.write('<p style="color: red;">Database error: ' + err + '</p>');
        } else {
            res.write('<h3>Current Employees:</h3>');
            res.write('<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">');
            res.write('<tr style="background: #f8f9fa;"><th>ID</th><th>Name</th><th>Address</th><th>Age</th><th>Actions</th></tr>');
            
            for (let i = 0; i < result.length; i++) {
                const emp = result[i];
                res.write('<tr>');
                res.write('<td>' + emp.id + '</td>');
                res.write('<td>' + emp.name + '</td>');
                res.write('<td>' + emp.address + '</td>');
                res.write('<td>' + emp.age + '</td>');
                res.write('<td>');
                res.write('<a href="/crud/view?id=' + emp.id + '" style="color: #17a2b8; margin-right: 10px;">👁️ View</a>');
                res.write('<a href="/crud/edit?id=' + emp.id + '" style="color: #28a745; margin-right: 10px;">✏️ Edit</a>');
                res.write('<a href="/crud/delete?id=' + emp.id + '" style="color: #dc3545;" onclick="return confirm(\'Are you sure you want to delete this employee?\')">🗑️ Delete</a>');
                res.write('</td>');
                res.write('</tr>');
            }
            res.write('</table>');
        }
        
        res.write('<p><a href="/">Back to Home</a></p>');
        res.end();
    });
}

// Handle Add Employee - GET shows form, POST processes form
function handleAddEmployee(req, res) {
    if (req.method === 'GET') {
        // Show add employee form
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>Add New Employee</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        res.write('<form method="POST" action="/crud/add" style="max-width: 400px;">');
        res.write('<div style="margin-bottom: 15px;">');
        res.write('<label for="name">Name:</label><br>');
        res.write('<input type="text" id="name" name="name" required style="width: 100%; padding: 8px; margin-top: 5px;">');
        res.write('</div>');
        res.write('<div style="margin-bottom: 15px;">');
        res.write('<label for="address">Address:</label><br>');
        res.write('<input type="text" id="address" name="address" required style="width: 100%; padding: 8px; margin-top: 5px;">');
        res.write('</div>');
        res.write('<div style="margin-bottom: 15px;">');
        res.write('<label for="age">Age:</label><br>');
        res.write('<input type="number" id="age" name="age" required min="18" max="100" style="width: 100%; padding: 8px; margin-top: 5px;">');
        res.write('</div>');
        res.write('<button type="submit" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Add Employee</button>');
        res.write('<a href="/crud" style="margin-left: 10px; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">Cancel</a>');
        res.write('</form>');
        res.write('<p><a href="/crud">Back to Employee List</a></p>');
        res.end();
    } else if (req.method === 'POST') {
        // Process form submission
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const name = params.get('name');
            const address = params.get('address');
            const age = params.get('age');
            
            const insertQuery = "INSERT INTO employee (name, address, age) VALUES (?, ?, ?)";
            connection.query(insertQuery, [name, address, age], function(err, result) {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.write('<h1>Add Employee Result</h1>');
                res.write('<p>Request URL: ' + req.url + '</p>');
                
                if (err) {
                    res.write('<p style="color: red;">❌ Error adding employee: ' + err.message + '</p>');
                } else {
                    res.write('<p style="color: green;">✅ Employee added successfully!</p>');
                    res.write('<p>New Employee ID: ' + result.insertId + '</p>');
                    res.write('<p>Name: ' + name + '</p>');
                    res.write('<p>Address: ' + address + '</p>');
                    res.write('<p>Age: ' + age + '</p>');
                }
                
                res.write('<p><a href="/crud">Back to Employee List</a></p>');
                res.end();
            });
        });
    }
}

// Handle Edit Employee
function handleEditEmployee(req, res, query) {
    const employeeId = query.id;
    
    if (!employeeId) {
        res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>Error: Missing Employee ID</h1>');
        res.write('<p><a href="/crud">Back to Employee List</a></p>');
        res.end();
        return;
    }
    
    if (req.method === 'GET') {
        // Show edit form with current data
        connection.query("SELECT * FROM employee WHERE id = ?", [employeeId], function(err, result) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write('<h1>Edit Employee</h1>');
            res.write('<p>Request URL: ' + req.url + '</p>');
            
            if (err || result.length === 0) {
                res.write('<p style="color: red;">❌ Employee not found or database error</p>');
                res.write('<p><a href="/crud">Back to Employee List</a></p>');
                res.end();
                return;
            }
            
            const employee = result[0];
            res.write('<form method="POST" action="/crud/edit?id=' + employeeId + '" style="max-width: 400px;">');
            res.write('<div style="margin-bottom: 15px;">');
            res.write('<label for="name">Name:</label><br>');
            res.write('<input type="text" id="name" name="name" value="' + employee.name + '" required style="width: 100%; padding: 8px; margin-top: 5px;">');
            res.write('</div>');
            res.write('<div style="margin-bottom: 15px;">');
            res.write('<label for="address">Address:</label><br>');
            res.write('<input type="text" id="address" name="address" value="' + employee.address + '" required style="width: 100%; padding: 8px; margin-top: 5px;">');
            res.write('</div>');
            res.write('<div style="margin-bottom: 15px;">');
            res.write('<label for="age">Age:</label><br>');
            res.write('<input type="number" id="age" name="age" value="' + employee.age + '" required min="18" max="100" style="width: 100%; padding: 8px; margin-top: 5px;">');
            res.write('</div>');
            res.write('<button type="submit" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Update Employee</button>');
            res.write('<a href="/crud" style="margin-left: 10px; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">Cancel</a>');
            res.write('</form>');
            res.write('<p><a href="/crud">Back to Employee List</a></p>');
            res.end();
        });
    } else if (req.method === 'POST') {
        // Process update
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const name = params.get('name');
            const address = params.get('address');
            const age = params.get('age');
            
            const updateQuery = "UPDATE employee SET name = ?, address = ?, age = ? WHERE id = ?";
            connection.query(updateQuery, [name, address, age, employeeId], function(err, result) {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.write('<h1>Update Employee Result</h1>');
                res.write('<p>Request URL: ' + req.url + '</p>');
                
                if (err) {
                    res.write('<p style="color: red;">❌ Error updating employee: ' + err.message + '</p>');
                } else if (result.affectedRows === 0) {
                    res.write('<p style="color: orange;">⚠️ No employee found with ID: ' + employeeId + '</p>');
                } else {
                    res.write('<p style="color: green;">✅ Employee updated successfully!</p>');
                    res.write('<p>Employee ID: ' + employeeId + '</p>');
                    res.write('<p>Name: ' + name + '</p>');
                    res.write('<p>Address: ' + address + '</p>');
                    res.write('<p>Age: ' + age + '</p>');
                }
                
                res.write('<p><a href="/crud">Back to Employee List</a></p>');
                res.end();
            });
        });
    }
}

// Handle Delete Employee
function handleDeleteEmployee(req, res, query) {
    const employeeId = query.id;
    
    if (!employeeId) {
        res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>Error: Missing Employee ID</h1>');
        res.write('<p><a href="/crud">Back to Employee List</a></p>');
        res.end();
        return;
    }
    
    // First get employee details for confirmation
    connection.query("SELECT * FROM employee WHERE id = ?", [employeeId], function(err, result) {
        if (err || result.length === 0) {
            res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
            res.write('<h1>Employee Not Found</h1>');
            res.write('<p>Request URL: ' + req.url + '</p>');
            res.write('<p style="color: red;">❌ Employee with ID ' + employeeId + ' not found</p>');
            res.write('<p><a href="/crud">Back to Employee List</a></p>');
            res.end();
            return;
        }
        
        const employee = result[0];
        
        // Delete the employee
        connection.query("DELETE FROM employee WHERE id = ?", [employeeId], function(deleteErr, deleteResult) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write('<h1>Delete Employee Result</h1>');
            res.write('<p>Request URL: ' + req.url + '</p>');
            
            if (deleteErr) {
                res.write('<p style="color: red;">❌ Error deleting employee: ' + deleteErr.message + '</p>');
            } else if (deleteResult.affectedRows === 0) {
                res.write('<p style="color: orange;">⚠️ No employee was deleted</p>');
            } else {
                res.write('<p style="color: green;">✅ Employee deleted successfully!</p>');
                res.write('<p>Deleted Employee Details:</p>');
                res.write('<ul>');
                res.write('<li>ID: ' + employee.id + '</li>');
                res.write('<li>Name: ' + employee.name + '</li>');
                res.write('<li>Address: ' + employee.address + '</li>');
                res.write('<li>Age: ' + employee.age + '</li>');
                res.write('</ul>');
            }
            
            res.write('<p><a href="/crud">Back to Employee List</a></p>');
            res.end();
        });
    });
}

// Handle View Single Employee
function handleViewEmployee(req, res, query) {
    const employeeId = query.id;
    
    if (!employeeId) {
        res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>Error: Missing Employee ID</h1>');
        res.write('<p><a href="/crud">Back to Employee List</a></p>');
        res.end();
        return;
    }
    
    connection.query("SELECT * FROM employee WHERE id = ?", [employeeId], function(err, result) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.write('<h1>Employee Details</h1>');
        res.write('<p>Request URL: ' + req.url + '</p>');
        
        if (err) {
            res.write('<p style="color: red;">❌ Database error: ' + err.message + '</p>');
        } else if (result.length === 0) {
            res.write('<p style="color: orange;">⚠️ Employee with ID ' + employeeId + ' not found</p>');
        } else {
            const employee = result[0];
            res.write('<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 400px;">');
            res.write('<h3>Employee Information</h3>');
            res.write('<p><strong>ID:</strong> ' + employee.id + '</p>');
            res.write('<p><strong>Name:</strong> ' + employee.name + '</p>');
            res.write('<p><strong>Address:</strong> ' + employee.address + '</p>');
            res.write('<p><strong>Age:</strong> ' + employee.age + '</p>');
            res.write('</div>');
            
            res.write('<div style="margin-top: 20px;">');
            res.write('<a href="/crud/edit?id=' + employee.id + '" style="background: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-right: 10px;">✏️ Edit</a>');
            res.write('<a href="/crud/delete?id=' + employee.id + '" style="background: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;" onclick="return confirm(\'Are you sure you want to delete this employee?\')">🗑️ Delete</a>');
            res.write('</div>');
        }
        
        res.write('<p><a href="/crud">Back to Employee List</a></p>');
        res.end();
    });
}

// Start server (following homework methodology)
server.listen(INTERNAL_PORT, function() {
    console.log('TechCorp Solutions app listening on internal port ' + INTERNAL_PORT);
    console.log('Base route: ' + BASE_ROUTE);
    console.log('Access via reverse proxy at: http://IP-ADDRESS' + BASE_ROUTE + '/');
    console.log('');    console.log('Available endpoints:');
    console.log('  - Home: http://IP-ADDRESS' + BASE_ROUTE + '/');
    console.log('  - Employees: http://IP-ADDRESS' + BASE_ROUTE + '/employees');
    console.log('  - CRUD Management: http://IP-ADDRESS' + BASE_ROUTE + '/crud');
    console.log('  - Database Test: http://IP-ADDRESS' + BASE_ROUTE + '/database');
    console.log('  - Health: http://IP-ADDRESS' + BASE_ROUTE + '/health');
    console.log('  - Multi-level: http://IP-ADDRESS' + BASE_ROUTE + '/demo/test');
});

module.exports = server;