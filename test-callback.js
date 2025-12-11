/**
 * Test the Next.js callback endpoint directly
 */

const http = require('http');

const testData = {
  success: true,
  data: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-1234",
    skills: ["React", "Node.js"],
    experience: 5
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/resumes/callback',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Next.js callback endpoint...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  
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
