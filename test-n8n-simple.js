/**
 * Simple test without callback - just tests AI parsing
 */

const http = require('http');

const testData = {
  sessionId: 'test-' + Date.now(),
  text: `John Doe
Email: john.doe@example.com
Phone: 555-1234

SKILLS
React, Node.js, TypeScript

EXPERIENCE
5 years as Software Engineer

EDUCATION
Bachelor in Computer Science`
};

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

console.log('🧪 Simple test - AI parsing only\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Parsed Resume:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
