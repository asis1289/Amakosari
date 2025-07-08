const https = require('https');

async function testAdminAccess() {
  try {
    console.log('🧪 Testing admin access key verification...\n');

    // Test with the correct password
    console.log('Testing with correct password: Vita_89129');
    
    const data1 = JSON.stringify({ accessKey: 'Vita_89129' });
    const options1 = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/verify-access-key',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data1.length
      }
    };

    const req1 = https.request(options1, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Response:', JSON.parse(data));
        console.log('');
        
        // Test with wrong password
        console.log('Testing with wrong password: wrongpassword');
        const data2 = JSON.stringify({ accessKey: 'wrongpassword' });
        const options2 = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/auth/verify-access-key',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data2.length
          }
        };

        const req2 = https.request(options2, (res2) => {
          let data2 = '';
          res2.on('data', (chunk) => {
            data2 += chunk;
          });
          res2.on('end', () => {
            console.log('Response:', JSON.parse(data2));
          });
        });

        req2.on('error', (e) => {
          console.error('Error:', e);
        });

        req2.write(data2);
        req2.end();
      });
    });

    req1.on('error', (e) => {
      console.error('Error:', e);
    });

    req1.write(data1);
    req1.end();

  } catch (error) {
    console.error('❌ Error testing admin access:', error);
  }
}

// Run the test
testAdminAccess(); 