// Enhanced Database Data Viewer
// This script connects to the running application and shows mock database content

const http = require('http');

// Simulate the same mock database structure as in the application
function createMockDatabase() {
    const crypto = require('crypto');
    
    function genPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    const mockUsers = [
        { 
            id: 1, 
            username: 'admin', 
            email: 'admin@techcorp.com', 
            password_hash: genPassword('admin123'), 
            role: 'admin',
            created_at: '2024-01-01 00:00:00'
        },
        { 
            id: 2, 
            username: 'testuser', 
            email: 'test@techcorp.com', 
            password_hash: genPassword('hello'), 
            role: 'registered',
            created_at: '2024-01-01 00:00:00'
        }
    ];

    const mockCategories = [
        { id: 1, name: 'Web Development', description: 'Custom web applications and websites' },
        { id: 2, name: 'Mobile Apps', description: 'iOS and Android mobile applications' },
        { id: 3, name: 'Software Solutions', description: 'Desktop and enterprise software' },
        { id: 4, name: 'Consulting', description: 'Technology consulting and advisory services' },
        { id: 5, name: 'Cloud Services', description: 'Cloud infrastructure and migration services' }
    ];

    const mockProducts = [
        { id: 1, name: 'Custom Website Development', description: 'Professional website development with modern technologies', price: 2500.00, category_id: 1, status: 'active' },
        { id: 2, name: 'E-commerce Platform', description: 'Full-featured online store with payment integration', price: 5000.00, category_id: 1, status: 'active' },
        { id: 3, name: 'Mobile App Development', description: 'Native iOS and Android app development', price: 8000.00, category_id: 2, status: 'active' },
        { id: 4, name: 'Cloud Migration Service', description: 'Complete cloud infrastructure migration', price: 3500.00, category_id: 5, status: 'active' },
        { id: 5, name: 'Business Process Automation', description: 'Custom software for business process automation', price: 4500.00, category_id: 3, status: 'active' },
        { id: 6, name: 'IT Consulting', description: 'Professional technology consulting services', price: 150.00, category_id: 4, status: 'active' },
        { id: 7, name: 'Database Design & Optimization', description: 'Database architecture and performance optimization', price: 2000.00, category_id: 3, status: 'active' },
        { id: 8, name: 'API Development', description: 'RESTful API development and integration', price: 1800.00, category_id: 1, status: 'active' }
    ];

    const mockProjects = [
        { 
            id: 1, 
            title: 'E-commerce Platform for RetailCorp', 
            description: 'Complete online shopping platform with inventory management', 
            client_name: 'RetailCorp Ltd.',
            start_date: '2024-01-15',
            end_date: '2024-04-30',
            status: 'completed',
            technologies: 'Node.js, React, MySQL, Docker'
        },
        { 
            id: 2, 
            title: 'Mobile Banking App', 
            description: 'Secure mobile banking application with biometric authentication', 
            client_name: 'SecureBank',
            start_date: '2024-03-01',
            end_date: '2024-08-15',
            status: 'completed',
            technologies: 'React Native, Node.js, PostgreSQL, AWS'
        },
        { 
            id: 3, 
            title: 'Hospital Management System', 
            description: 'Comprehensive hospital management and patient tracking system', 
            client_name: 'City Medical Center',
            start_date: '2024-05-01',
            end_date: '2024-12-31',
            status: 'in_progress',
            technologies: 'Vue.js, Express.js, MongoDB, Redis'
        },
        { 
            id: 4, 
            title: 'Smart City Dashboard', 
            description: 'Real-time monitoring dashboard for city infrastructure', 
            client_name: 'Metro City Council',
            start_date: '2024-07-15',
            end_date: '2025-02-28',
            status: 'in_progress',
            technologies: 'Angular, Python, InfluxDB, Grafana'
        },
        { 
            id: 5, 
            title: 'Supply Chain Optimization', 
            description: 'AI-powered supply chain management system', 
            client_name: 'LogiFlow Inc.',
            start_date: '2024-09-01',
            end_date: '2025-03-15',
            status: 'planning',
            technologies: 'Python, TensorFlow, PostgreSQL, Kubernetes'
        }
    ];

    const mockMessages = [
        { 
            id: 1, 
            name: 'John Smith', 
            email: 'john.smith@email.com', 
            subject: 'Web Development Inquiry', 
            message: 'Hi, I am interested in your web development services for my startup. Could you please provide more details about your packages and pricing?', 
            status: 'new',
            created_at: '2024-01-15 10:30:00'
        },
        { 
            id: 2, 
            name: 'Sarah Johnson', 
            email: 'sarah.j@company.com', 
            subject: 'Mobile App Development', 
            message: 'We need a mobile app for our retail business. Can we schedule a consultation to discuss our requirements?', 
            status: 'read',
            created_at: '2024-02-20 14:15:00'
        },
        { 
            id: 3, 
            name: 'Michael Brown', 
            email: 'mbrown@techstartup.com', 
            subject: 'Cloud Migration Services', 
            message: 'Our company is looking to migrate to cloud infrastructure. What is your experience with AWS migrations?', 
            status: 'new',
            created_at: '2024-03-10 09:45:00'
        },
        { 
            id: 4, 
            name: 'Lisa Davis', 
            email: 'lisa.davis@nonprofit.org', 
            subject: 'Consulting Services', 
            message: 'We are a non-profit organization looking for IT consulting. Do you offer any special rates for non-profits?', 
            status: 'replied',
            created_at: '2024-04-05 16:20:00'
        },
        { 
            id: 5, 
            name: 'Robert Wilson', 
            email: 'rwilson@manufacturing.com', 
            subject: 'Custom Software Development', 
            message: 'We need custom software for our manufacturing process automation. Can you help us with this project?', 
            status: 'new',
            created_at: '2024-05-12 11:00:00'
        }
    ];

    return {
        users: mockUsers,
        categories: mockCategories,
        products: mockProducts,
        projects: mockProjects,
        contact_messages: mockMessages
    };
}

function displayTable(tableName, data) {
    console.log(`\n📋 ${tableName.toUpperCase()} TABLE:`);
    console.log('=' .repeat(60));
    
    if (data.length === 0) {
        console.log('(No data)');
        return;
    }

    data.forEach((row, index) => {
        console.log(`\n${index + 1}. Record ID: ${row.id}`);
        Object.keys(row).forEach(key => {
            if (key !== 'id') {
                let value = row[key];
                if (typeof value === 'string' && value.length > 50) {
                    value = value.substring(0, 47) + '...';
                }
                console.log(`   ${key}: ${value}`);
            }
        });
    });
    
    console.log(`\n📊 Total records: ${data.length}`);
}

function main() {
    console.log('🗄️  TechCorp Solutions - Database Data Viewer');
    console.log('='.repeat(70));
    console.log('📍 Current Date:', new Date().toISOString().split('T')[0]);
    console.log('📍 Application URL: http://localhost:3000');
    
    const mockDb = createMockDatabase();
    
    // Display all tables
    displayTable('USERS', mockDb.users);
    displayTable('CATEGORIES', mockDb.categories);
    displayTable('PRODUCTS', mockDb.products);
    displayTable('PROJECTS', mockDb.projects);
    displayTable('CONTACT_MESSAGES', mockDb.contact_messages);
    
    // Summary statistics
    console.log('\n📈 DATABASE STATISTICS:');
    console.log('='.repeat(30));
    console.log(`👥 Users: ${mockDb.users.length} (1 admin, ${mockDb.users.length - 1} registered)`);
    console.log(`🗂️  Categories: ${mockDb.categories.length}`);
    console.log(`📦 Products/Services: ${mockDb.products.length}`);
    console.log(`🏢 Projects: ${mockDb.projects.length}`);
    console.log(`💬 Contact Messages: ${mockDb.contact_messages.length}`);
    
    // Project status breakdown
    const projectStatuses = mockDb.projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    
    console.log('\n📊 Project Status Breakdown:');
    Object.keys(projectStatuses).forEach(status => {
        console.log(`   ${status}: ${projectStatuses[status]}`);
    });
    
    // Message status breakdown
    const messageStatuses = mockDb.contact_messages.reduce((acc, message) => {
        acc[message.status] = (acc[message.status] || 0) + 1;
        return acc;
    }, {});
    
    console.log('\n📧 Message Status Breakdown:');
    Object.keys(messageStatuses).forEach(status => {
        console.log(`   ${status}: ${messageStatuses[status]}`);
    });
    
    console.log('\n✅ Database inspection completed!');
    console.log('\n💡 Note: This shows the expected data structure.');
    console.log('   Actual data may vary based on user interactions with the application.');
}

main();
