const http = require('http');

const testData = {
  candidateProfile: {
    name: 'John Doe',
    skills: ['React', 'Node.js'],
    experience: '5 years'
  },
  jobRequirements: {
    title: 'Developer',
    requiredSkills: ['React', 'Node.js']
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook-test/evaluate-candidate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};

console.log('Testing evaluator...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data.substring(0, 500));
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.on('timeout', () => {
  console.log('Request timed out');
  req.destroy();
});

req.write(postData);
req.end();
