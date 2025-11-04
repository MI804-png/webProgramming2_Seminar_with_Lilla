// Test script to verify registration and login functionality
const http = require('http');
const querystring = require('querystring');

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testRegistrationAndLogin() {
    console.log('🚀 Testing Registration and Login Functionality');
    
    try {
        // Test 1: Register a new user
        console.log('\n1. Testing user registration...');
        const registerData = querystring.stringify({
            username: 'testdemo',
            email: 'testdemo@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        });
        
        const registerOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(registerData)
            }
        };
        
        const registerResponse = await makeRequest(registerOptions, registerData);
        console.log('Register Response Status:', registerResponse.statusCode);
        
        if (registerResponse.statusCode === 302) {
            const location = registerResponse.headers.location;
            console.log('✅ Registration redirect to:', location);
            if (location.includes('success')) {
                console.log('✅ Registration successful!');
            } else if (location.includes('error')) {
                console.log('❌ Registration failed with error:', location);
            }
        }
        
        // Test 2: Login with the registered user
        console.log('\n2. Testing user login...');
        const loginData = querystring.stringify({
            username: 'testdemo',
            password: 'password123'
        });
        
        const loginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };
        
        const loginResponse = await makeRequest(loginOptions, loginData);
        console.log('Login Response Status:', loginResponse.statusCode);
        
        if (loginResponse.statusCode === 302) {
            const location = loginResponse.headers.location;
            console.log('✅ Login redirect to:', location);
            if (location === '/') {
                console.log('✅ Login successful! Redirected to home page');
            } else if (location.includes('error')) {
                console.log('❌ Login failed with error:', location);
            }
        }
        
        // Test 3: Login with default admin user
        console.log('\n3. Testing admin login...');
        const adminLoginData = querystring.stringify({
            username: 'admin',
            password: 'admin123'
        });
        
        const adminLoginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(adminLoginData)
            }
        };
        
        const adminLoginResponse = await makeRequest(adminLoginOptions, adminLoginData);
        console.log('Admin Login Response Status:', adminLoginResponse.statusCode);
        
        if (adminLoginResponse.statusCode === 302) {
            const location = adminLoginResponse.headers.location;
            console.log('✅ Admin login redirect to:', location);
            if (location === '/') {
                console.log('✅ Admin login successful!');
            } else if (location.includes('error')) {
                console.log('❌ Admin login failed with error:', location);
            }
        }
        
        console.log('\n✅ All authentication tests completed!');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run the test
testRegistrationAndLogin();
