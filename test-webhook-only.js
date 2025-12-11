const http = require('http');

// Just test if webhook responds
const testData = { test: "hello" };
const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook-test/evaluate-candidate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing webhook response...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => { 
    data += chunk; 
    console.log('Got data chunk');
  });
  
  res.on('end', () => {
    console.log('Response complete');
    console.log('Data:', data);
  });
});

req.on('error', (e) => console.error('Error:', e.message));

req.setTimeout(5000, () => {
  console.log('Timeout - webhook not responding');
  req.destroy();
});

req.write(postData);
req.end();