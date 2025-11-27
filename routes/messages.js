const express = require('express');
const router = express.Router();

// Helper function for redirects with BASE_PATH
function redirectTo(res, path) {
    const BASE_PATH = process.env.BASE_PATH || '';
    const fullPath = BASE_PATH ? BASE_PATH + path : path;
    res.redirect(fullPath);
}

// Messages menu - display contact messages (registered users only)
router.get('/', (req, res) => {
    // Check if user is registered or admin
    if (!req.isAuthenticated() || (req.user.role !== 'registered' && req.user.role !== 'admin')) {
        return redirectTo(res, '/login?error=registration_required');
    }
    
    const db = req.app.locals.db;
    
    // Get all contact messages in descending order (newest first)
    const query = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Messages query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch messages'
            });
        }
        
        res.render('messages', {
            title: 'Contact Messages - TechCorp Solutions',
            messages: results
        });
    });
});

// View individual message (registered users only)
router.get('/:id', (req, res) => {
    // Check if user is registered or admin
    if (!req.isAuthenticated() || (req.user.role !== 'registered' && req.user.role !== 'admin')) {
        return redirectTo(res, '/login?error=registration_required');
    }
    
    const messageId = req.params.id;
    const db = req.app.locals.db;
    
    // Get specific message
    db.query('SELECT * FROM contact_messages WHERE id = ?', [messageId], (error, results) => {
        if (error) {
            console.error('Message query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch message'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).render('error', {
                title: 'Message Not Found',
                message: 'The requested message was not found'
            });
        }
        
        // Mark message as read if it's new
        if (results[0].status === 'new') {
            db.query('UPDATE contact_messages SET status = "read" WHERE id = ?', [messageId], (updateError) => {
                if (updateError) {
                    console.error('Message update error:', updateError);
                }
            });
        }
        
        res.render('message_detail', {
            title: 'Message Details - TechCorp Solutions',
            message: results[0]
        });
    });
});

// Update message status (admin only)
router.post('/:id/status', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const messageId = req.params.id;
    const { status } = req.body;
    const db = req.app.locals.db;
    
    // Validate status
    const validStatuses = ['new', 'read', 'replied'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, messageId], (error, results) => {
        if (error) {
            console.error('Status update error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    });
});

module.exports = router;