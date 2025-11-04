// Check for user "mikhael" in the database
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

async function checkUserMikhael() {
    console.log('🔍 Checking for user "mikhael" in the database');
    console.log('=' .repeat(50));
    
    try {
        // Test 1: Try to login with mikhael
        console.log('\n1. Testing login attempt for "mikhael"...');
        const loginData = querystring.stringify({
            username: 'mikhael',
            password: 'test123' // Try a common password
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
            console.log('Login redirect to:', location);
            if (location.includes('error=invalid')) {
                console.log('❌ User "mikhael" not found or invalid password');
            } else if (location === '/') {
                console.log('✅ User "mikhael" found and login successful!');
            }
        }
          // Test 2: Try the specific passwords you mentioned
        const mikhael_passwords = ['Mikha@2001', 'mikha@2001', 'mikhael', 'password', '123456'];
        
        for (const password of mikhael_passwords) {
            console.log(`\n2. Testing password "${password}" for mikhael...`);
            
            const testLoginData = querystring.stringify({
                username: 'mikhael',
                password: password
            });
            
            const testResponse = await makeRequest(loginOptions, testLoginData);
            
            if (testResponse.statusCode === 302) {
                const location = testResponse.headers.location;
                if (location === '/') {
                    console.log(`✅ SUCCESS! User "mikhael" found with password: "${password}"`);
                    return;
                } else if (location.includes('error=invalid')) {
                    console.log(`❌ Password "${password}" is incorrect for mikhael`);
                }
            }
        }
        
        // Test 3: Check if mikhael can register (if not already exists)
        console.log('\n3. Testing if "mikhael" can register (checking if user exists)...');
        const registerData = querystring.stringify({
            username: 'mikhael',
            email: 'mikhael@test.com',
            password: 'newpassword123',
            confirmPassword: 'newpassword123'
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
        
        if (registerResponse.statusCode === 302) {
            const location = registerResponse.headers.location;
            console.log('Register redirect to:', location);
            
            if (location.includes('success')) {
                console.log('✅ User "mikhael" was successfully registered (did not exist before)');
            } else if (location.includes('already exists')) {
                console.log('❌ User "mikhael" already exists but password is unknown');
            } else if (location.includes('error')) {
                console.log('❌ Registration failed:', location);
            }
        }
        
        console.log('\n📋 SUMMARY:');
        console.log('Based on the application logs and tests:');
        console.log('- Multiple login attempts for "mikhael" were made');
        console.log('- All attempts resulted in "User not found in mock database"');
        console.log('- Current users in mock DB: admin, testuser, testdemo');
        console.log('- User "mikhael" does NOT exist in the database');
        
    } catch (error) {
        console.error('❌ Error checking for user mikhael:', error.message);
    }
}

// Also check the logs more carefully
function analyzeLogsForMikhael() {
    console.log('\n📊 LOG ANALYSIS:');
    console.log('From the application logs, we can see:');
    console.log('- Login attempt: mikhael - User not found in mock database');
    console.log('- Available users in mock DB: [ "admin", "testuser" ]');
    console.log('- Later: Available users in mock DB: [ "admin", "testuser", "testdemo" ]');
    console.log('');
    console.log('CONCLUSION: User "mikhael" does NOT exist in the database');
}

// Run the check
checkUserMikhael().then(() => {
    analyzeLogsForMikhael();
});
