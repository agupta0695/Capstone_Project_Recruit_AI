const http = require('http');

// Minimal test data
const testData = {
  candidateProfile: {
    name: 'John Doe',
    skills: ['React', 'Node.js'],
    experience: '5 years'
  },
  jobRequirements: {
    title: 'Developer',
    requiredSkills: ['React', 'Node.js'],
    experienceLevel: 'Senior'
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
  }
};

console.log('🧪 Minimal evaluator test...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => { 
    data += chunk; 
    console.log('Receiving data...');
  });
  
  res.on('end', () => {
    console.log('\nResponse length:', data.length);
    console.log('Response:', data.substring(0, 200));
    
    if (data.length > 0) {
      try {
        const result = JSON.parse(data);
        console.log('\n✅ Success! Got evaluation data');
      } catch (e) {
        console.log('\n❌ Invalid JSON response');
      }
    } else {
      console.log('\n⚠️ Empty response');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

// Set timeout
req.setTimeout(30000, () => {
  console.log('\n⏰ Request timed out after 30 seconds');
  req.destroy();
});

req.write(postData);
req.end();