const express = require('express');
const router = express.Router();

// Helper function for redirects with BASE_PATH
function redirectTo(res, path) {
    const BASE_PATH = process.env.BASE_PATH || '';
    const fullPath = BASE_PATH ? BASE_PATH + path : path;
    res.redirect(fullPath);
}

// CRUD operations for products table (Admin only)

// List all products with CRUD operations
router.get('/', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const db = req.app.locals.db;
    
    // Get products with category names
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.created_at DESC
    `;
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('CRUD products query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch products'
            });
        }
        
        res.render('crud_products', {
            title: 'Product Management - TechCorp Solutions',
            products: results,
            success: req.query.success || '',
            error: req.query.error || ''
        });
    });
});

// Show add product form
router.get('/add', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const db = req.app.locals.db;
    
    // Get categories for dropdown
    db.query('SELECT * FROM categories ORDER BY name', (error, categories) => {
        if (error) {
            console.error('Categories query error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch categories'
            });
        }
        
        res.render('crud_product_form', {
            title: 'Add Product - TechCorp Solutions',
            product: null,
            categories: categories,
            action: 'add',
            error: req.query.error || ''
        });
    });
});

// Show edit product form
router.get('/edit/:id', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const productId = req.params.id;
    const db = req.app.locals.db;
    
    // Get product and categories
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    const categoriesQuery = 'SELECT * FROM categories ORDER BY name';
    
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(productQuery, [productId], (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(categoriesQuery, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        })
    ])
    .then(([products, categories]) => {
        if (products.length === 0) {
            return res.status(404).render('error', {
                title: 'Product Not Found',
                message: 'The requested product was not found'
            });
        }
        
        res.render('crud_product_form', {
            title: 'Edit Product - TechCorp Solutions',
            product: products[0],
            categories: categories,
            action: 'edit',
            error: req.query.error || ''
        });
    })
    .catch(error => {
        console.error('Edit product query error:', error);
        res.status(500).render('error', {
            title: 'Database Error',
            message: 'Unable to fetch product data'
        });
    });
});

// Create new product
router.post('/add', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, description, price, category_id, image_url, status } = req.body;
    const db = req.app.locals.db;
    
    // Validation
    if (!name || !description) {
        return redirectTo(res, '/crud/add?error=Name and description are required');
    }
    
    const insertQuery = `
        INSERT INTO products (name, description, price, category_id, image_url, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
        name,
        description,
        price || null,
        category_id || null,
        image_url || null,
        status || 'active'
    ];
    
    db.query(insertQuery, values, (error, results) => {
        if (error) {
            console.error('Product insert error:', error);
            return redirectTo(res, '/crud/add?error=Failed to create product');
        }
        
        redirectTo(res, '/crud?success=Product created successfully');
    });
});

// Update product
router.post('/edit/:id', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const productId = req.params.id;
    const { name, description, price, category_id, image_url, status } = req.body;
    const db = req.app.locals.db;
    
    // Validation
    if (!name || !description) {
        return redirectTo(res, `/crud/edit/${productId}?error=Name and description are required`);
    }
    
    const updateQuery = `
        UPDATE products 
        SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, status = ?, updated_at = NOW()
        WHERE id = ?
    `;
    
    const values = [
        name,
        description,
        price || null,
        category_id || null,
        image_url || null,
        status || 'active',
        productId
    ];
    
    db.query(updateQuery, values, (error, results) => {
        if (error) {
            console.error('Product update error:', error);
            return redirectTo(res, `/crud/edit/${productId}?error=Failed to update product`);
        }
        
        if (results.affectedRows === 0) {
            return redirectTo(res, `/crud/edit/${productId}?error=Product not found`);
        }
        
        redirectTo(res, '/crud?success=Product updated successfully');
    });
});

// Delete product
router.post('/delete/:id', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const productId = req.params.id;
    const db = req.app.locals.db;
    
    db.query('DELETE FROM products WHERE id = ?', [productId], (error, results) => {
        if (error) {
            console.error('Product delete error:', error);
            return redirectTo(res, '/crud?error=Failed to delete product');
        }
        
        if (results.affectedRows === 0) {
            return redirectTo(res, '/crud?error=Product not found');
        }
        
        redirectTo(res, '/crud?success=Product deleted successfully');
    });
});

// View product details
router.get('/view/:id', (req, res) => {
    // Check if user is admin
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return redirectTo(res, '/login?error=admin_required');
    }
    
    const productId = req.params.id;
    const db = req.app.locals.db;
    
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    `;
    
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Product view error:', error);
            return res.status(500).render('error', {
                title: 'Database Error',
                message: 'Unable to fetch product'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).render('error', {
                title: 'Product Not Found',
                message: 'The requested product was not found'
            });
        }
        
        res.render('crud_product_view', {
            title: 'Product Details - TechCorp Solutions',
            product: results[0]
        });
    });
});

module.exports = router;