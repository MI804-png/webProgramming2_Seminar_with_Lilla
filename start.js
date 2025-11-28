require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const crypto = require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Import route modules
const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/database');
const contactRoutes = require('./routes/contact');
const messagesRoutes = require('./routes/messages');
const crudRoutes = require('./routes/crud');
const projectsRoutes = require('./routes/projects');

// Environment configuration
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'company_db';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const SESSION_SECRET = process.env.SESSION_SECRET || 'webprogramming2_secret_key_2025';
const BASE_PATH_RAW = process.env.BASE_PATH || '';
// Normalize BASE_PATH to start with '/' and have no trailing '/' (except root)
let BASE_PATH = BASE_PATH_RAW.trim();
if (BASE_PATH && !BASE_PATH.startsWith('/')) BASE_PATH = '/' + BASE_PATH;
if (BASE_PATH.endsWith('/') && BASE_PATH !== '/') BASE_PATH = BASE_PATH.slice(0, -1);

// MySQL Express Session
app.use(session({
    name: 'techcorp.session',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: false,
        httpOnly: false,
        sameSite: 'lax'
    }
}));

// Passport and middleware setup
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static under base path for reverse-proxy route prefix deployments
if (BASE_PATH) {
    app.use(BASE_PATH, express.static('public'));
} else {
    app.use(express.static('public'));
}
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// MySQL Connection
const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    port: DB_PORT,
    multipleStatements: true
});

connection.connect((err) => {
    if (!err) {
        console.log("Connected to MySQL database");
        // Ensure default users exist for demo/login
        ensureDefaultUsers();
    } else {        console.log("Database Connection Failed:", err);
        console.log("========================================");
        console.log("APPLICATION RUNNING IN DEMO MODE");
        console.log("Database connection failed - using in-memory mock data");
        console.log("To enable full database functionality, contact your administrator");
        console.log("========================================");
        
        // Create comprehensive mock database with in-memory storage
        const mockUsers = [
            { id: 1, username: 'admin', email: 'admin@techcorp.com', password_hash: genPassword('admin123'), role: 'admin', created_at: new Date('2025-01-01') },
            { id: 2, username: 'testuser', email: 'test@techcorp.com', password_hash: genPassword('hello'), role: 'registered', created_at: new Date('2025-01-15') }
        ];
        
        const mockCategories = [
            { id: 1, name: 'Web Development', description: 'Custom web applications and websites', created_at: new Date('2025-01-01') },
            { id: 2, name: 'Mobile Apps', description: 'iOS and Android applications', created_at: new Date('2025-01-01') },
            { id: 3, name: 'Cloud Services', description: 'Cloud infrastructure and services', created_at: new Date('2025-01-01') }
        ];
        
        const mockProducts = [
            { id: 1, name: 'Enterprise Web Portal', description: 'Full-featured enterprise web application with advanced features', price: 15000, category_id: 1, image_url: 'https://via.placeholder.com/300x200?text=Enterprise+Portal', status: 'active', created_at: new Date('2025-01-10'), updated_at: new Date('2025-01-10') },
            { id: 2, name: 'Mobile Banking App', description: 'Secure mobile banking application for iOS and Android', price: 25000, category_id: 2, image_url: 'https://via.placeholder.com/300x200?text=Banking+App', status: 'active', created_at: new Date('2025-01-15'), updated_at: new Date('2025-01-15') },
            { id: 3, name: 'Cloud Storage Solution', description: 'Scalable cloud storage with advanced security', price: 8000, category_id: 3, image_url: 'https://via.placeholder.com/300x200?text=Cloud+Storage', status: 'active', created_at: new Date('2025-01-20'), updated_at: new Date('2025-01-20') }
        ];
        
        const mockProjects = [
            { id: 1, name: 'TechCorp Redesign', description: 'Complete website redesign project', status: 'completed', start_date: '2024-06-01', end_date: '2024-12-31', created_at: new Date('2024-06-01') },
            { id: 2, name: 'Mobile App Development', description: 'Cross-platform mobile application', status: 'in_progress', start_date: '2025-01-15', end_date: null, created_at: new Date('2025-01-15') }
        ];
        
        const mockMessages = [
            { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Web Development Inquiry', message: 'I need a custom e-commerce website for my business.', status: 'new', created_at: new Date('2025-11-20T10:30:00') },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', subject: 'Mobile App Development', message: 'Looking for a mobile app developer for a fintech project.', status: 'read', created_at: new Date('2025-11-25T14:15:00') }
        ];
        
        // Mutable counters stored in an object to maintain reference
        const mockCounters = {
            nextUserId: 3,
            nextProductId: 4,
            nextMessageId: 3,
            nextProjectId: 3
        };
        
        app.locals.db = {
            mockUsers, mockCategories, mockProducts, mockProjects, mockMessages, mockCounters,
            query: (sql, params, callback) => {
                if (typeof params === 'function') {
                    callback = params;
                    params = [];
                }
                console.log("Mock DB Query:", sql.substring(0, 100), params.length > 0 ? `[${params.length} params]` : '');
                
                try {
                    // USER QUERIES
                    if (sql.includes('SELECT * FROM users WHERE username = ?')) {
                        const user = mockUsers.find(u => u.username === params[0]);
                        callback(null, user ? [user] : []);
                    }
                    else if (sql.includes('SELECT * FROM users WHERE username = ? OR email = ?')) {
                        const user = mockUsers.find(u => u.username === params[0] || u.email === params[1]);
                        callback(null, user ? [user] : []);
                    }
                    else if (sql.includes('INSERT INTO users')) {
                        const [username, email, password_hash, role] = params;
                        const newUser = { id: mockCounters.nextUserId++, username, email, password_hash, role, created_at: new Date() };
                        mockUsers.push(newUser);
                        console.log('✓ Mock DB: User registered:', username);
                        callback(null, { insertId: newUser.id });
                    }
                    else if (sql.includes('SELECT * FROM users WHERE id = ?')) {
                        const user = mockUsers.find(u => u.id === parseInt(params[0]));
                        callback(null, user ? [user] : []);
                    }
                    // CONTACT MESSAGES
                    else if (sql.includes('INSERT INTO contact_messages')) {
                        const [name, email, subject, message] = params;
                        const newMessage = { id: mockCounters.nextMessageId++, name, email, subject, message, status: 'new', created_at: new Date() };
                        mockMessages.push(newMessage);
                        console.log('✓ Mock DB: Contact message saved from:', name);
                        callback(null, { insertId: newMessage.id });
                    }
                    else if (sql.includes('SELECT * FROM contact_messages ORDER BY created_at DESC')) {
                        callback(null, [...mockMessages].sort((a, b) => b.created_at - a.created_at));
                    }
                    else if (sql.includes('SELECT * FROM contact_messages WHERE id = ?')) {
                        const message = mockMessages.find(m => m.id === parseInt(params[0]));
                        callback(null, message ? [message] : []);
                    }
                    else if (sql.includes('UPDATE contact_messages SET status = ? WHERE id = ?')) {
                        const [status, messageId] = params;
                        const idx = mockMessages.findIndex(m => m.id === parseInt(messageId));
                        if (idx >= 0) {
                            mockMessages[idx].status = status;
                            console.log('✓ Mock DB: Message status updated:', messageId, status);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    else if (sql.includes('UPDATE contact_messages SET subject = ?, message = ?, status = ? WHERE id = ?')) {
                        const [subject, message, status, messageId] = params;
                        const idx = mockMessages.findIndex(m => m.id === parseInt(messageId));
                        if (idx >= 0) {
                            mockMessages[idx].subject = subject;
                            mockMessages[idx].message = message;
                            mockMessages[idx].status = status;
                            console.log('✓ Mock DB: Message updated:', messageId, '- Subject:', subject);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    else if (sql.includes('DELETE FROM contact_messages WHERE id = ?')) {
                        const idx = mockMessages.findIndex(m => m.id === parseInt(params[0]));
                        if (idx >= 0) {
                            const deleted = mockMessages.splice(idx, 1)[0];
                            console.log('✓ Mock DB: Message deleted:', deleted.name);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    // PRODUCTS CRUD
                    else if (sql.includes('SELECT p.*, c.name as category_name FROM products') || 
                             (sql.includes('SELECT p.*, c.name as category_name') && sql.includes('FROM products'))) {
                        const results = mockProducts.map(p => ({
                            ...p,
                            category_name: mockCategories.find(c => c.id === p.category_id)?.name || null
                        }));
                        callback(null, results);
                    }
                    else if (sql.includes('SELECT * FROM products WHERE id = ?')) {
                        const product = mockProducts.find(p => p.id === parseInt(params[0]));
                        callback(null, product ? [product] : []);
                    }
                    else if (sql.includes('INSERT INTO products')) {
                        const [name, description, price, category_id, image_url, status] = params;
                        const newProduct = { 
                            id: mockCounters.nextProductId++, 
                            name, 
                            description, 
                            price: price ? parseFloat(price) : null, 
                            category_id: category_id ? parseInt(category_id) : null, 
                            image_url, 
                            status: status || 'active', 
                            created_at: new Date(), 
                            updated_at: new Date() 
                        };
                        mockProducts.push(newProduct);
                        console.log('✓ Mock DB: Product created:', name, 'ID:', newProduct.id);
                        callback(null, { insertId: newProduct.id });
                    }
                    else if (sql.includes('UPDATE products')) {
                        const productId = params[params.length - 1];
                        const idx = mockProducts.findIndex(p => p.id === parseInt(productId));
                        if (idx >= 0) {
                            const [name, description, price, category_id, image_url, status] = params;
                            mockProducts[idx] = { 
                                ...mockProducts[idx], 
                                name, 
                                description, 
                                price: price ? parseFloat(price) : null, 
                                category_id: category_id ? parseInt(category_id) : null, 
                                image_url, 
                                status: status || 'active', 
                                updated_at: new Date() 
                            };
                            console.log('✓ Mock DB: Product updated:', name, 'ID:', productId);
                            callback(null, { affectedRows: 1, changedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0, changedRows: 0 });
                        }
                    }
                    else if (sql.includes('DELETE FROM products WHERE id = ?')) {
                        const idx = mockProducts.findIndex(p => p.id === parseInt(params[0]));
                        if (idx >= 0) {
                            const deleted = mockProducts.splice(idx, 1)[0];
                            console.log('✓ Mock DB: Product deleted:', deleted.name);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    // CATEGORIES
                    else if (sql.includes('SELECT * FROM categories')) {
                        callback(null, mockCategories);
                    }
                    // PROJECTS
                    else if (sql.includes('SELECT * FROM projects WHERE id = ?')) {
                        const project = mockProjects.find(p => p.id === parseInt(params[0]));
                        callback(null, project ? [project] : []);
                    }
                    else if (sql.includes('SELECT * FROM projects')) {
                        callback(null, [...mockProjects].sort((a, b) => b.created_at - a.created_at));
                    }
                    else if (sql.includes('INSERT INTO projects')) {
                        const [name, description, status, start_date, end_date] = params;
                        const newProject = {
                            id: mockCounters.nextProjectId++,
                            name,
                            description,
                            status: status || 'planning',
                            start_date,
                            end_date,
                            created_at: new Date()
                        };
                        mockProjects.push(newProject);
                        console.log('✓ Mock DB: Project created:', name);
                        callback(null, { insertId: newProject.id });
                    }
                    else if (sql.includes('UPDATE projects')) {
                        const projectId = params[params.length - 1];
                        const idx = mockProjects.findIndex(p => p.id === parseInt(projectId));
                        if (idx >= 0) {
                            const [name, description, status, start_date, end_date] = params;
                            mockProjects[idx] = {
                                ...mockProjects[idx],
                                name,
                                description,
                                status: status || 'planning',
                                start_date,
                                end_date
                            };
                            console.log('✓ Mock DB: Project updated:', name);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    else if (sql.includes('DELETE FROM projects WHERE id = ?')) {
                        const idx = mockProjects.findIndex(p => p.id === parseInt(params[0]));
                        if (idx >= 0) {
                            const deleted = mockProjects.splice(idx, 1)[0];
                            console.log('✓ Mock DB: Project deleted:', deleted.name);
                            callback(null, { affectedRows: 1 });
                        } else {
                            callback(null, { affectedRows: 0 });
                        }
                    }
                    // HEALTH CHECK
                    else if (sql.includes('SELECT 1 AS ok')) {
                        callback(null, [{ ok: 1 }]);
                    }
                    // Default: return empty results
                    else {
                        console.log('Mock DB: Unhandled query, returning empty');
                        callback(null, []);
                    }
                } catch (error) {
                    console.error('Mock DB Error:', error);
                    callback(error);
                }
            }
        };
    }
});

// Note: app.locals.db is set above in the connection callback

// Passport configuration
const customFields = {
    usernameField: 'username',
    passwordField: 'password',
};

const verifyCallback = (username, password, done) => {
    console.log('Login attempt:', username);
    
    // Use the app.locals.db which handles both real and mock database
    const db = app.locals.db;
    
    // Check if we're using mock database (has mockUsers property)
    if (db && db.mockUsers) {
        console.log('Using mock database authentication');
        console.log('Available users in mock DB:', db.mockUsers.map(u => u.username));
        
        const user = db.mockUsers.find(u => u.username === username);
        if (!user) {
            console.log('User not found in mock database:', username);
            return done(null, false);
        }
        
        console.log('User found in mock database:', user.username, 'Role:', user.role);
        const isValid = validPassword(password, user.password_hash);
        console.log('Password valid:', isValid);
        console.log('Expected hash:', user.password_hash);
        console.log('Provided hash:', crypto.createHash('sha256').update(password).digest('hex'));
        
        if (isValid) {
            console.log('Login successful for:', username);
            return done(null, user);
        } else {
            console.log('Invalid password for:', username);
            return done(null, false);
        }
    } else if (db && db.query && !db.mockUsers) {
        // Real database authentication
        db.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
            if (error) {
                console.log('Database error:', error);
                return done(error);
            }
            if (results.length == 0) {
                console.log('User not found:', username);
                return done(null, false);
            }
            
            console.log('User found:', results[0].username, 'Role:', results[0].role);
            const isValid = validPassword(password, results[0].password_hash);
            console.log('Password valid:', isValid);
            
            const user = {
                id: results[0].id,
                username: results[0].username,
                email: results[0].email,
                role: results[0].role,
                password_hash: results[0].password_hash
            };
            
            if (isValid) {
                console.log('Login successful for:', username);
                return done(null, user);
            } else {
                console.log('Invalid password for:', username);
                return done(null, false);
            }
        });
    } else {
        console.log('No database available');
        return done(null, false);
    }
}

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
    const db = app.locals.db;
    
    // Check if we're using mock database
    if (db && db.mockUsers) {
        console.log('Using mock user deserialization for userId:', userId);
        
        const user = db.mockUsers.find(u => u.id === parseInt(userId));
        if (user) {
            console.log('Mock user deserialized:', user.username);
            done(null, user);
        } else {
            console.log('Mock user not found for ID:', userId);
            done(null, false);
        }
    } else if (db && db.query && !db.mockUsers) {
        // Real database deserialization
        db.query('SELECT * FROM users WHERE id = ?', [userId], function(error, results) {
            if (error) return done(error);
            done(null, results[0]);    
        });
    } else {
        console.log('No database available for deserialization');
        done(null, false);
    }
});

// Helper functions
function validPassword(password, hash) {
    return hash === crypto.createHash('sha256').update(password).digest('hex');
}

function genPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Ensure default admin and test users exist with known passwords
function ensureDefaultUsers() {
    const db = app.locals.db;
    
    // Skip user creation if using mock database
    if (!db || db.query.toString().includes('Mock DB Query')) {
        console.log('Using mock database - default users are hardcoded in authentication');
        return;
    }
    
    const adminUsername = 'admin';
    const adminEmail = 'admin@techcorp.com';
    const adminPasswordHash = genPassword('admin123');

    const testUsername = 'testuser';
    const testEmail = 'test@techcorp.com';
    const testPasswordHash = genPassword('hello');

    // Upsert Admin
    db.query('SELECT id FROM users WHERE username = ?', [adminUsername], (err, results) => {
        if (err) {
            console.error('Admin select error:', err);
            return;
        }
        if (results.length === 0) {
            db.query(
                'INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
                [adminUsername, adminEmail, adminPasswordHash, 'admin'],
                (insErr) => { if (insErr) console.error('Admin insert error:', insErr); }
            );
        } else {
            db.query(
                'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',[adminPasswordHash, 'admin', adminUsername],
                (updErr) => { if (updErr) console.error('Admin update error:', updErr); }
            );
        }
    });

    // Upsert Test User
    db.query('SELECT id FROM users WHERE username = ?', [testUsername], (err, results) => {
        if (err) {
            console.error('Test user select error:', err);
            return;
        }
        if (results.length === 0) {
            db.query(
                'INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
                [testUsername, testEmail, testPasswordHash, 'registered'],
                (insErr) => { if (insErr) console.error('Test user insert error:', insErr); }
            );
        } else {
            db.query(
                'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',[testPasswordHash, 'registered', testUsername],
                (updErr) => { if (updErr) console.error('Test user update error:', updErr); }
            );
        }
    });
}

// Helper function for redirects with BASE_PATH
function redirectTo(res, path) {
    const fullPath = BASE_PATH ? BASE_PATH + path : path;
    res.redirect(fullPath);
}

// Middleware functions
function isAuth(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        redirectTo(res, '/login?error=unauthorized');
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin')
        next();
    else
        redirectTo(res, '/login?error=admin_required');   
}

function isRegistered(req, res, next) {
    if (req.isAuthenticated() && (req.user.role === 'registered' || req.user.role === 'admin'))
        next();
    else
        redirectTo(res, '/login?error=registration_required');   
}

// Make middleware and locals available globally
app.use((req, res, next) => {
    const isAuth = req.isAuthenticated();
    const user = req.user || null;
    
    // Debug logging for session state
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`  - Session ID: ${req.sessionID}`);
    console.log(`  - Is Authenticated: ${isAuth}`);
    console.log(`  - User: ${user ? JSON.stringify(user) : 'null'}`);
    
    res.locals.isAuth = isAuth;
    res.locals.user = user;
    res.locals.isAdmin = isAuth && user && user.role === 'admin';
    res.locals.isRegistered = isAuth && user && (user.role === 'registered' || user.role === 'admin');
    // currentPath is relative to the mounted base path (for active nav logic)
    res.locals.currentPath = req.path;
    res.locals.basePath = BASE_PATH || '';
    
    console.log(`  - Locals: isAuth=${res.locals.isAuth}, isAdmin=${res.locals.isAdmin}, user=${res.locals.user ? res.locals.user.username : 'null'}`);
    
    next();
});

// Use a router mounted at BASE_PATH to support reverse-proxy path prefixes (e.g., /app001)
const router = express.Router();

// Routes
router.get('/', (req, res) => {
    res.render('mainpage', {
        title: 'TechCorp Solutions - Leading Technology Company'
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    connection.query('SELECT 1 AS ok', (err) => {
        if (err) {
            return res.status(500).json({ status: 'error', db: false, error: err.code || 'DB_ERROR' });
        }
        return res.json({ status: 'ok', db: true });
    });
});

// Use route modules
router.use('/auth', authRoutes);
router.use('/database', databaseRoutes);
router.use('/contact', contactRoutes);
router.use('/messages', messagesRoutes);
router.use('/crud', crudRoutes);
router.use('/projects', projectsRoutes);

// Authentication routes (keeping some in main file for compatibility)
router.get('/login', (req, res) => {
    const error = req.query.error;
    const success = req.query.success;
    let errorMessage = '';
    
    switch(error) {
        case 'unauthorized':
            errorMessage = 'You must be logged in to access that page.';
            break;
        case 'admin_required':
            errorMessage = 'Admin access required.';
            break;
        case 'registration_required':
            errorMessage = 'You must be a registered user to access that page.';
            break;
        case 'invalid':
            errorMessage = 'Invalid username or password.';
            break;
    }
    
    res.render('login', { 
        title: 'Login - TechCorp Solutions',
        error: errorMessage,
        success: success 
    });
});

router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register - TechCorp Solutions',
        error: req.query.error || '' 
    });
});

router.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const db = req.app.locals.db;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        return redirectTo(res, '/register?error=All fields are required');
    }
    
    if (password !== confirmPassword) {
        return redirectTo(res, '/register?error=Passwords do not match');
    }
    
    // Check if user exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (error, results) => {
        if (error) {
            console.log("Database error:", error);
            return redirectTo(res, '/register?error=Database error');
        }
        
        if (results.length > 0) {
            return redirectTo(res, '/register?error=Username or email already exists');
        }
        
        // Create new user
        const passwordHash = genPassword(password);
        const insertQuery = 'INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())';
        
        db.query(insertQuery, [username, email, passwordHash, 'registered'], (error, results) => {
            if (error) {
                console.log("Insert error:", error);
                return redirectTo(res, '/register?error=Registration failed');
            }
            
            console.log('New user registered:', username, 'with role: registered');
            redirectTo(res, '/login?success=Registration successful');
        });
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return redirectTo(res, '/login?error=invalid'); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return redirectTo(res, '/');
        });
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('techcorp.session');
        redirectTo(res, '/');
    });
});

// Export helper functions for routes
app.locals.validPassword = validPassword;
app.locals.genPassword = genPassword;
app.locals.isAuth = isAuth;
app.locals.isAdmin = isAdmin;
app.locals.isRegistered = isRegistered;

const PORT = process.env.PORT || 3000;
// Mount the router at the base path
app.use(BASE_PATH || '/', router);

app.listen(PORT, function() {
    console.log(`TechCorp Solutions app listening on port ${PORT}!`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
    if (BASE_PATH) {
        console.log(`App is mounted under base path: ${BASE_PATH}`);
    }
});

module.exports = app;