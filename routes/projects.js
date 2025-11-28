const express = require('express');
const router = express.Router();

// Helper function for redirects with BASE_PATH
function redirectTo(res, path) {
    const BASE_PATH = process.env.BASE_PATH || '';
    const fullPath = BASE_PATH ? BASE_PATH + path : path;
    res.redirect(fullPath);
}

// List all projects (admin only)
router.get('/', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const db = req.app.locals.db;
    
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Projects query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch projects'
            });
        }
        
        res.render('projects', {
            title: 'Project Management - TechCorp Solutions',
            projects: results,
            success: req.query.success || '',
            error: req.query.error || ''
        });
    });
});

// Show add project form
router.get('/add', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    res.render('project_form', {
        title: 'Add Project - TechCorp Solutions',
        project: null,
        isEdit: false,
        error: req.query.error || ''
    });
});

// Show edit project form
router.get('/edit/:id', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const projectId = req.params.id;
    const db = req.app.locals.db;
    
    db.query('SELECT * FROM projects WHERE id = ?', [projectId], (error, results) => {
        if (error) {
            console.error('Project query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch project'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).render('error', {
                title: 'Project Not Found',
                message: 'The requested project was not found'
            });
        }
        
        res.render('project_form', {
            title: 'Edit Project - TechCorp Solutions',
            project: results[0],
            isEdit: true,
            error: req.query.error || ''
        });
    });
});

// View project details
router.get('/view/:id', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const projectId = req.params.id;
    const db = req.app.locals.db;
    
    db.query('SELECT * FROM projects WHERE id = ?', [projectId], (error, results) => {
        if (error) {
            console.error('Project query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch project'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).render('error', {
                title: 'Project Not Found',
                message: 'The requested project was not found'
            });
        }
        
        res.render('project_view', {
            title: 'Project Details - TechCorp Solutions',
            project: results[0]
        });
    });
});

// Create new project
router.post('/add', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { title, description, technologies, image_url, project_url } = req.body;
    const db = req.app.locals.db;
    
    if (!title || !description) {
        return redirectTo(res, '/projects/add?error=Title and description are required');
    }
    
    const insertQuery = `
        INSERT INTO projects (title, description, technologies, image_url, project_url, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
        title,
        description,
        technologies || null,
        image_url || null,
        project_url || null
    ];
    
    db.query(insertQuery, values, (error, results) => {
        if (error) {
            console.error('Project insert error:', error);
            return redirectTo(res, '/projects/add?error=Failed to create project');
        }
        
        redirectTo(res, '/projects?success=Project created successfully');
    });
});

// Update project
router.post('/edit/:id', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const projectId = req.params.id;
    const { title, description, technologies, image_url, project_url } = req.body;
    const db = req.app.locals.db;
    
    if (!title || !description) {
        return redirectTo(res, `/projects/edit/${projectId}?error=Title and description are required`);
    }
    
    const updateQuery = `
        UPDATE projects 
        SET title = ?, description = ?, technologies = ?, image_url = ?, project_url = ?
        WHERE id = ?
    `;
    
    const values = [
        title,
        description,
        technologies || null,
        image_url || null,
        project_url || null,
        projectId
    ];
    
    db.query(updateQuery, values, (error, results) => {
        if (error) {
            console.error('Project update error:', error);
            return redirectTo(res, `/projects/edit/${projectId}?error=Failed to update project`);
        }
        
        if (results.affectedRows === 0) {
            return redirectTo(res, `/projects/edit/${projectId}?error=Project not found`);
        }
        
        redirectTo(res, '/projects?success=Project updated successfully');
    });
});

// Delete project
router.post('/delete/:id', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const projectId = req.params.id;
    const db = req.app.locals.db;
    
    db.query('DELETE FROM projects WHERE id = ?', [projectId], (error, results) => {
        if (error) {
            console.error('Project delete error:', error);
            return redirectTo(res, '/projects?error=Failed to delete project');
        }
        
        if (results.affectedRows === 0) {
            return redirectTo(res, '/projects?error=Project not found');
        }
        
        redirectTo(res, '/projects?success=Project deleted successfully');
    });
});

module.exports = router;
