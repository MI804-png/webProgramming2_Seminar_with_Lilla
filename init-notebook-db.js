// ReNew Ltd. Notebook Database - SQLite Initialization
const Database = require('better-sqlite3');
const path = require('path');

function initNotebookDatabase() {
    const dbPath = path.join(__dirname, 'notebook.db');
    const db = new Database(dbPath);
    
    console.log('✓ Initializing ReNew Ltd. Notebook database...');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS processor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manufacturer TEXT NOT NULL,
            type TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS opsystem (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            osname TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS notebook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manufacturer TEXT NOT NULL,
            type TEXT NOT NULL,
            display REAL NOT NULL,
            memory INTEGER NOT NULL,
            harddisk INTEGER NOT NULL,
            videocontroller TEXT NOT NULL,
            price REAL NOT NULL,
            processorid INTEGER NOT NULL,
            opsystemid INTEGER NOT NULL,
            pieces INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (processorid) REFERENCES processor(id),
            FOREIGN KEY (opsystemid) REFERENCES opsystem(id)
        );
        
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'registered',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            admin_reply TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Insert sample processors
    const processorCount = db.prepare('SELECT COUNT(*) as count FROM processor').get().count;
    if (processorCount === 0) {
        const insertProcessor = db.prepare('INSERT INTO processor (manufacturer, type) VALUES (?, ?)');
        insertProcessor.run('Intel', 'Core i5-8250U');
        insertProcessor.run('Intel', 'Core i7-8550U');
        insertProcessor.run('AMD', 'Ryzen 5 3500U');
        insertProcessor.run('Intel', 'Core i3-7100U');
        insertProcessor.run('AMD', 'Ryzen 7 4700U');
        console.log('✓ Sample processors created');
    }
    
    // Insert sample operating systems
    const osCount = db.prepare('SELECT COUNT(*) as count FROM opsystem').get().count;
    if (osCount === 0) {
        const insertOS = db.prepare('INSERT INTO opsystem (osname) VALUES (?)');
        insertOS.run('Windows 10 Home');
        insertOS.run('Windows 10 Pro');
        insertOS.run('Windows 11 Home');
        insertOS.run('Ubuntu Linux 20.04');
        insertOS.run('No OS');
        console.log('✓ Sample operating systems created');
    }
    
    // Insert sample notebooks
    const notebookCount = db.prepare('SELECT COUNT(*) as count FROM notebook').get().count;
    if (notebookCount === 0) {
        const insertNotebook = db.prepare(`
            INSERT INTO notebook (manufacturer, type, display, memory, harddisk, videocontroller, price, processorid, opsystemid, pieces) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertNotebook.run('Dell', 'Latitude 5590', 15.6, 8192, 256, 'Intel UHD Graphics 620', 450, 1, 1, 5);
        insertNotebook.run('HP', 'EliteBook 840 G5', 14, 16384, 512, 'Intel UHD Graphics 620', 650, 2, 2, 3);
        insertNotebook.run('Lenovo', 'ThinkPad T480', 14, 8192, 256, 'Intel UHD Graphics 620', 500, 1, 1, 7);
        insertNotebook.run('ASUS', 'VivoBook 15', 15.6, 8192, 512, 'AMD Radeon Vega 8', 420, 3, 3, 10);
        insertNotebook.run('Acer', 'Aspire 5', 15.6, 4096, 500, 'Intel UHD Graphics 620', 350, 4, 5, 8);
        insertNotebook.run('Dell', 'XPS 13', 13.3, 16384, 512, 'Intel Iris Plus Graphics', 800, 2, 2, 2);
        insertNotebook.run('HP', 'ProBook 450 G7', 15.6, 8192, 256, 'NVIDIA GeForce MX130', 550, 1, 1, 6);
        insertNotebook.run('Lenovo', 'IdeaPad 3', 15.6, 8192, 512, 'AMD Radeon Vega 10', 480, 5, 3, 12);
        console.log('✓ Sample notebooks created');
    }
    
    // Insert default users
    const crypto = require('crypto');
    function genPassword(pwd) {
        return crypto.createHash('sha256').update(pwd).digest('hex');
    }
    
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const insertUser = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
        insertUser.run('admin', 'admin@renew.com', genPassword('admin123'), 'admin');
        insertUser.run('testuser', 'test@renew.com', genPassword('hello'), 'registered');
        console.log('✓ Default users created');
    }
    
    console.log('✓ ReNew Ltd. Notebook database initialized successfully');
    return db;
}

module.exports = { initNotebookDatabase };
