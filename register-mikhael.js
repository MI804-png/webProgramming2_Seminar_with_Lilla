// Register user "mikhael" with password "Mikha@2001"
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

async function registerMikhael() {
    console.log('👤 Registering user "mikhael" with password "Mikha@2001"');
    console.log('=' .repeat(60));
    
    try {
        // Register mikhael
        console.log('\n1. Attempting to register user "mikhael"...');
        const registerData = querystring.stringify({
            username: 'mikhael',
            email: 'mikhael@techcorp.com',
            password: 'Mikha@2001',
            confirmPassword: 'Mikha@2001'
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
        console.log('Registration Status Code:', registerResponse.statusCode);
        
        if (registerResponse.statusCode === 302) {
            const location = registerResponse.headers.location;
            console.log('Registration redirect to:', location);
            
            if (location.includes('success')) {
                console.log('✅ SUCCESS! User "mikhael" registered successfully!');
            } else if (location.includes('error')) {
                console.log('❌ Registration failed:', decodeURIComponent(location));
                return;
            }
        }
        
        // Now test login
        console.log('\n2. Testing login for newly registered user "mikhael"...');
        const loginData = querystring.stringify({
            username: 'mikhael',
            password: 'Mikha@2001'
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
        console.log('Login Status Code:', loginResponse.statusCode);
        
        if (loginResponse.statusCode === 302) {
            const location = loginResponse.headers.location;
            console.log('Login redirect to:', location);
            
            if (location === '/') {
                console.log('✅ SUCCESS! User "mikhael" can now login with password "Mikha@2001"');
                console.log('');
                console.log('🎉 REGISTRATION AND LOGIN COMPLETED SUCCESSFULLY!');
                console.log('');
                console.log('📋 Login credentials for mikhael:');
                console.log('   Username: mikhael');
                console.log('   Password: Mikha@2001');
                console.log('   Role: registered');
                console.log('');
                console.log('🌐 You can now login at: http://localhost:3000/login');
            } else if (location.includes('error')) {
                console.log('❌ Login failed:', decodeURIComponent(location));
            }
        }
        
    } catch (error) {
        console.error('❌ Error during registration/login:', error.message);
    }
}

// Run the registration
registerMikhael();
