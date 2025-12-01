// SQLite Database Initialization
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

function genPassword(pwd) {
    return crypto.createHash('sha256').update(pwd).digest('hex');
}

function initDatabase() {
    const dbPath = path.join(__dirname, 'techcorp.db');
    const db = new Database(dbPath);
    
    console.log('✓ Initializing SQLite database...');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'registered',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL DEFAULT 0,
            category_id INTEGER,
            image_url TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'planning',
            start_date DATE,
            end_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS messages (
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
    
    // Insert default users if not exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const insertUser = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
        insertUser.run('admin', 'admin@techcorp.com', genPassword('admin123'), 'admin');
        insertUser.run('testuser', 'test@techcorp.com', genPassword('hello'), 'registered');
        console.log('✓ Default users created');
    }
    
    // Insert default categories if not exists
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    if (categoryCount === 0) {
        const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
        insertCategory.run('Web Development', 'Custom web applications and websites');
        insertCategory.run('Mobile Apps', 'iOS and Android applications');
        insertCategory.run('Cloud Services', 'Cloud infrastructure and services');
        console.log('✓ Default categories created');
    }
    
    // Insert default products if not exists
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
        const insertProduct = db.prepare('INSERT INTO products (name, description, price, category_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?)');
        insertProduct.run('Enterprise Web Portal', 'Full-featured enterprise web application', 15000, 1, 'https://via.placeholder.com/300x200?text=Enterprise+Portal', 'active');
        insertProduct.run('Mobile Banking App', 'Secure mobile banking application', 25000, 2, 'https://via.placeholder.com/300x200?text=Banking+App', 'active');
        insertProduct.run('Cloud Storage Solution', 'Scalable cloud storage with advanced security', 8000, 3, 'https://via.placeholder.com/300x200?text=Cloud+Storage', 'active');
        console.log('✓ Default products created');
    }
    
    console.log('✓ Database initialized successfully');
    return db;
}

module.exports = { initDatabase };
