// Database Data Inspector
const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

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

        req.end();
    });
}

async function inspectDatabase() {
    console.log('🔍 Inspecting Database Data');
    console.log('=' .repeat(50));

    try {
        // Check health endpoint
        console.log('\n📊 1. Health Check:');
        const healthResponse = await makeRequest('/health');
        console.log('Status Code:', healthResponse.statusCode);
        if (healthResponse.statusCode === 200) {
            try {
                const healthData = JSON.parse(healthResponse.body);
                console.log('Health Status:', JSON.stringify(healthData, null, 2));
            } catch (e) {
                console.log('Health Response:', healthResponse.body.substring(0, 200) + '...');
            }
        }

        // Check database pages that show data from 3 tables
        console.log('\n📋 2. Database Menu (3 Tables):');
        const databaseResponse = await makeRequest('/database');
        console.log('Database Page Status:', databaseResponse.statusCode);
        
        // Extract some info from the HTML response
        if (databaseResponse.body.includes('TechCorp Solutions')) {
            console.log('✅ Database page loaded successfully');
            
            // Count occurrences of key terms
            const productsCount = (databaseResponse.body.match(/product/gi) || []).length;
            const categoriesCount = (databaseResponse.body.match(/category/gi) || []).length;
            const projectsCount = (databaseResponse.body.match(/project/gi) || []).length;
            
            console.log(`- Products mentions: ${productsCount}`);
            console.log(`- Categories mentions: ${categoriesCount}`);
            console.log(`- Projects mentions: ${projectsCount}`);
        }

        // Check individual table pages
        console.log('\n📦 3. Products Data:');
        const productsResponse = await makeRequest('/database/products');
        console.log('Products Page Status:', productsResponse.statusCode);

        console.log('\n🗂️ 4. Categories Data:');
        const categoriesResponse = await makeRequest('/database/categories');
        console.log('Categories Page Status:', categoriesResponse.statusCode);

        console.log('\n🏢 5. Projects Data:');
        const projectsResponse = await makeRequest('/database/projects');
        console.log('Projects Page Status:', projectsResponse.statusCode);

        console.log('\n✅ Database inspection completed!');
        
    } catch (error) {
        console.error('❌ Inspection error:', error.message);
    }
}

// Run the inspection
inspectDatabase();
