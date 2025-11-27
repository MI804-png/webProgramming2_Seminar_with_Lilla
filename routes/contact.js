const express = require('express');
const router = express.Router();

// Helper function for redirects with BASE_PATH
function redirectTo(res, path) {
    const BASE_PATH = process.env.BASE_PATH || '';
    const fullPath = BASE_PATH ? BASE_PATH + path : path;
    res.redirect(fullPath);
}

// Contact form routes
router.get('/', (req, res) => {
    res.render('contact', {
        title: 'Contact Us - TechCorp Solutions',
        success: req.query.success || '',
        error: req.query.error || ''
    });
});

router.post('/', (req, res) => {
    const { name, email, subject, message } = req.body;
    const db = req.app.locals.db;
    
    // Validation
    if (!name || !email || !message) {
        return redirectTo(res, '/contact?error=Name, email, and message are required');
    }
    
    // Email validation (simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return redirectTo(res, '/contact?error=Please enter a valid email address');
    }
    
    // Insert message into database
    const insertQuery = 'INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())';
    
    db.query(insertQuery, [name, email, subject || 'General Inquiry', message], (error, results) => {
        if (error) {
            console.error('Contact message insert error:', error);
            return redirectTo(res, '/contact?error=Failed to send message. Please try again.');
        }
        
        console.log('New contact message saved:', {
            id: results.insertId,
            name: name,
            email: email,
            subject: subject || 'General Inquiry'
        });
        
        redirectTo(res, '/contact?success=Thank you for your message! We will get back to you soon.');
    });
});

module.exports = router;