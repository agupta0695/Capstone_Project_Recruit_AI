/**
 * Test to see what data the webhook receives
 */

const http = require('http');

// Very simple test data
const testData = {
  text: "John Doe, john@example.com, 555-1234, React Developer with 5 years experience"
};

const postData = JSON.stringify(testData);

console.log('📤 Sending data:');
console.log(testData);
console.log('\n');

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
  console.log(`📥 Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
