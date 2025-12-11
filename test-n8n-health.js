const http = require('http');

// Test if n8n is running
const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/',
  method: 'GET'
};

console.log('Testing n8n health...');

const req = http.request(options, (res) => {
  console.log(`✅ n8n is running - Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('n8n responded successfully');
  });
});

req.on('error', (e) => {
  console.error('❌ n8n not accessible:', e.message);
  console.log('💡 Check if Docker container is running');
});

req.setTimeout(5000, () => {
  console.log('⏰ n8n not responding (timeout)');
  req.destroy();
});

req.end();