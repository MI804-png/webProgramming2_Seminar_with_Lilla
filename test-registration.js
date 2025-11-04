// Test registration functionality
const http = require('http');
const querystring = require('querystring');

// Test data for registration
const testUser = {
    username: 'newuser',
    email: 'newuser@test.com',
    password: 'password123',
    confirmPassword: 'password123'
};

// Create POST data
const postData = querystring.stringify(testUser);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing registration with user:', testUser.username);

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 302) {
            console.log('Registration redirect to:', res.headers.location);
            if (res.headers.location.includes('success')) {
                console.log('✅ Registration successful!');
            } else {
                console.log('❌ Registration failed:', res.headers.location);
            }
        } else {
            console.log('Response body:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
