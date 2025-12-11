/**
 * Debug test - sends data and shows response structure
 */

const http = require('http');

const testData = {
  text: "John Doe, Email: john@example.com, Phone: 555-1234, Skills: React, Node.js, Experience: 5 years as Software Engineer, Education: Bachelor in Computer Science"
};

console.log('📤 Sending this data:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n---\n');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook/parse-resume',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`📥 Response Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('📋 Full Response Structure:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
