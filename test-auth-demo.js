// Test authentication with mock database
const axios = require('axios').default;

async function testLogin() {
    try {
        // Test admin login
        console.log('Testing admin login...');
        const response = await axios.post('http://localhost:3000/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400; // Accept redirects
            }
        });
        
        console.log('Admin login response status:', response.status);
        console.log('Admin login response headers:', response.headers.location || 'No redirect');
        
        // Test regular user login
        console.log('\nTesting testuser login...');
        const response2 = await axios.post('http://localhost:3000/login', {
            username: 'testuser', 
            password: 'hello'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400;
            }
        });
        
        console.log('Testuser login response status:', response2.status);
        console.log('Testuser login response headers:', response2.headers.location || 'No redirect');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

testLogin();
